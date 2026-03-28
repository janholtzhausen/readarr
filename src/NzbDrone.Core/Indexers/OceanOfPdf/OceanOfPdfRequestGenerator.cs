using System;
using NzbDrone.Common.Http;
using NzbDrone.Core.IndexerSearch.Definitions;

namespace NzbDrone.Core.Indexers.OceanOfPdf
{
    public class OceanOfPdfRequestGenerator : IIndexerRequestGenerator
    {
        private readonly OceanOfPdfSettings _settings;

        public OceanOfPdfRequestGenerator(OceanOfPdfSettings settings)
        {
            _settings = settings;
        }

        public IndexerPageableRequestChain GetRecentRequests()
        {
            var pageableRequests = new IndexerPageableRequestChain();
            pageableRequests.Add(new[] { BuildRequest(BuildPubcrawlerUrl(recent: true)) });
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
            pageableRequests.Add(new[] { BuildRequest(BuildPubcrawlerUrl(query: searchTerm ?? string.Empty)) });
            return pageableRequests;
        }

        private string BuildPubcrawlerUrl(string query = "", bool recent = false)
        {
            var pubcrawler = (_settings.PubcrawlerUrl ?? string.Empty).TrimEnd('/');
            var encodedQuery = Uri.EscapeDataString(query ?? string.Empty);
            return $"{pubcrawler}/v1/search/oceanofpdf?query={encodedQuery}&recent={recent.ToString().ToLowerInvariant()}";
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
