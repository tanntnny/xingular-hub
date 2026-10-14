import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateRegistryPayload, validateConnectorUrls } from './payload.mjs'

const bundle = (path = 'SKILL.md', name = 'review') => ({ items: [{ name, files: [{ path, encoding: 'utf8', content: '# Review' }] }] })
test('validates inert skill files and single-document rules', () => {
  assert.doesNotThrow(() => validateRegistryPayload(bundle(), 'skills'))
  assert.doesNotThrow(() => validateRegistryPayload(bundle('CONTENT.md'), 'rules'))
  assert.throws(() => validateRegistryPayload(bundle('SKILL.md'), 'rules'))
})
test('rejects traversal, executable path escapes, and portable collisions', () => {
  for (const path of ['../escape', '/absolute', 'a/../escape', 'C:/escape', 'a\\escape', '.hidden/SKILL.md']) assert.throws(() => validateRegistryPayload(bundle(path), 'skills'))
  const duplicate = bundle(); duplicate.items[0].files.push({ path: 'skill.md', content: 'different', encoding: 'utf8' })
  assert.throws(() => validateRegistryPayload(duplicate, 'skills'))
})
test('rejects normalized names and invalid base64', () => {
  assert.throws(() => validateRegistryPayload({ items: [...bundle('SKILL.md', 'source review').items, ...bundle('SKILL.md', 'source-review').items] }, 'skills'))
  const bad = bundle(); bad.items[0].files[0].encoding = 'base64'; bad.items[0].files[0].content = 'invalid'
  assert.throws(() => validateRegistryPayload(bad, 'skills'))
})
test('connector metadata carries no URL credentials and no local executable', () => {
  const payload = { kind: 'remote', url: 'https://example.com/mcp', docsUrl: 'https://example.com/docs' }
  assert.doesNotThrow(() => validateConnectorUrls(payload))
  assert.throws(() => validateConnectorUrls({ ...payload, url: 'https://secret@example.com/mcp' }))
  assert.throws(() => validateConnectorUrls({ ...payload, kind: 'local' }))
})
