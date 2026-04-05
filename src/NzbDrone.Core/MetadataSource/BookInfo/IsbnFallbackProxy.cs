using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource.Goodreads;

namespace NzbDrone.Core.MetadataSource.BookInfo
{
    public interface IIsbnFallbackProxy
    {
        List<Book> Search(string isbn13);
    }

    public class IsbnFallbackProxy : IIsbnFallbackProxy
    {
        private readonly IHttpClient _httpClient;
        private readonly IGoodreadsSearchProxy _goodreadsSearchProxy;
        private readonly Lazy<IProvideBookInfo> _bookInfoProxy;
        private readonly Logger _logger;

        private static readonly string DefaultFlareSolverrUrl = "http://flaresolverr:8191";

        public IsbnFallbackProxy(IHttpClient httpClient,
                                 IGoodreadsSearchProxy goodreadsSearchProxy,
                                 Lazy<IProvideBookInfo> bookInfoProxy,
                                 Logger logger)
        {
            _httpClient = httpClient;
            _goodreadsSearchProxy = goodreadsSearchProxy;
            _bookInfoProxy = bookInfoProxy;
            _logger = logger;
        }

        public List<Book> Search(string isbn13)
        {
            _logger.Debug("ISBN fallback search for {0}", isbn13);

            string title = null;
            string author = null;
            string description = null;
            string coverUrl = null;

            // 1. Try Open Library
            TryOpenLibrary(isbn13, ref title, ref author, ref description, ref coverUrl);

            // 2. Try Google Books
            if (title.IsNullOrWhiteSpace())
            {
                TryGoogleBooks(isbn13, ref title, ref author, ref description, ref coverUrl);
            }

            // 3. If we have a title, try Hardcover via title+author search
            if (title.IsNotNullOrWhiteSpace())
            {
                var hardcoverResults = TryHardcoverSearch(title, author);
                if (hardcoverResults != null && hardcoverResults.Count > 0)
                {
                    return hardcoverResults;
                }
            }

            // 4. Try FlareSolverr-accessible sites
            if (title.IsNullOrWhiteSpace())
            {
                TryFlareSolverrSites(isbn13, ref title, ref author);

                if (title.IsNotNullOrWhiteSpace())
                {
                    var hardcoverResults = TryHardcoverSearch(title, author);
                    if (hardcoverResults != null && hardcoverResults.Count > 0)
                    {
                        return hardcoverResults;
                    }
                }
            }

            // 5. Last resort: construct a synthetic Book
            if (title.IsNotNullOrWhiteSpace() || author.IsNotNullOrWhiteSpace())
            {
                return new List<Book> { BuildSyntheticBook(isbn13, title, author, description, coverUrl) };
            }

            return new List<Book>();
        }

