# Xingular Hub

A curated public catalog for Xingular Agent and the standalone Xingular Harness. Browse [the catalog](CATALOG.md), inspect the files, and install an exact version from either client.

```sh
xingular-harness hub list --refresh
xingular-harness hub show xingular/source-review@1.0.0
xingular-harness hub install xingular/source-review@1.0.0
```

To install into the desktop application's library, use the command shown in its Hub, including its `--data` and `--state` folders. Default terminal folders form a separate library.

Skills, prompts, and rules install disabled. Plugins install disabled and their code remains untrusted. Templates and connector recipes are saved as documents; the application reviews and applies them separately. Installation grants no credentials, approval, or tool access.

The repository distributes metadata and reviewed data, with exact-version references for Pi packages. It does not host publisher accounts or execute submissions. Existing user files and settings are never published.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md). Submit a pull request for a new item or a new version. Maintainers review the content, license, source, and compatibility. Official status is controlled by the catalog maintainers.

## Development

```sh
npm ci --ignore-scripts
npm run build
npm run check
```

`catalog.json` and `CATALOG.md` are generated from `entries/`. Run `node scripts/build.mjs --sync-harness` with a sibling Harness checkout to refresh its offline snapshot. The validator reads submissions as data and never executes plugin code.

New tooling, examples, and the initial Xingular-authored entries use MIT. Each entry declares its own license; adding an item does not relicense the author's work. Catalog availability is a publication step, separate from local implementation.
