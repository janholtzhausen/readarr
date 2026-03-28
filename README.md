# Readarr

This repository is a maintained derivative of
[pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf), which
itself derives from the original
[Readarr](https://github.com/Readarr/Readarr) project.

This fork is the actively maintained tree in this workspace. It carries the
current frontend/runtime modernization work, container updates, download/export
improvements, and a number of stability fixes for the single-page app.

## Highlights

- Frontend updated onto the React 19 line.
- Backend and container toolchain updated onto .NET 10.
- Router and frontend dependency stack modernized away from older legacy
  package combinations.
- React 19 compatibility issues fixed across the SPA, including routing,
  selector, layout, and component-default regressions.
- Book detail and file download UX improved.
- EPUB and AZW3 export/download paths added and validated.
- Cover recovery and image backfill behavior improved.
- Container/runtime tuned for the current Linux x64 deployment environment used
  in this workspace.

## Runtime Stack

The maintained fork now targets:

- .NET 10 for the backend and container build/runtime
- React 19 for the frontend
- updated React Router compatibility work across the SPA
- a modernized frontend dependency set, including replacements for stale helper
  libraries that were causing React 19 breakage

If you are comparing this repo to older Readarr/bookshelf snapshots, assume the
current codebase is substantially newer in both runtime expectations and
frontend behavior.

## File Download And Conversion

This fork includes explicit work around book file export and download behavior.

### What users can do

- Download the imported/original book file directly from the UI when that file
  exists in the library.
- Export a book as EPUB where the source file and conversion path support it.
- Export a book as AZW3 where the source file and conversion path support it.

### How conversion works

- The application prefers serving the existing library file directly when the
  requested format already matches the imported file.
- When the requested output format differs, the conversion path is used instead
  of forcing users to manually convert outside the app.
- Conversion availability depends on the source format and the conversion
  capabilities present in the runtime environment.

### Container/runtime requirements

- The container image includes `calibre` and `calibre-bin` specifically to
  support book conversion/export flows.
- If you remove those packages from the runtime image, direct conversion-based
  exports will stop working even though ordinary library management may still
  function.

## Running

The application listens on port `8787` and expects a writable config volume at
`/config`.

Typical container assumptions in this maintained fork:

- app data/config at `/config`
- books/library content mounted under `/books`
- Linux x64 runtime

## What Changed In This Fork

This maintained fork currently includes work in these areas:

- React 19 migration and compatibility fixes across the SPA
- router modernization and compatibility bridging for existing screens
- selector cleanup to remove React 19 / `reselect` regressions
- replacement or removal of stale frontend helpers
- improved toolbar actions and book file download/export UX
- container/runtime updates around .NET 10
- backend cover healing to reduce persistent missing author/book artwork

## Lineage

- [Readarr](https://github.com/Readarr/Readarr)
- [pennydreadful/bookshelf](https://github.com/pennydreadful/bookshelf)
- this maintained fork

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
