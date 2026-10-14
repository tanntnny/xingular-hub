import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const checker = join(dirname(fileURLToPath(import.meta.url)), 'immutable.mjs')
test('published versions cannot change, while a new version can be submitted', () => {
  const root = mkdtempSync(join(tmpdir(), 'hub-immutable-'))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  try {
    git('init', '-b', 'main')
    git('config', 'core.hooksPath', '/dev/null')
    git('config', 'user.name', 'Catalog test')
    git('config', 'user.email', 'catalog@example.invalid')
    mkdirSync(join(root, 'entries/example/item/1.0.0'), { recursive: true })
    const file = join(root, 'entries/example/item/1.0.0/entry.json')
    writeFileSync(file, '{}')
    git('add', '.')
    git('-c', 'commit.gpgsign=false', 'commit', '-m', 'Catalog baseline')
    const base = git('rev-parse', 'HEAD')
    writeFileSync(file, '{"changed":true}')
    assert.equal(spawnSync(process.execPath, [checker, base], { cwd: root }).status, 1)
    git('restore', 'entries')
    mkdirSync(join(root, 'entries/example/item/2.0.0'), { recursive: true })
    writeFileSync(join(root, 'entries/example/item/2.0.0/entry.json'), '{}')
    git('add', '.')
    assert.equal(spawnSync(process.execPath, [checker, base], { cwd: root }).status, 0)
    writeFileSync(join(root, 'entries/example/item/1.0.0/additional.json'), '{}')
    git('add', '.')
    assert.equal(spawnSync(process.execPath, [checker, base], { cwd: root }).status, 1)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
