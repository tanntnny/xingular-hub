# Xingular Hub

Xingular Hub is a versioned catalog of skills, prompts, rules, plugins, agent templates, and
connector recipes for Xingular Agent and the standalone Xingular Harness.

**Browse items:** [Catalog](CATALOG.md) · **Submit an item:** [Contribution guide](CONTRIBUTING.md)

## Use an item

### In Xingular Agent

1. Open **Capability → Hub**.
2. Search or filter by type, then open an item to review its publisher, license, version, and source.
3. Choose **Install**. The Hub installs the exact version shown in the item details.

Agent templates and connector recipes need an extra step in the app: review a template before
creating an agent, or open a connector recipe in the setup form. Installing either one does not
change an existing agent or connect an account.

### From the Harness terminal

Use these commands if you already have the [`xingular-harness` CLI](https://github.com/tanntnny/xingular-harness#run-it-as-a-standalone-pi-terminal) installed:

```sh
# Refresh the catalog and browse available versions
xingular-harness hub list --refresh

# Review an exact item before installing it
xingular-harness hub show xingular/source-review@1.0.0

# Install that exact version
xingular-harness hub install xingular/source-review@1.0.0
```

Replace the example with the `publisher/name@version` shown by `hub list`. The standalone CLI
uses its own library by default. To install into Xingular Agent's library, copy the command from
that item's details in the app; it includes the matching `--data` and `--state` locations.
Templates and connector recipes are saved as documents for a compatible app to review and apply.

## What installation does

| Item type | After installation |
|---|---|
| Skill, prompt, or rule | Added switched off. Enable it separately when you are ready to use it. |
| Plugin | Added switched off and untrusted. Review its source, then trust and attach it separately. |
| Agent template | Saved for review in Xingular Agent. It does not change existing agents. |
| Connector recipe | Saved for setup in Xingular Agent. Add your own credentials and choose access explicitly. |

Installation does not grant credentials, approvals, or tool access. **Official** and **Community**
describe a listing's catalog status; neither label makes plugin code trusted. Review the source and
license before using an item, especially one that includes code.

## Contribute

Read the [contribution guide](CONTRIBUTING.md) for the entry format and review requirements. Each
item has a publisher namespace and an exact version. Community submissions use the publisher's
own namespace and the `community` channel. Published versions are immutable: create a new version
when content changes. Maintainers review the source, license, and compatibility before merging.

To validate a checkout:

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm test
```

The build regenerates `catalog.json` and `CATALOG.md` from `entries/`. The checks read submitted
content as data; they do not execute plugin code.
