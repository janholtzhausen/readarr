import parseUrl from 'Utilities/String/parseUrl';

const INDEXERS_WITH_API_PATH = new Set(['Newznab', 'Torznab']);

function getOrigin(parsedUrl) {
  if (parsedUrl.origin && parsedUrl.origin !== 'null') {
    return parsedUrl.origin;
  }

  if (parsedUrl.protocol && parsedUrl.host) {
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  }

  return null;
}

export default function normalizeIndexerUrl(implementation, value) {
  if (
    !INDEXERS_WITH_API_PATH.has(implementation) ||
    typeof value !== 'string' ||
    !value.trim()
  ) {
    return null;
  }

  const parsedUrl = parseUrl(value.trim());

  if (!parsedUrl.isAbsolute || !parsedUrl.host) {
    return null;
  }

  const baseUrl = getOrigin(parsedUrl);
  const apiPath = parsedUrl.pathname && parsedUrl.pathname !== '/' ? parsedUrl.pathname : null;
  const apiKey = typeof parsedUrl.params?.apikey === 'string' ? parsedUrl.params.apikey : null;

  if (!apiPath && !apiKey) {
    return null;
  }

  return {
    baseUrl,
    apiPath,
    apiKey
  };
}
