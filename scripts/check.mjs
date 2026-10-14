import Ajv from 'ajv/dist/2020.js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateRegistryPayload, validateConnectorUrls } from './payload.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const catalog = JSON.parse(readFileSync(join(root, 'catalog.json'), 'utf8'))
const ajv = new Ajv({ strict: false })
ajv.addFormat('uri', (value) => { try { new URL(value); return true } catch { return false } })
ajv.addFormat('starts_with', (value) => value.startsWith('https://'))
ajv.addFormat('date', (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value)
const validate = ajv.compile(JSON.parse(readFileSync(join(root, 'schema', 'catalog.schema.json'), 'utf8')))
const validateTemplate = ajv.compile(JSON.parse(readFileSync(join(root, 'schema', 'agent-template.schema.json'), 'utf8')))
const validateConnector = ajv.compile(JSON.parse(readFileSync(join(root, 'schema', 'connector.schema.json'), 'utf8')))
if (!validate(catalog)) throw new Error(JSON.stringify(validate.errors, null, 2))
const keys = new Set()
for (const entry of catalog.entries) {
  const key = `${entry.id}@${entry.version}`
  if (keys.has(key)) throw new Error(`Duplicate item ${key}`)
  keys.add(key)
  const source = new URL(entry.sourceUrl)
  if (source.protocol !== 'https:' || source.username || source.password || source.search || source.hash || source.port) throw new Error(`Invalid source URL: ${key}`)
  if (entry.channel === 'official' && !entry.id.startsWith('xingular/')) throw new Error(`Official namespace required: ${key}`)
  if (entry.delivery.kind === 'pi-package') {
    if (!/^npm:(?:@[a-z0-9_.-]+\/)?[a-z0-9_.-]+@\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(entry.delivery.source) && !/^git:https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?@[a-f0-9]{40}$/.test(entry.delivery.source)) throw new Error(`Unpinned package ${key}`)
  } else {
    const path = join(root, 'entries', entry.id, entry.version, 'payload.json')
    const bytes = readFileSync(path)
    if (createHash('sha256').update(bytes).digest('hex') !== entry.delivery.sha256) throw new Error(`Digest differs: ${key}`)
    if (bytes.length > 16 * 1024 * 1024) throw new Error(`Payload exceeds 16 MiB: ${key}`)
    const payload = JSON.parse(bytes.toString('utf8'))
    if (entry.delivery.kind === 'registry') validateRegistryPayload(payload, entry.delivery.registryKind)
    if (entry.category === 'agent-template') {
      if (!validateTemplate(payload)) throw new Error(`Invalid agent template ${key}: ${JSON.stringify(validateTemplate.errors)}`)
      if (payload.version !== entry.version || payload.license !== entry.license) throw new Error(`Template version or license differs from the listing: ${key}`)
      if (payload.skills.length) validateRegistryPayload({ items: payload.skills }, 'skills')
      for (const recipe of payload.connections) if (recipe.kind === 'remote') validateConnectorUrls({ kind: 'remote', url: recipe.url, docsUrl: recipe.url })
    }
    if (entry.category === 'connector') {
      if (!validateConnector(payload)) throw new Error(`Invalid connector ${key}: ${JSON.stringify(validateConnector.errors)}`)
      validateConnectorUrls(payload)
    }
    const url = new URL(entry.delivery.url)
    if (url.hostname !== 'raw.githubusercontent.com' || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.port) throw new Error(`Invalid download URL: ${key}`)
  }
}
console.log(`Validated ${catalog.entries.length} versioned entries without running submitted code.`)
