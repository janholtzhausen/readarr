using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
namespace NzbDrone.Core.Http.CloudFlare
{
    public interface IFlareSolverrProxy
    {
        bool IsConfigured(string url);
        HttpResponse Get(HttpRequest request, string flareSolverrUrl, int waitInSeconds = 2);
        HttpResponse Execute(HttpRequest request, string flareSolverrUrl, int waitInSeconds = 2, bool download = false);
        void ApplyClearance(HttpRequest request, string flareSolverrUrl, string clearanceUrl);
    }

    public class FlareSolverrProxy : IFlareSolverrProxy
    {
        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;

        public FlareSolverrProxy(IHttpClient httpClient, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public bool IsConfigured(string url)
        {
            return url.IsNotNullOrWhiteSpace();
        }

        public HttpResponse Get(HttpRequest request, string flareSolverrUrl, int waitInSeconds = 2)
        {
            return Execute(request, flareSolverrUrl, waitInSeconds);
        }

        public HttpResponse Execute(HttpRequest request, string flareSolverrUrl, int waitInSeconds = 2, bool download = false)
        {
            var solution = SendRequest(new FlareSolverrRequest
            {
                Cmd = request.Method == HttpMethod.Post ? "request.post" : "request.get",
                Url = request.Url.FullUri,
                MaxTimeout = 120000,
                WaitInSeconds = waitInSeconds,
                Download = download,
                Headers = request.Headers.ToDictionary(header => header.Key, header => header.Value),
                Cookies = request.Cookies.Select(cookie => new FlareSolverrCookie
                {
                    Name = cookie.Key,
                    Value = cookie.Value
                }).ToList(),
                PostData = request.ContentData == null ? null : HttpHeader.GetEncodingFromContentType(request.Headers.ContentType).GetString(request.ContentData)
            }, flareSolverrUrl);

            ApplySolution(request, solution);

            var headers = new HttpHeader();
            if (solution.Headers != null)
            {
                foreach (var header in solution.Headers)
                {
                    headers[header.Key] = header.Value;
                }
            }

            if (headers.ContentType.IsNullOrWhiteSpace())
            {
                headers.ContentType = "text/html; charset=UTF-8";
            }

            var statusCode = Enum.IsDefined(typeof(HttpStatusCode), solution.Status)
                ? (HttpStatusCode)solution.Status
                : HttpStatusCode.OK;

            if (download && solution.Response.IsNotNullOrWhiteSpace())
            {
                try
                {
                    var binaryData = Convert.FromBase64String(solution.Response);
                    return new HttpResponse(request, headers, binaryData, statusCode, HttpVersion.Version20);
                }
                catch (FormatException)
                {
                    _logger.Debug("FlareSolverr download response for {0} was not base64 encoded, falling back to text response", request.Url);
                }
            }

            return new HttpResponse(request, headers, solution.Response ?? string.Empty, statusCode, HttpVersion.Version20);
        }

        public void ApplyClearance(HttpRequest request, string flareSolverrUrl, string clearanceUrl)
        {
            var solution = SendRequest(new FlareSolverrRequest
            {
                Cmd = "request.get",
                Url = clearanceUrl,
                MaxTimeout = 120000,
                WaitInSeconds = 2,
                ReturnOnlyCookies = false
            }, flareSolverrUrl);

            ApplySolution(request, solution);
        }

        private void ApplySolution(HttpRequest request, FlareSolverrSolution solution)
        {
            if (solution.UserAgent.IsNotNullOrWhiteSpace())
            {
                request.Headers["User-Agent"] = solution.UserAgent;
            }

            if (solution.Cookies == null)
            {
                return;
            }

            foreach (var cookie in solution.Cookies.Where(c => c.Name.IsNotNullOrWhiteSpace()))
            {
                request.Cookies[cookie.Name] = cookie.Value ?? string.Empty;
            }
        }

        private FlareSolverrSolution SendRequest(FlareSolverrRequest payload, string flareSolverrUrl)
        {
            var solverRequest = new HttpRequest($"{flareSolverrUrl.TrimEnd('/')}/v1", HttpAccept.Json)
            {
                Method = HttpMethod.Post,
                AllowAutoRedirect = true,
                UseSimplifiedUserAgent = true,
                RequestTimeout = TimeSpan.FromSeconds(150)
            };

            solverRequest.Headers.ContentType = "application/json";
            solverRequest.ContentSummary = $"{payload.Cmd} {payload.Url}";
            solverRequest.SetContent(payload.ToJson());

            var response = _httpClient.Post<FlareSolverrResponse>(solverRequest);
            var resource = response.Resource;

            if (!string.Equals(resource.Status, "ok", StringComparison.OrdinalIgnoreCase) || resource.Solution == null)
            {
                var message = resource.Message.IsNotNullOrWhiteSpace() ? resource.Message : "FlareSolverr did not return a usable solution.";
                _logger.Warn("FlareSolverr error for {0}: {1}", payload.Url, message);
                throw new InvalidOperationException(message);
            }

            return resource.Solution;
        }

        private class FlareSolverrRequest
        {
            public string Cmd { get; set; }
            public string Url { get; set; }
            public int MaxTimeout { get; set; }
            public int? WaitInSeconds { get; set; }
            public bool ReturnOnlyCookies { get; set; }
            public bool Download { get; set; }
            public Dictionary<string, string> Headers { get; set; }
            public List<FlareSolverrCookie> Cookies { get; set; }
            public string PostData { get; set; }
        }

        private class FlareSolverrResponse
        {
            public string Status { get; set; }
            public string Message { get; set; }
            public FlareSolverrSolution Solution { get; set; }
        }

        private class FlareSolverrSolution
        {
            public string Url { get; set; }
            public int Status { get; set; }
            public Dictionary<string, string> Headers { get; set; }
            public string Response { get; set; }
            public List<FlareSolverrCookie> Cookies { get; set; }
            public string UserAgent { get; set; }
        }

        private class FlareSolverrCookie
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }
    }
}
