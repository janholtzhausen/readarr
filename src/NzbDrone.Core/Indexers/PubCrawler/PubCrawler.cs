using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.Indexers.PubCrawler
{
    public class PubCrawler : HttpIndexerBase<PubCrawlerSettings>
    {
        public override string Name => "PubCrawler";
        public override DownloadProtocol Protocol => DownloadProtocol.DirectDownload;
        public override TimeSpan RateLimit => TimeSpan.FromSeconds(2);

        public PubCrawler(IHttpClient httpClient,
                          IIndexerStatusService indexerStatusService,
                          IConfigService configService,
                          IParsingService parsingService,
                          Logger logger)
            : base(httpClient, indexerStatusService, configService, parsingService, logger)
        {
        }

        public override IIndexerRequestGenerator GetRequestGenerator()
        {
            return new PubCrawlerRequestGenerator(Settings);
        }

        public override IParseIndexerResponse GetParser()
        {
            return new PubCrawlerParser(Settings);
        }

        public override HttpRequest GetDownloadRequest(string link)
        {
            return new HttpRequest(link)
            {
                AllowAutoRedirect = true,
                UseSimplifiedUserAgent = false
            };
        }

        protected override bool IsValidRelease(ReleaseInfo release)
        {
            return base.IsValidRelease(release) && !release.DownloadUrl.IsNullOrWhiteSpace();
        }

        private class PubCrawlerParser : IParseIndexerResponse
        {
            private readonly PubCrawlerSettings _settings;

            public PubCrawlerParser(PubCrawlerSettings settings)
            {
                _settings = settings;
            }

            public IList<ReleaseInfo> ParseResponse(IndexerResponse indexerResponse)
            {
                var response = Json.Deserialize<PubCrawlerSearchResponse>(indexerResponse.Content);
                var baseUrl = (_settings.PubcrawlerUrl ?? string.Empty).TrimEnd('/');

                return response.Results.Select(result => new ReleaseInfo
                {
                    Guid = result.Guid,
                    Title = result.Title,
                    Author = result.Author,
                    Book = result.Book,
                    InfoUrl = result.InfoUrl,
                    DownloadUrl = $"{baseUrl}{result.DownloadPath}",
                    Container = result.Container,
                    Size = result.Size,
                    PublishDate = result.PublishDate,
                    Source = result.Source
                }).ToList();
            }

            private class PubCrawlerSearchResponse
            {
                public List<PubCrawlerRelease> Results { get; set; } = new ();
            }

            private class PubCrawlerRelease
            {
                public string Guid { get; set; }
                public string Title { get; set; }
                public string Author { get; set; }
                public string Book { get; set; }
                public string InfoUrl { get; set; }
                public string DownloadPath { get; set; }
                public string Container { get; set; }
                public long Size { get; set; }
                public DateTime PublishDate { get; set; }
                public string Source { get; set; }
            }
        }
    }
}
