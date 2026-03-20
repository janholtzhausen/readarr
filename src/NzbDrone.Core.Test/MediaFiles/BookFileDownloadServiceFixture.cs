using System;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Processes;
using NzbDrone.Core.Books.Calibre;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.RootFolders;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MediaFiles
{
    [TestFixture]
    public class BookFileDownloadServiceFixture : CoreTest<BookFileDownloadService>
    {
        private BookFile _bookFile;
        private RootFolder _rootFolder;

        [SetUp]
        public void SetUp()
        {
            _bookFile = new BookFile
            {
                Id = 12,
                Path = "/books/Author/Title/book.mobi",
                CalibreId = 99
            };

            _rootFolder = new RootFolder
            {
                Path = "/books",
                IsCalibreLibrary = true,
                CalibreSettings = new CalibreSettings
                {
                    Host = "calibre",
                    Port = 8080,
                    Library = "Books"
                }
            };

            Mocker.GetMock<IMediaFileService>()
                .Setup(v => v.Get(_bookFile.Id))
                .Returns(_bookFile);

            Mocker.GetMock<IRootFolderService>()
                .Setup(v => v.GetBestRootFolder(_bookFile.Path))
                .Returns(_rootFolder);

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists(_bookFile.Path))
                .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/books/Author/Title/book.epub"))
                .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/books/Author/Title/book.azw3"))
                .Returns(true);

            Mocker.GetMock<IAppFolderInfo>()
                .SetupGet(v => v.TempFolder)
                .Returns("/tmp");
        }

        [Test]
        public void should_allow_epub_conversion_for_calibre_backed_text_file()
        {
            Subject.CanConvertToFormat(_bookFile, "epub").Should().BeTrue();
        }

        [Test]
        public void should_return_original_file_when_no_conversion_is_requested()
        {
            var result = Subject.PrepareDownload(_bookFile.Id);

            result.Path.Should().Be(_bookFile.Path);
            result.FileName.Should().Be("book.mobi");
        }

        [Test]
        public void should_return_converted_file_when_epub_is_requested()
        {
            Mocker.GetMock<ICalibreProxy>()
                .Setup(v => v.GetOrCreateFormatPath(_bookFile.CalibreId, "MOBI", "EPUB", _rootFolder.CalibreSettings))
                .Returns("/books/Author/Title/book.epub");

            var result = Subject.PrepareDownload(_bookFile.Id, "epub");

            result.Path.Should().Be("/books/Author/Title/book.epub");
            result.FileName.Should().Be("book.epub");
        }

        [Test]
        public void should_return_converted_file_when_azw3_is_requested()
        {
            Mocker.GetMock<ICalibreProxy>()
                .Setup(v => v.GetOrCreateFormatPath(_bookFile.CalibreId, "MOBI", "AZW3", _rootFolder.CalibreSettings))
                .Returns("/books/Author/Title/book.azw3");

            var result = Subject.PrepareDownload(_bookFile.Id, "azw3");

            result.Path.Should().Be("/books/Author/Title/book.azw3");
            result.FileName.Should().Be("book.azw3");
        }

        [Test]
        public void should_throw_when_conversion_is_not_available()
        {
            _bookFile.CalibreId = 0;
            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/usr/bin/ebook-convert"))
                .Returns(false);

            Assert.Throws<InvalidOperationException>(() => Subject.PrepareDownload(_bookFile.Id, "epub"));
        }

        [Test]
        public void should_allow_local_conversion_when_ebook_convert_is_available()
        {
            _bookFile.CalibreId = 0;

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/usr/bin/ebook-convert"))
                .Returns(true);

            Subject.CanConvertToFormat(_bookFile, "epub").Should().BeTrue();
        }

        [Test]
        public void should_convert_locally_when_remote_calibre_is_not_available()
        {
            _bookFile.CalibreId = 0;

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/usr/bin/ebook-convert"))
                .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/tmp/readarr-book-downloads/12/book.epub"))
                .Returns(true);

            Mocker.GetMock<IProcessProvider>()
                .Setup(v => v.StartAndCapture("/usr/bin/ebook-convert", "\"/books/Author/Title/book.mobi\" \"/tmp/readarr-book-downloads/12/book.epub\"", null))
                .Returns(new ProcessOutput { ExitCode = 0 });

            var result = Subject.PrepareDownload(_bookFile.Id, "epub");

            result.Path.Should().Be("/tmp/readarr-book-downloads/12/book.epub");
            result.FileName.Should().Be("book.epub");
        }

        [Test]
        public void should_convert_locally_to_azw3_when_requested()
        {
            _bookFile.CalibreId = 0;

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/usr/bin/ebook-convert"))
                .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                .Setup(v => v.FileExists("/tmp/readarr-book-downloads/12/book.azw3"))
                .Returns(true);

            Mocker.GetMock<IProcessProvider>()
                .Setup(v => v.StartAndCapture("/usr/bin/ebook-convert", "\"/books/Author/Title/book.mobi\" \"/tmp/readarr-book-downloads/12/book.azw3\"", null))
                .Returns(new ProcessOutput { ExitCode = 0 });

            var result = Subject.PrepareDownload(_bookFile.Id, "azw3");

            result.Path.Should().Be("/tmp/readarr-book-downloads/12/book.azw3");
            result.FileName.Should().Be("book.azw3");
        }
    }
}
