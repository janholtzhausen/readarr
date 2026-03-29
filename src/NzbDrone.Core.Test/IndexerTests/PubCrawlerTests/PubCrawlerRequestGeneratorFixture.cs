using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Indexers.PubCrawler;
using NzbDrone.Core.IndexerSearch.Definitions;

namespace NzbDrone.Core.Test.IndexerTests.PubCrawlerTests
{
    [TestFixture]
    public class PubCrawlerRequestGeneratorFixture
    {
        [Test]
        public void should_search_all_enabled_pubcrawler_sources()
        {
            var settings = new PubCrawlerSettings
            {
                PubcrawlerUrl = "http://127.0.0.1:18080/"
            };

            var subject = new PubCrawlerRequestGenerator(settings);

            var criteria = new BookSearchCriteria
            {
                Author = new NzbDrone.Core.Books.Author { Name = "Isaac Asimov" },
                BookTitle = "Isaac Asimov"
            };

            var results = subject.GetSearchRequests(criteria);
            var page = results.GetAllTiers().First().First();

            page.Url.FullUri.Should().StartWith("http://127.0.0.1:18080/v1/search?query=");
            page.Url.FullUri.Should().EndWith("&recent=false");
        }
    }
}
