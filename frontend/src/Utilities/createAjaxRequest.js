import qs from 'qs';

const absUrlRegex = /^(https?:)?\/\//i;
const apiRoot = window.Readarr.apiRoot;

function isRelative(ajaxOptions) {
  return !absUrlRegex.test(ajaxOptions.url);
}

function addRootUrl(ajaxOptions) {
  ajaxOptions.url = apiRoot + ajaxOptions.url;
}

function addApiKey(ajaxOptions) {
  ajaxOptions.headers = ajaxOptions.headers || {};
  ajaxOptions.headers['X-Api-Key'] = window.Readarr.apiKey;
}

function addQueryString(url, data, traditional) {
  if (data == null) {
    return url;
  }

  const query = typeof data === 'string' ?
    data :
    qs.stringify(data, {
      arrayFormat: traditional ? 'repeat' : 'indices',
      skipNulls: true
    });

  if (!query) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

function addContentType(ajaxOptions) {
  if (
    ajaxOptions.contentType == null &&
    ajaxOptions.dataType === 'json' &&
    (ajaxOptions.method === 'PUT' || ajaxOptions.method === 'POST' || ajaxOptions.method === 'DELETE')) {
    ajaxOptions.contentType = 'application/json';
  }
}

function createErrorResponse(response, responseText, responseJSON, aborted = false) {
  return {
    status: response?.status ?? 0,
    statusText: response?.statusText ?? 'error',
    responseText,
    responseJSON,
    aborted
  };
}

function createRequestPromise(promise) {
  const request = promise;

  request.done = (callback) => {
    promise.then((data) => callback(data));
    return request;
  };

  request.fail = (callback) => {
    promise.catch((error) => callback(error));
    return request;
  };

  request.always = (callback) => {
    promise.finally(callback);
    return request;
  };

  return request;
}

export default function createAjaxRequest(originalAjaxOptions) {
  const abortController = new window.AbortController();
  let aborted = false;
  let complete = false;

  function abortRequest() {
    if (!complete) {
      aborted = true;
      abortController.abort();
    }
  }

  const ajaxOptions = { ...originalAjaxOptions };

  if (isRelative(ajaxOptions)) {
    addRootUrl(ajaxOptions);
    addApiKey(ajaxOptions);
    addContentType(ajaxOptions);
  }

  const {
    method = 'GET',
    data,
    dataType,
    traditional,
    headers = {},
    contentType,
    url,
  } = ajaxOptions;

  const requestUrl = method === 'GET' || method === 'HEAD' ?
    addQueryString(url, data, traditional) :
    url;

  const fetchOptions = {
    method,
    headers: {
      ...headers
    },
    signal: abortController.signal
  };

  if (contentType) {
    fetchOptions.headers['Content-Type'] = contentType;
  }

  if (method !== 'GET' && method !== 'HEAD' && data != null) {
    fetchOptions.body =
      contentType === 'application/json' && typeof data !== 'string' ?
        JSON.stringify(data) :
        data;
  }

  const request = createRequestPromise(
    fetch(requestUrl, fetchOptions)
      .then(async (response) => {
        const responseText = await response.text();
        let responseJSON = null;

        if (responseText) {
          try {
            responseJSON = JSON.parse(responseText);
          } catch {
            responseJSON = null;
          }
        }

        if (!response.ok) {
          throw createErrorResponse(response, responseText, responseJSON);
        }

        if (dataType === 'json') {
          return responseJSON ?? {};
        }

        if (responseJSON != null) {
          return responseJSON;
        }

        return responseText;
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          throw createErrorResponse(null, '', null, true);
        }

        if (error && typeof error.status === 'number') {
          throw {
            ...error,
            aborted
          };
        }

        throw createErrorResponse(null, error?.message ?? '', null, aborted);
      })
      .finally(() => {
        complete = true;
      })
  );

  return {
    request,
    abortRequest
  };
}
