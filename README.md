# Readarr

This repository is a maintained derivative of
[pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf), which is
itself derived from the original
[Readarr](https://github.com/Readarr/Readarr) project.

The codebase in this repo has been updated substantially from that bookshelf
baseline, including frontend/runtime modernization, container/runtime
improvements, book file download improvements, and media cover
recovery/backfill behavior.

## Lineage

- [Readarr](https://github.com/Readarr/Readarr)
- [pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf)
- this maintained fork

## Status

Current highlights in this maintained fork:

- React frontend modernized onto the current React 19 line.
- Router/history/frontend dependency stack updated from older legacy packages.
- Multiple outdated frontend helper libraries removed or replaced.
- Book detail/download UI improved.
- EPUB and AZW3 download/export paths added and validated.
- Automatic missing cover recovery added through housekeeping backfill.
- Author and book image rendering regressions fixed.
- Container build/runtime updated around the current .NET 10 toolchain used in
  this workspace.

## Running

The application listens on port `8787` and expects a writable config volume at
`/config`.

## What Changed In This Fork

This maintained fork currently includes work in these areas:

- Frontend dependency modernization to newer maintained packages.
- React 19 compatibility work, including removal of old `findDOMNode` usage and
  function-component `defaultProps` cleanup.
- Router modernization with compatibility bridging for existing screens.
- jQuery/XHR request path replacement with `fetch`/`AbortController`.
- Local replacements for stale frontend utilities such as document title,
  truncation, and lazy image helpers.
- Improved toolbar actions and book file download UX.
- Backend cover healing to reduce persistent missing author/book artwork.

## Upstream Credit

Full credit is due first to
[pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf) as the
immediate source this work started from, and also to the original
[Readarr](https://github.com/Readarr/Readarr) authors and maintainers whose
project bookshelf itself derives from.

This repository remains a derivative work of:

- [pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf)
- [Readarr](https://github.com/Readarr/Readarr)
- related Servarr ecosystem code where still applicable

The original project license terms remain in effect. See
[LICENSE.md](./LICENSE.md).

## Metadata/Image Source Credit

This fork has used metadata and image source integrations originating from the
existing bookshelf/Readarr codebase and related source providers, including
Goodreads-derived image URLs that are still referenced by parts of the current
metadata pipeline.

Credit is due to:

- [Goodreads](https://www.goodreads.com/) as an original metadata/image source
  used by existing Readarr-compatible metadata flows
- [pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf) for the
  actual source fork this repository was derived from
- the upstream Readarr work that bookshelf and this repository both build on

This repository does not replace or relicense third-party source material.
Applicable upstream/source licenses and terms remain with their original
owners/providers.

## License

This repository remains under GPLv3 in line with the original Readarr project.
See [LICENSE.md](./LICENSE.md).

## Contributor Attribution

This fork is being maintained by `janholtzhausen`, while preserving explicit
credit to original Readarr and source-provider work above.
