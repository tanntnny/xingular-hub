import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
function entries(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? entries(join(directory, item.name)) : item.name === 'entry.json' ? [join(directory, item.name)] : [])
}
const catalog = { schemaVersion: 1, entries: entries(join(root, 'entries')).sort().map((path) => {
  const entry = JSON.parse(readFileSync(path, 'utf8'))
  if (entry.delivery.kind !== 'pi-package') {
    const bytes = readFileSync(join(dirname(path), 'payload.json'))
    entry.delivery.sha256 = createHash('sha256').update(bytes).digest('hex')
  }
  return entry
}) }
writeFileSync(join(root, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n')
// An entry kept in this repository links to its folder; one kept upstream links to its source.
const HUB_TREE = 'https://github.com/tanntnny/xingular-hub/tree/main/'
const link = (url) => url.startsWith(HUB_TREE) ? url.slice(HUB_TREE.length) : url
const rows = catalog.entries.map((entry) => `| [${entry.title}](${link(entry.sourceUrl)}) | ${entry.category} | ${entry.publisher} | ${entry.version} | ${entry.license} |`)
writeFileSync(join(root, 'CATALOG.md'), '# Catalog\n\n| Item | Type | Publisher | Version | License |\n|---|---|---|---|---|\n' + rows.join('\n') + '\n')
if (process.argv.includes('--sync-harness')) {
  const target = join(root, '..', 'Harness', 'src', 'hub', 'catalog.json')
  if (!existsSync(dirname(target))) throw new Error('The Harness sibling checkout is required for --sync-harness.')
  const bundled = { ...catalog, entries: catalog.entries.map((entry) => {
    if (entry.delivery.kind === 'pi-package') return entry
    const path = join(root, 'entries', entry.id, entry.version, 'payload.json')
    return { ...entry, delivery: { ...entry.delivery, bundled: readFileSync(path, 'utf8') } }
  }) }
  writeFileSync(target, JSON.stringify(bundled, null, 2) + '\n')
}
