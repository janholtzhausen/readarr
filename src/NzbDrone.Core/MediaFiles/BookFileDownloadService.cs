using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Processes;
using NzbDrone.Core.Books.Calibre;
using NzbDrone.Core.RootFolders;

namespace NzbDrone.Core.MediaFiles
{
    public class BookFileDownload
    {
        public string Path { get; set; }
        public string FileName { get; set; }
    }

    public interface IBookFileDownloadService
    {
        bool CanConvertToFormat(BookFile bookFile, string format);
        BookFileDownload PrepareDownload(int bookFileId, string format = null);
    }

    public class BookFileDownloadService : IBookFileDownloadService
    {
        private readonly IMediaFileService _mediaFileService;
        private readonly IRootFolderService _rootFolderService;
        private readonly ICalibreProxy _calibreProxy;
        private readonly IDiskProvider _diskProvider;
        private readonly IAppFolderInfo _appFolderInfo;
        private readonly IProcessProvider _processProvider;
        private readonly Logger _logger;

        public BookFileDownloadService(
            IMediaFileService mediaFileService,
            IRootFolderService rootFolderService,
            ICalibreProxy calibreProxy,
            IDiskProvider diskProvider,
            IAppFolderInfo appFolderInfo,
            IProcessProvider processProvider,
            Logger logger)
        {
            _mediaFileService = mediaFileService;
            _rootFolderService = rootFolderService;
            _calibreProxy = calibreProxy;
            _diskProvider = diskProvider;
            _appFolderInfo = appFolderInfo;
            _processProvider = processProvider;
            _logger = logger;
        }

        public bool CanConvertToFormat(BookFile bookFile, string format)
        {
            if (bookFile == null || format.IsNullOrWhiteSpace())
            {
                return false;
            }

            if (!Enum.TryParse<CalibreFormat>(format, true, out var calibreFormat) ||
                calibreFormat == CalibreFormat.None)
            {
                return false;
            }

            if (!MediaFileExtensions.TextExtensions.Contains(Path.GetExtension(bookFile.Path)))
            {
                return false;
            }

            if (HasRemoteCalibre(bookFile))
            {
                return true;
            }

            return HasLocalConverter();
        }

        public BookFileDownload PrepareDownload(int bookFileId, string format = null)
        {
            var bookFile = _mediaFileService.Get(bookFileId);

            if (bookFile == null)
            {
                throw new FileNotFoundException("Book file not found.");
            }

            if (!_diskProvider.FileExists(bookFile.Path))
            {
                throw new FileNotFoundException($"Book file '{bookFile.Path}' does not exist.");
            }

            if (format.IsNullOrWhiteSpace())
            {
                return new BookFileDownload
                {
                    Path = bookFile.Path,
                    FileName = Path.GetFileName(bookFile.Path)
                };
            }

            var targetFormat = format.Trim().ToUpperInvariant();
            var sourceFormat = Path.GetExtension(bookFile.Path).TrimStart('.').ToUpperInvariant();

            if (targetFormat == sourceFormat)
            {
                return new BookFileDownload
                {
                    Path = bookFile.Path,
                    FileName = Path.GetFileName(bookFile.Path)
                };
            }

            if (!CanConvertToFormat(bookFile, targetFormat))
            {
                throw new InvalidOperationException($"Conversion to {targetFormat} is not available for this book file.");
            }

            string convertedPath;

            if (HasRemoteCalibre(bookFile))
            {
                var rootFolder = _rootFolderService.GetBestRootFolder(bookFile.Path);
                convertedPath = _calibreProxy.GetOrCreateFormatPath(bookFile.CalibreId, sourceFormat, targetFormat, rootFolder.CalibreSettings);
            }
            else
            {
                convertedPath = ConvertLocally(bookFile, targetFormat);
            }

            if (!_diskProvider.FileExists(convertedPath))
            {
                throw new FileNotFoundException($"Converted file '{convertedPath}' does not exist.");
            }

            _logger.Info("Prepared converted download for book file {0} as {1}", bookFile.Id, targetFormat);

            return new BookFileDownload
            {
                Path = convertedPath,
                FileName = Path.ChangeExtension(Path.GetFileName(bookFile.Path), targetFormat.ToLowerInvariant())
            };
        }

        private bool HasRemoteCalibre(BookFile bookFile)
        {
            if (bookFile.CalibreId <= 0)
            {
                return false;
            }

            var rootFolder = _rootFolderService.GetBestRootFolder(bookFile.Path);

            return rootFolder?.IsCalibreLibrary == true &&
                   rootFolder.CalibreSettings != null;
        }

        private bool HasLocalConverter()
        {
            return _diskProvider.FileExists("/usr/bin/ebook-convert") ||
                   _diskProvider.FileExists("/usr/local/bin/ebook-convert");
        }

        private string ConvertLocally(BookFile bookFile, string targetFormat)
        {
            if (!HasLocalConverter())
            {
                throw new InvalidOperationException("Local ebook conversion is not available in this Readarr instance.");
            }

            var tempFolder = Path.Combine(_appFolderInfo.TempFolder, "readarr-book-downloads", bookFile.Id.ToString());
            _diskProvider.EnsureFolder(tempFolder);

            var outputPath = Path.Combine(tempFolder, Path.ChangeExtension(Path.GetFileName(bookFile.Path), targetFormat.ToLowerInvariant()));

            if (_diskProvider.FileExists(outputPath))
            {
                _diskProvider.DeleteFile(outputPath);
            }

            var args = $"\"{bookFile.Path}\" \"{outputPath}\"";
            var output = _processProvider.StartAndCapture("/usr/bin/ebook-convert", args);

            if (output.ExitCode != 0 || !_diskProvider.FileExists(outputPath))
            {
                var error = string.Join(Environment.NewLine, output.Error.ConvertAll(v => v.Content));
                if (error.IsNullOrWhiteSpace())
                {
                    error = string.Join(Environment.NewLine, output.Standard.ConvertAll(v => v.Content));
                }

                throw new InvalidOperationException($"Local ebook conversion failed: {error}".Trim());
            }

            _logger.Info("Prepared locally converted download for book file {0} as {1}", bookFile.Id, targetFormat);

            return outputPath;
        }
    }
}
