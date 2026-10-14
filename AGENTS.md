# Xingular Hub — catalog maintenance

Read `README.md` and `CONTRIBUTING.md` before changing an entry. This repository owns catalog data,
licensed payload examples, schemas exported from the consuming contracts, and publication checks.
The Harness owns installation; the App owns interpreting and applying agent templates.

Published version directories are immutable. Add a new version for content changes. Community
entries use the publisher's namespace and community channel; maintainers control official status.
Preserve the artifact's license and include only data and source references authorized for publication.

Run `npm run build`, `npm run check`, and `npm test`. Review source and metadata without executing
submitted plugin code. Regenerate payload schemas from the App's `scripts/export-hub-schemas.mjs`
when the authoritative contracts change. `node scripts/build.mjs --sync-harness` refreshes the
offline snapshot when a sibling Harness checkout is present.

Public repository creation, branch protection, and publication are distinct from local validation.
Describe their actual state in release notes; a passing check does not prove publication.
