using System.Collections.Generic;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Books;
using NzbDrone.Core.Housekeeping.Housekeepers;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Housekeeping.Housekeepers
{
    [TestFixture]
    public class RefreshMissingMediaCoversFixture : CoreTest<RefreshMissingMediaCovers>
    {
        [Test]
        public void should_refresh_missing_author_cover()
        {
            var author = Builder<Author>.CreateNew()
                .With(x => x.Id = 2)
                .With(x => x.Metadata.Value.Images = new List<MediaCover.MediaCover>
                {
                    new MediaCover.MediaCover(MediaCoverTypes.Poster, "http://test.org/author.png")
                })
                .Build();

            Mocker.GetMock<IAuthorService>()
                .Setup(x => x.GetAllAuthors())
                .Returns(new List<Author> { author });

            Mocker.GetMock<IBookService>()
                .Setup(x => x.GetAllBooks())
                .Returns(new List<Book>());

            Mocker.GetMock<IMapCoversToLocal>()
                .Setup(x => x.GetCoverPath(author.Id, MediaCoverEntity.Author, MediaCoverTypes.Poster, ".png", null))
                .Returns("/covers/author-poster.png");

            Mocker.GetMock<IDiskProvider>()
                .Setup(x => x.FileExists("/covers/author-poster.png"))
                .Returns(false);

            Subject.Clean();

            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(x => x.EnsureAuthorCovers(author), Times.Once());
        }

        [Test]
        public void should_refresh_missing_book_cover()
        {
            var edition = Builder<Edition>.CreateNew()
                .With(x => x.Monitored = false)
                .With(x => x.Images = new List<MediaCover.MediaCover>
                {
                    new MediaCover.MediaCover(MediaCoverTypes.Cover, "http://test.org/book.png")
                })
                .Build();

            var book = Builder<Book>.CreateNew()
                .With(x => x.Id = 4)
                .With(x => x.Editions = new List<Edition> { edition })
                .Build();

            Mocker.GetMock<IAuthorService>()
                .Setup(x => x.GetAllAuthors())
                .Returns(new List<Author>());

            Mocker.GetMock<IBookService>()
                .Setup(x => x.GetAllBooks())
                .Returns(new List<Book> { book });

            Mocker.GetMock<IMapCoversToLocal>()
                .Setup(x => x.GetCoverPath(book.Id, MediaCoverEntity.Book, MediaCoverTypes.Cover, ".png", null))
                .Returns("/covers/book-cover.png");

            Mocker.GetMock<IDiskProvider>()
                .Setup(x => x.FileExists("/covers/book-cover.png"))
                .Returns(false);

            Subject.Clean();

            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(x => x.EnsureBookCovers(book), Times.Once());
        }

        [Test]
        public void should_not_refresh_when_cover_already_exists()
        {
            var author = Builder<Author>.CreateNew()
                .With(x => x.Id = 2)
                .With(x => x.Metadata.Value.Images = new List<MediaCover.MediaCover>
                {
                    new MediaCover.MediaCover(MediaCoverTypes.Poster, "http://test.org/author.png")
                })
                .Build();

            Mocker.GetMock<IAuthorService>()
                .Setup(x => x.GetAllAuthors())
                .Returns(new List<Author> { author });

            Mocker.GetMock<IBookService>()
                .Setup(x => x.GetAllBooks())
                .Returns(new List<Book>());

            Mocker.GetMock<IMapCoversToLocal>()
                .Setup(x => x.GetCoverPath(author.Id, MediaCoverEntity.Author, MediaCoverTypes.Poster, ".png", null))
                .Returns("/covers/author-poster.png");

            Mocker.GetMock<IDiskProvider>()
                .Setup(x => x.FileExists("/covers/author-poster.png"))
                .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                .Setup(x => x.GetFileSize("/covers/author-poster.png"))
                .Returns(1024);

            Subject.Clean();

            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(x => x.EnsureAuthorCovers(It.IsAny<Author>()), Times.Never());
        }
    }
}
