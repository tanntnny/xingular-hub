export function validateRegistryPayload(payload, kind) {
  if (!payload || !Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 20) throw new Error('Registry bundles need 1–20 items.')
  let total = 0
  const names = new Set()
  for (const item of payload.items) {
    if (typeof item.name !== 'string' || item.name.trim().length < 1 || item.name.length > 64) throw new Error('Invalid registry name.')
    const name = item.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (!name || names.has(name)) throw new Error('Duplicate or invalid normalized registry name.')
    names.add(name)
    if (!Array.isArray(item.files) || item.files.length < 1 || item.files.length > 100) throw new Error('Registry items need 1–100 files.')
    const paths = new Set()
    for (const file of item.files) {
      if (typeof file.path !== 'string' || !file.path || file.path.length > 240 || /[\\\0:]/.test(file.path) || file.path !== file.path.normalize('NFC') || file.path.split('/').some((part) => !part || part.startsWith('.'))) throw new Error('Unsafe file path.')
      const normalized = file.path.toLowerCase()
      if (paths.has(normalized)) throw new Error('Portable file path collision.')
      paths.add(normalized)
      if (!['utf8', 'base64'].includes(file.encoding) || typeof file.content !== 'string') throw new Error('Unsupported file encoding.')
      const bytes = Buffer.from(file.content, file.encoding === 'base64' ? 'base64' : 'utf8')
      if (file.encoding === 'base64' && bytes.toString('base64') !== file.content) throw new Error('Noncanonical base64.')
      total += bytes.length
      if (total > 10 * 1024 * 1024) throw new Error('Registry bundle exceeds 10 MiB.')
    }
    if (kind === 'skills' && !item.files.some((file) => file.path === 'SKILL.md')) throw new Error('Skills require SKILL.md at the root.')
    if (kind !== 'skills' && (item.files.length !== 1 || item.files[0].path !== 'CONTENT.md' || item.files[0].encoding !== 'utf8')) throw new Error('Rules and prompts require one UTF-8 CONTENT.md.')
  }
}

export function validateConnectorUrls(payload) {
  if (payload.kind !== 'remote') throw new Error('Public connector recipes must be remote.')
  for (const value of [payload.url, payload.docsUrl]) {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.port) throw new Error('Connector URLs must be public HTTPS without credentials, queries, or fragments.')
  }
}
