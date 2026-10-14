# Submit an item

1. Create `entries/<publisher>/<name>/<version>/entry.json`. IDs use `publisher/name`; versions use semantic versioning. Use an existing entry as a starter.
2. Declare the publisher, artifact license, category, source link, and minimum consumer versions. Community submissions use `channel: community` and their own namespace.
3. For registry bundles, include `payload.json` containing `items`, each with a name and bounded files. Skills require `SKILL.md`; rules and prompts require a single UTF-8 `CONTENT.md`. For documents, include a plain JSON payload compatible with the consuming application.
4. For plugins, use `delivery.kind: pi-package` and an exact npm version or a complete GitHub commit. Follow Pi's package format. Install scripts cannot be required for operation.
5. Run `npm run build` and `npm run check`. Include the payload license and setup requirements in the pull request. Describe whether the item contains executable code or recommends commands.

Published versions are immutable. Publish a new version for content changes. Installed local copies remain independent of later catalog refreshes.

Maintainers review the full content and upstream provenance before merging. Submitted code is not executed by catalog validation. A listing is not a grant of permission or a guarantee that third-party code is safe.
