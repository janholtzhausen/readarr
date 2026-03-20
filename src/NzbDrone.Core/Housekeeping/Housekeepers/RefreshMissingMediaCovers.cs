using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;

namespace NzbDrone.Core.Housekeeping.Housekeepers
{
    public class RefreshMissingMediaCovers : IHousekeepingTask
    {
        private readonly IAuthorService _authorService;
        private readonly IBookService _bookService;
        private readonly IMapCoversToLocal _mediaCoverService;
        private readonly IDiskProvider _diskProvider;
        private readonly Logger _logger;

        public RefreshMissingMediaCovers(IAuthorService authorService,
                                         IBookService bookService,
                                         IMapCoversToLocal mediaCoverService,
                                         IDiskProvider diskProvider,
                                         Logger logger)
        {
            _authorService = authorService;
            _bookService = bookService;
            _mediaCoverService = mediaCoverService;
            _diskProvider = diskProvider;
            _logger = logger;
        }

        public void Clean()
        {
            var authorsRefreshed = 0;
            var booksRefreshed = 0;

            foreach (var author in _authorService.GetAllAuthors())
            {
                if (!HasMissingAuthorCover(author))
                {
                    continue;
                }

                _mediaCoverService.EnsureAuthorCovers(author);
                authorsRefreshed++;
            }

            foreach (var book in _bookService.GetAllBooks())
            {
                if (!HasMissingBookCover(book))
                {
                    continue;
                }

                _mediaCoverService.EnsureBookCovers(book);
                booksRefreshed++;
            }

            if (authorsRefreshed > 0 || booksRefreshed > 0)
            {
                _logger.Info("Refreshed missing media covers for {0} authors and {1} books", authorsRefreshed, booksRefreshed);
            }
        }

        private bool HasMissingAuthorCover(Author author)
        {
            var images = author.Metadata?.Value?.Images ?? new List<MediaCover.MediaCover>();

            return images.Any(cover =>
                cover.CoverType != MediaCoverTypes.Unknown &&
                !cover.Url.IsNullOrWhiteSpace() &&
                cover.Url.IsValidUrl() &&
                IsMissing(author.Id, MediaCoverEntity.Author, cover));
        }

        private bool HasMissingBookCover(Book book)
        {
            var cover = (book.Editions?.Value ?? new List<Edition>())
                .OrderByDescending(x => x.Monitored)
                .SelectMany(x => x.Images ?? new List<MediaCover.MediaCover>())
                .FirstOrDefault(x =>
                    x.CoverType == MediaCoverTypes.Cover &&
                    !x.Url.IsNullOrWhiteSpace() &&
                    x.Url.IsValidUrl());

            return cover != null && IsMissing(book.Id, MediaCoverEntity.Book, cover);
        }

        private bool IsMissing(int entityId, MediaCoverEntity entity, MediaCover.MediaCover cover)
        {
            var filePath = _mediaCoverService.GetCoverPath(entityId, entity, cover.CoverType, cover.Extension);

            return !_diskProvider.FileExists(filePath) || _diskProvider.GetFileSize(filePath) == 0;
        }
    }
}
