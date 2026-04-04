using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles.BookImport;
using NzbDrone.Core.MediaFiles.BookImport.Identification;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.MetadataSource.Goodreads;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MediaFiles.BookImport.Identification
{
    [TestFixture]
    public class CandidateServiceFixture : CoreTest<CandidateService>
    {
        [Test]
        public void should_not_throw_on_goodreads_exception()
        {
            Mocker.GetMock<ISearchForNewBook>()
                .Setup(s => s.SearchForNewBook(It.IsAny<string>(), It.IsAny<string>(), true))
                .Throws(new GoodreadsException("Bad search"));

            var edition = new LocalEdition
            {
                LocalBooks = new List<LocalBook>
                {
                    new LocalBook
                    {
                        FileTrackInfo = new ParsedTrackInfo
                        {
                            Authors = new List<string> { "Author" },
                            BookTitle = "Book"
                        }
                    }
                }
            };

            Subject.GetRemoteCandidates(edition, null).Should().BeEmpty();
        }

        [Test]
        public void should_search_remotely_when_author_override_is_present_and_title_only_exists_in_download_client_info()
        {
            var author = new Author
            {
                Id = 1,
                Name = "Isaac Asimov",
                AuthorMetadataId = 10,
                Metadata = new AuthorMetadata
                {
                    Id = 10,
                    Name = "Isaac Asimov"
                }
            };

            var expectedBook = new Book
            {
                Id = 907,
                Title = "Greetings, Carbon-Based Bipeds!",
                ForeignBookId = "book-907",
                AuthorMetadataId = author.AuthorMetadataId,
                Author = author,
                Editions = new List<Edition>
                {
                    new ()
                    {
                        Id = 500,
                        BookId = 907,
                        ForeignEditionId = "edition-500",
                        Title = "Greetings, Carbon-Based Bipeds!",
                        Monitored = true
                    }
                }
            };

            expectedBook.Editions.Value.ForEach(x => x.Book = expectedBook);

            Mocker.GetMock<ISearchForNewBook>()
                .Setup(s => s.SearchForNewBook("Greetings, Carbon-Based Bipeds!", "Isaac Asimov", true))
                .Returns(new List<Book> { expectedBook });

            var edition = new LocalEdition
            {
                LocalBooks = new List<LocalBook>
                {
                    new ()
                    {
                        FileTrackInfo = new ParsedTrackInfo(),
                        DownloadClientBookInfo = new ParsedBookInfo
                        {
                            AuthorName = "Isaac Asimov",
                            BookTitle = "Greetings, Carbon-Based Bipeds!"
                        }
                    }
                }
            };

            var results = Subject.GetRemoteCandidates(edition, new IdentificationOverrides { Author = author }).ToList();

            results.Should().ContainSingle();
            results.Single().Edition.ForeignEditionId.Should().Be("edition-500");
        }
    }
}
