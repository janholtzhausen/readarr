using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Download.Clients.Blackhole;
using NzbDrone.Core.Http.CloudFlare;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RemotePathMappings;

namespace NzbDrone.Core.Download.Clients.DirectDownload
{
    public class DirectDownloadBlackhole : DownloadClientBase<DirectDownloadBlackholeSettings>
    {
        private const string FlareSolverrHeader = "X-FlareSolverr-Url";

        private readonly IHttpClient _httpClient;
        private readonly IFlareSolverrProxy _flareSolverrProxy;
        private readonly IScanWatchFolder _scanWatchFolder;

        public TimeSpan ScanGracePeriod { get; set; }

        public override string Name => "Direct Download Blackhole";
        public override DownloadProtocol Protocol => DownloadProtocol.DirectDownload;

        public DirectDownloadBlackhole(IHttpClient httpClient,
                                       IFlareSolverrProxy flareSolverrProxy,
                                       IScanWatchFolder scanWatchFolder,
                                       IConfigService configService,
                                       IDiskProvider diskProvider,
                                       IRemotePathMappingService remotePathMappingService,
                                       Logger logger)
            : base(configService, diskProvider, remotePathMappingService, logger)
        {
            _httpClient = httpClient;
            _flareSolverrProxy = flareSolverrProxy;
            _scanWatchFolder = scanWatchFolder;
            ScanGracePeriod = TimeSpan.FromSeconds(30);
        }

        public override async Task<string> Download(RemoteBook remoteBook, IIndexer indexer)
        {
            var request = indexer?.GetDownloadRequest(remoteBook.Release.DownloadUrl) ?? new HttpRequest(remoteBook.Release.DownloadUrl);

            _logger.Debug("Downloading direct file from: {0}", request.Url);

            var flareSolverrUrl = request.Headers.GetSingleValue(FlareSolverrHeader);

            if (flareSolverrUrl.IsNotNullOrWhiteSpace())
            {
                request.Headers.Remove(FlareSolverrHeader);
            }

            var response = flareSolverrUrl.IsNotNullOrWhiteSpace()
                ? _flareSolverrProxy.Execute(request, flareSolverrUrl, download: true)
                : await _httpClient.ExecuteAsync(request);
            var fileName = GetFileName(remoteBook, request, response);
            var outputPath = Path.Combine(Settings.DownloadFolder, fileName);

            _logger.Debug("Saving direct file to: {0}", outputPath);

            await using (var stream = _diskProvider.OpenWriteStream(outputPath))
            {
                await stream.WriteAsync(response.ResponseData, 0, response.ResponseData.Length);
            }

            _logger.Debug("Direct download succeeded, saved to: {0}", outputPath);

            return $"{Definition.Name}_{fileName}_{_diskProvider.FileGetLastWrite(outputPath).Ticks}";
        }

        public override IEnumerable<DownloadClientItem> GetItems()
        {
            foreach (var item in _scanWatchFolder.GetItems(Settings.WatchFolder, ScanGracePeriod))
            {
                yield return new DownloadClientItem
                {
                    DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                    DownloadId = $"{Definition.Name}_{item.DownloadId}",
                    Category = "Readarr",
                    Title = item.Title,
                    TotalSize = item.TotalSize,
                    RemainingTime = item.RemainingTime,
                    OutputPath = item.OutputPath,
                    Status = item.Status,
                    CanMoveFiles = !Settings.ReadOnly,
                    CanBeRemoved = !Settings.ReadOnly
                };
            }
        }

        public override void RemoveItem(DownloadClientItem item, bool deleteData)
        {
            if (!deleteData)
            {
                throw new NotSupportedException("Direct Download Blackhole cannot remove DownloadItem without deleting the data as well, ignoring.");
            }

            DeleteItemData(item);
        }

        public override DownloadClientInfo GetStatus()
        {
            return new DownloadClientInfo
            {
                IsLocalhost = true,
                OutputRootFolders = new List<OsPath> { new (Settings.WatchFolder) }
            };
        }

        protected override void Test(List<ValidationFailure> failures)
        {
            failures.AddIfNotNull(TestFolder(Settings.DownloadFolder, "DownloadFolder"));
            failures.AddIfNotNull(TestFolder(Settings.WatchFolder, "WatchFolder"));
        }

        private string GetFileName(RemoteBook remoteBook, HttpRequest request, HttpResponse response)
        {
            var contentDisposition = response.Headers.GetSingleValue("Content-Disposition");

            if (ContentDispositionHeaderValue.TryParse(contentDisposition, out var header) &&
                !header.FileNameStar.IsNullOrWhiteSpace())
            {
                return header.FileNameStar.Trim('"');
            }

            if (ContentDispositionHeaderValue.TryParse(contentDisposition, out header) &&
                !header.FileName.IsNullOrWhiteSpace())
            {
                return header.FileName.Trim('"');
            }

            var uri = new Uri(request.Url.FullUri);
            var query = ParseQuery(uri.Query);

            if (query.TryGetValue("filename", out var encodedFileName) && !encodedFileName.IsNullOrWhiteSpace())
            {
                return encodedFileName;
            }

            var extension = Path.GetExtension(uri.AbsolutePath);

            if (extension.IsNullOrWhiteSpace())
            {
                extension = remoteBook.Release.Container.IsNullOrWhiteSpace()
                    ? ".bin"
                    : "." + remoteBook.Release.Container.Trim('.').ToLowerInvariant();
            }

            return FileNameBuilder.CleanFileName(remoteBook.Release.Title) + extension;
        }

        private static Dictionary<string, string> ParseQuery(string query)
        {
            return query.TrimStart('?')
                        .Split('&', StringSplitOptions.RemoveEmptyEntries)
                        .Select(part => part.Split('=', 2))
                        .ToDictionary(
                            part => Uri.UnescapeDataString(part[0]),
                            part => part.Length > 1 ? Uri.UnescapeDataString(part[1]) : string.Empty,
                            StringComparer.OrdinalIgnoreCase);
        }
    }
}
