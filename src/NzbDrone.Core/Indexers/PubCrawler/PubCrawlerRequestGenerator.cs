using System;
using NzbDrone.Common.Http;
using NzbDrone.Core.IndexerSearch.Definitions;

namespace NzbDrone.Core.Indexers.PubCrawler
{
    public class PubCrawlerRequestGenerator : IIndexerRequestGenerator
    {
        private readonly PubCrawlerSettings _settings;

        public PubCrawlerRequestGenerator(PubCrawlerSettings settings)
        {
            _settings = settings;
        }

        public IndexerPageableRequestChain GetRecentRequests()
        {
            var pageableRequests = new IndexerPageableRequestChain();
            pageableRequests.Add(new[] { BuildRequest(BuildPubCrawlerUrl(recent: true)) });
            return pageableRequests;
        }

        public IndexerPageableRequestChain GetSearchRequests(BookSearchCriteria searchCriteria)
        {
            return BuildSearchChain(searchCriteria?.BookQuery ?? searchCriteria?.BookTitle);
        }

        public IndexerPageableRequestChain GetSearchRequests(AuthorSearchCriteria searchCriteria)
        {
            return BuildSearchChain(searchCriteria?.Author?.Name);
        }

        private IndexerPageableRequestChain BuildSearchChain(string searchTerm)
        {
            var pageableRequests = new IndexerPageableRequestChain();
            pageableRequests.Add(new[] { BuildRequest(BuildPubCrawlerUrl(query: searchTerm ?? string.Empty)) });
            return pageableRequests;
        }

        private string BuildPubCrawlerUrl(string query = "", bool recent = false)
        {
            var pubcrawler = (_settings.PubcrawlerUrl ?? string.Empty).TrimEnd('/');
            var encodedQuery = Uri.EscapeDataString(query ?? string.Empty);
            var sourceId = Uri.EscapeDataString((_settings.Source ?? "archiveorg").Trim());
            return $"{pubcrawler}/v1/search/{sourceId}?query={encodedQuery}&recent={recent.ToString().ToLowerInvariant()}";
        }

        private static IndexerRequest BuildRequest(string url)
        {
            var request = new HttpRequest(url, HttpAccept.Json);
            request.AllowAutoRedirect = true;
            request.UseSimplifiedUserAgent = false;
            return new IndexerRequest(request);
        }
    }
}
