import { execFileSync } from 'node:child_process'

const base = process.argv[2]
if (!base || !/^[a-f0-9]{40}$/.test(base)) throw new Error('Provide the pull request base commit.')
const paths = execFileSync('git', ['diff', '--name-status', '--no-renames', base, '--', 'entries'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
for (const line of paths) {
  const [status, path] = line.split('\t')
  const versionDirectory = path.split('/').slice(0, 4).join('/')
  let published = false
  try { execFileSync('git', ['cat-file', '-e', `${base}:${versionDirectory}`], { stdio: 'ignore' }); published = true } catch {}
  if (published && status !== 'D') throw new Error(`Published version ${versionDirectory} is immutable. Submit a new version.`)
  if (published && status === 'D') throw new Error(`Preserve published version files and submit a new version.`)
}
console.log('Existing version directories remain unchanged.')