        private void TryOpenLibrary(string isbn13, ref string title, ref string author, ref string description, ref string coverUrl)
        {
            try
            {
                var url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn13}&format=json&jscmd=data";
                var request = new HttpRequest(url);
                var response = _httpClient.Get(request);

                if (response.StatusCode == System.Net.HttpStatusCode.OK && response.Content.IsNotNullOrWhiteSpace())
                {
                    var json = JObject.Parse(response.Content);
                    var key = $"ISBN:{isbn13}";

                    if (json.ContainsKey(key))
                    {
                        var book = json[key];
                        title = book["title"]?.ToString();

                        var authors = book["authors"] as JArray;
                        if (authors != null && authors.Count > 0)
                        {
                            author = authors[0]["name"]?.ToString();
                        }

                        description = book["description"]?.ToString();
                        coverUrl = book["cover"]?["large"]?.ToString()
                            ?? book["cover"]?["medium"]?.ToString();

                        _logger.Debug("Open Library found: '{0}' by '{1}'", title, author);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Open Library lookup failed for ISBN {0}", isbn13);
            }
        }

        private void TryGoogleBooks(string isbn13, ref string title, ref string author, ref string description, ref string coverUrl)
        {
            try
            {
                var url = $"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn13}";
                var request = new HttpRequest(url);
                var response = _httpClient.Get(request);

                if (response.StatusCode == System.Net.HttpStatusCode.OK && response.Content.IsNotNullOrWhiteSpace())
                {
                    var json = JObject.Parse(response.Content);
                    var items = json["items"] as JArray;

                    if (items != null && items.Count > 0)
                    {
                        var info = items[0]["volumeInfo"];
                        title = info?["title"]?.ToString();

                        var authors = info?["authors"] as JArray;
                        if (authors != null && authors.Count > 0)
                        {
                            author = authors[0].ToString();
                        }

                        description = info?["description"]?.ToString();
                        coverUrl = coverUrl ?? info?["imageLinks"]?["thumbnail"]?.ToString();

                        _logger.Debug("Google Books found: '{0}' by '{1}'", title, author);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Google Books lookup failed for ISBN {0}", isbn13);
            }
        }

        private List<Book> TryHardcoverSearch(string title, string author)
        {
            try
            {
                var query = author.IsNotNullOrWhiteSpace() ? $"{title} {author}" : title;
                var results = _goodreadsSearchProxy.Search(query);

                if (results != null && results.Count > 0)
                {
                    var books = new List<Book>();
                    foreach (var result in results.Take(3))
                    {
                        try
                        {
                            var tuple = _bookInfoProxy.Value.GetBookInfo(result.WorkId.ToString());
                            if (tuple != null)
                            {
                                books.Add(tuple.Item2);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.Warn(ex, "Failed to fetch work {0} from Hardcover", result.WorkId);
                        }
                    }

                    if (books.Count > 0)
                    {
                        _logger.Debug("Hardcover fallback found {0} results for '{1}'", books.Count, query);
                        return books;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Hardcover title+author search failed for '{0} {1}'", title, author);
            }

            return null;
        }

        private void TryFlareSolverrSites(string isbn13, ref string title, ref string author)
        {
            var flareSolverrBase = Environment.GetEnvironmentVariable("FLARESOLVERR_URL");
            if (flareSolverrBase.IsNullOrWhiteSpace())
            {
                flareSolverrBase = DefaultFlareSolverrUrl;
            }

            var flareSolverrUrl = flareSolverrBase.TrimEnd('/') + "/v1";

            // Check if FlareSolverr is reachable
            if (!IsFlareSolverrReachable(flareSolverrUrl))
            {
                return;
            }

            // Try isbnsearch.org
            TryIsbnSearch(flareSolverrUrl, isbn13, ref title, ref author);

            if (title.IsNullOrWhiteSpace())
            {
                // Try worldcat.org
                TryWorldCat(flareSolverrUrl, isbn13, ref title, ref author);
            }

            if (title.IsNullOrWhiteSpace())
            {
                // Try biblio.com
                TryBiblio(flareSolverrUrl, isbn13, ref title, ref author);
            }
        }

        private bool IsFlareSolverrReachable(string flareSolverrUrl)
        {
            try
            {
                var request = new HttpRequest(flareSolverrUrl);
                request.SuppressHttpError = true;
                var response = _httpClient.Get(request);
                return response.StatusCode != System.Net.HttpStatusCode.ServiceUnavailable;
            }
            catch
            {
                return false;
            }
        }

        private string CallFlareSolverr(string flareSolverrUrl, string targetUrl)
        {
            try
            {
                var request = new HttpRequest(flareSolverrUrl);
                request.Method = HttpMethod.Post;
                request.Headers.ContentType = "application/json";

                var body = Newtonsoft.Json.JsonConvert.SerializeObject(new
                {
                    cmd = "request.get",
                    url = targetUrl,
                    maxTimeout = 60000
                });

                request.SetContent(body);

                var response = _httpClient.Post(request);

                if (response.StatusCode == System.Net.HttpStatusCode.OK && response.Content.IsNotNullOrWhiteSpace())
                {
                    var json = JObject.Parse(response.Content);
                    return json["solution"]?["response"]?.ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "FlareSolverr request failed for {0}", targetUrl);
            }

            return null;
        }

        private void TryIsbnSearch(string flareSolverrUrl, string isbn13, ref string title, ref string author)
        {
            try
            {
                var html = CallFlareSolverr(flareSolverrUrl, $"https://isbnsearch.org/isbn/{isbn13}");
                if (html.IsNullOrWhiteSpace())
                {
                    return;
                }

                var titleMatch = Regex.Match(html, @"<div[^>]+class=""[^""]*bookinfo[^""]*""[^>]*>.*?<h2[^>]*>(.*?)</h2>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (!titleMatch.Success)
                {
                    titleMatch = Regex.Match(html, @"<h2[^>]*itemprop=""name""[^>]*>(.*?)</h2>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                }

                if (!titleMatch.Success)
                {
                    titleMatch = Regex.Match(html, @"<strong>Title:</strong>\s*([^<]+)", RegexOptions.IgnoreCase);
                }

                if (titleMatch.Success)
                {
                    title = StripHtml(titleMatch.Groups[1].Value).Trim();
                }

                var authorMatch = Regex.Match(html, @"<strong>Author:</strong>\s*<a[^>]*>([^<]+)</a>", RegexOptions.IgnoreCase);
                if (!authorMatch.Success)
                {
                    authorMatch = Regex.Match(html, @"<strong>Author:</strong>\s*([^<]+)", RegexOptions.IgnoreCase);
                }

                if (authorMatch.Success)
                {
                    author = StripHtml(authorMatch.Groups[1].Value).Trim();
                }

                if (title.IsNotNullOrWhiteSpace())
                {
                    _logger.Debug("isbnsearch.org found: '{0}' by '{1}'", title, author);
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "isbnsearch.org lookup failed for ISBN {0}", isbn13);
            }
        }

        private void TryWorldCat(string flareSolverrUrl, string isbn13, ref string title, ref string author)
        {
            try
            {
                var html = CallFlareSolverr(flareSolverrUrl, $"https://search.worldcat.org/search?q=bn:{isbn13}");
                if (html.IsNullOrWhiteSpace())
                {
                    return;
                }

                var titleMatch = Regex.Match(html, @"<h2[^>]+class=""[^""]*title[^""]*""[^>]*>(.*?)</h2>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (!titleMatch.Success)
                {
                    titleMatch = Regex.Match(html, @"class=""[^""]*result-title[^""]*""[^>]*>(.*?)</", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                }

                if (titleMatch.Success)
                {
                    title = StripHtml(titleMatch.Groups[1].Value).Trim();
                }

                var authorMatch = Regex.Match(html, @"class=""[^""]*result-author[^""]*""[^>]*>(.*?)</", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (authorMatch.Success)
                {
                    author = StripHtml(authorMatch.Groups[1].Value).Trim();
                }

                if (title.IsNotNullOrWhiteSpace())
                {
                    _logger.Debug("WorldCat found: '{0}' by '{1}'", title, author);
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "WorldCat lookup failed for ISBN {0}", isbn13);
            }
        }

        private void TryBiblio(string flareSolverrUrl, string isbn13, ref string title, ref string author)
        {
            try
            {
                var html = CallFlareSolverr(flareSolverrUrl, $"https://www.biblio.com/search.php?keyisbn={isbn13}");
                if (html.IsNullOrWhiteSpace())
                {
                    return;
                }

                var titleMatch = Regex.Match(html, @"class=""[^""]*item-title[^""]*""[^>]*>(.*?)</", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (!titleMatch.Success)
                {
                    titleMatch = Regex.Match(html, @"<span[^>]+itemprop=""name""[^>]*>(.*?)</span>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                }

                if (titleMatch.Success)
                {
                    title = StripHtml(titleMatch.Groups[1].Value).Trim();
                }

                var authorMatch = Regex.Match(html, @"class=""[^""]*item-author[^""]*""[^>]*>(.*?)</", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (authorMatch.Success)
                {
                    author = StripHtml(authorMatch.Groups[1].Value).Trim();
                }

                if (title.IsNotNullOrWhiteSpace())
                {
                    _logger.Debug("biblio.com found: '{0}' by '{1}'", title, author);
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "biblio.com lookup failed for ISBN {0}", isbn13);
            }
        }

        private static string StripHtml(string html)
        {
            if (html.IsNullOrWhiteSpace())
            {
                return html;
            }

            return Regex.Replace(html, "<[^>]+>", string.Empty);
        }

        private static Book BuildSyntheticBook(string isbn13, string title, string author, string description, string coverUrl)
        {
            var effectiveTitle = title.IsNotNullOrWhiteSpace() ? title : $"Unknown Book (ISBN: {isbn13})";
            var effectiveAuthor = author.IsNotNullOrWhiteSpace() ? author : "Unknown Author";

            var authorMetadata = new AuthorMetadata
            {
                ForeignAuthorId = $"isbn-author:{isbn13}",
                TitleSlug = $"isbn-author-{isbn13}",
                Name = effectiveAuthor,
                Status = AuthorStatusType.Continuing,
                Ratings = new Ratings { Votes = 0, Value = 0 }
            };

            authorMetadata.SortName = authorMetadata.Name.ToLower();
            authorMetadata.NameLastFirst = effectiveAuthor.ToLastFirst();
            authorMetadata.SortNameLastFirst = authorMetadata.NameLastFirst.ToLower();

            var authorObj = new Author
            {
                CleanName = Parser.Parser.CleanAuthorName(effectiveAuthor),
                Metadata = authorMetadata
            };

            var edition = new Edition
            {
                ForeignEditionId = $"isbn:{isbn13}",
                TitleSlug = $"isbn-{isbn13}",
                Title = effectiveTitle,
                Isbn13 = isbn13,
                Overview = description ?? string.Empty,
                Monitored = true,
                Ratings = new Ratings { Votes = 0, Value = 0 }
            };

            if (coverUrl.IsNotNullOrWhiteSpace())
            {
                edition.Images.Add(new MediaCover.MediaCover
                {
                    Url = coverUrl,
                    CoverType = MediaCoverTypes.Cover
                });
            }

            var book = new Book
            {
                ForeignBookId = $"isbn:{isbn13}",
                TitleSlug = $"isbn-{isbn13}",
                Title = effectiveTitle,
                CleanTitle = Parser.Parser.CleanAuthorName(effectiveTitle),
                AnyEditionOk = true,
                Ratings = new Ratings { Votes = 0, Value = 0 },
                Editions = new List<Edition> { edition },
                SeriesLinks = new List<SeriesBookLink>()
            };

            book.Author = authorObj;
            book.AuthorMetadata = authorMetadata;

            return book;
        }
    }
}
