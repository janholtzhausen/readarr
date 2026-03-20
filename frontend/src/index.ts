import './polyfills';
import 'Styles/globals.css';
import './index.css';

const initializeUrl = `${
  window.Readarr.urlBase
}/initialize.json?t=${Date.now()}`;
const response = await fetch(initializeUrl);

window.Readarr = await response.json();

/* eslint-disable no-undef, @typescript-eslint/ban-ts-comment */
// @ts-ignore 2304
__webpack_public_path__ = `${window.Readarr.urlBase}/`;
/* eslint-enable no-undef, @typescript-eslint/ban-ts-comment */

const error = console.error;

// React 18 surfaces warnings for remaining legacy patterns that already exist
// elsewhere in the app. Filter the known noise so real runtime errors still stand out.
function logError(...parameters: unknown[]) {
  const filter = parameters.find((parameter) => {
    return (
      typeof parameter === 'string' &&
      parameter.includes(
        'Support for defaultProps will be removed from function components in a future major release'
      )
    );
  });

  if (!filter) {
    error(...parameters);
  }
}

console.error = logError;

const { bootstrap } = await import('./bootstrap');

await bootstrap();
