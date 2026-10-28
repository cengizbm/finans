// Git hook kontrolleri. pre-commit ve pre-push bu dosyayı çağırır:
//   node hooks/checks.mjs pre-commit
//   node hooks/checks.mjs pre-push
// Kuralları değiştirmek için yalnızca bu dosyayı düzenle.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MIN_NODE = [20, 19, 0] // vite 8 / react 19 için gereken alt sınır

// GitHub'a asla gitmemesi gereken yollar.
const BLOCKED_PATHS = [
  /(^|\/)\.env(\..*)?$/i,
  /(^|\/)node_modules\//,
  /(^|\/)dist\//,
  /\.(pem|key|p12|pfx)$/i,
  /(^|\/)\.claude\.json$/i,
]
const ALLOWED_PATHS = [/(^|\/)\.env\.example$/i]

// Sızıntı tarayıcı: [ad, desen]
const SECRET_PATTERNS = [
  ['21st.dev API anahtarı', /21st_sk_[a-f0-9]{16,}/i],
  ['Anthropic API anahtarı', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI tarzı anahtar', /\bsk-[A-Za-z0-9]{32,}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ['AWS erişim anahtarı', /\bAKIA[0-9A-Z]{16}\b/],
  ['Özel anahtar bloğu', /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/],
  ['Genel API anahtarı ataması', /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*['"][A-Za-z0-9_\-./+]{20,}['"]/i],
]

const failures = []
const fail = (msg) => failures.push(msg)

function run(cmd, { quiet = false } = {}) {
  const res = spawnSync(cmd, { shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`
  if (res.status !== 0 && !quiet) process.stdout.write(out)
  return { ok: res.status === 0, out }
}

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function step(title) {
  console.log(`\n▸ ${title}`)
}

function memoryHint(out) {
  if (/errno=1455|out of memory|ENOMEM/i.test(out)) {
    console.log(
      '  İpucu: Bellek yetersiz görünüyor (Windows errno 1455). Dev sunucusunu ve gereksiz Chrome sekmelerini kapatıp tekrar dene.',
    )
  }
}

// ---------------------------------------------------------------- pre-commit
function stagedFiles() {
  const res = git(['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z'])
  return res.stdout.split('\0').filter(Boolean)
}

function checkBlockedPaths(files) {
  step('Yasaklı dosya yolları')
  for (const f of files) {
    if (ALLOWED_PATHS.some((re) => re.test(f))) continue
    if (BLOCKED_PATHS.some((re) => re.test(f))) {
      fail(`"${f}" commit'lenemez (gizli bilgi veya üretilmiş dosya). .gitignore'a ekle ve "git rm --cached ${f}" çalıştır.`)
    }
  }
}

function checkSizeAndSecrets(files) {
  step('Dosya boyutu ve gizli anahtar taraması')
  for (const f of files) {
    const size = Number(git(['cat-file', '-s', `:${f}`]).stdout.trim() || 0)
    if (size > MAX_FILE_BYTES) {
      fail(`"${f}" ${(size / 1024 / 1024).toFixed(1)} MB; sınır ${MAX_FILE_BYTES / 1024 / 1024} MB.`)
      continue
    }
    if (f === 'package-lock.json') continue
    // Staged (index) içeriği taranır, çalışma dizinindeki değil.
    const content = git(['show', `:${f}`]).stdout
    if (content.includes('\0')) continue // ikili dosya
    for (const [name, re] of SECRET_PATTERNS) {
      const m = content.match(re)
      if (m) {
        const line = content.slice(0, m.index).split('\n').length
        fail(`${f}:${line} içinde olası ${name} var. Anahtarı koddan çıkarıp .env dosyasına taşı.`)
      }
    }
  }
}

function checkCrlfInScripts(files) {
  step('Kabuk betiklerinde satır sonu (LF)')
  for (const f of files.filter((p) => p.startsWith('hooks/') && !p.endsWith('.mjs'))) {
    const content = git(['show', `:${f}`]).stdout
    if (content.includes('\r\n')) {
      fail(`"${f}" CRLF satır sonu içeriyor; Linux/Mac'te çalışmaz. LF'e çevir (.gitattributes bunu normalde sağlar).`)
    }
  }
}

function preCommit() {
  const files = stagedFiles()
  if (files.length === 0) return

  checkBlockedPaths(files)
  checkSizeAndSecrets(files)
  checkCrlfInScripts(files)
  if (failures.length > 0) return // hızlı kontroller kalırsa pahalı olanları çalıştırma

  step('Lint (oxlint)')
  if (!run('npm run lint --silent').ok) fail('Lint hataları var.')

  step('Tip kontrolü (tsc)')
  const tsc = run('npx tsc -b')
  if (!tsc.ok) {
    fail('TypeScript hataları var.')
    memoryHint(tsc.out)
  }
}

// ------------------------------------------------------------------ pre-push
function compareVersion(a, b) {
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0)
  }
  return 0
}

function prePush() {
  step(`Node sürümü (en az ${MIN_NODE.join('.')})`)
  const current = process.versions.node.split('.').map(Number)
  if (compareVersion(current, MIN_NODE) < 0) {
    fail(`Node ${process.versions.node} çok eski; ${MIN_NODE.join('.')} veya üstü gerekli (.nvmrc'ye bak).`)
  }

  step('Lock dosyası package.json ile uyumlu mu')
  if (!existsSync('package-lock.json')) {
    fail('package-lock.json yok. "npm install" çalıştırıp commit et.')
  } else if (!run('npm ci --dry-run --ignore-scripts', { quiet: true }).ok) {
    fail('package-lock.json, package.json ile uyumsuz. "npm install" çalıştırıp lock dosyasını commit et.')
  }

  step('Çalışma dizini temiz mi (commit edilmemiş değişiklik)')
  if (git(['status', '--porcelain', '--untracked-files=no']).stdout.trim()) {
    console.log('  Uyarı: commit edilmemiş değişiklikler var; build onları da içerir, push edilen hali değil.')
  }

  step('Tam derleme (npm run build)')
  const build = run('npm run build --silent')
  if (!build.ok) {
    fail('Derleme başarısız; push durduruldu.')
    memoryHint(build.out)
  }

  step('README mevcut mu')
  if (!existsSync('README.md') || readFileSync('README.md', 'utf8').trim().length < 50) {
    fail('README.md eksik veya çok kısa.')
  }
}

// ---------------------------------------------------------------------- main
const hook = process.argv[2]
const handlers = { 'pre-commit': preCommit, 'pre-push': prePush }

if (!handlers[hook]) {
  console.error(`Bilinmeyen hook: ${hook}`)
  process.exit(2)
}

handlers[hook]()

if (failures.length > 0) {
  console.error(`\n✖ ${hook} başarısız:`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nAcil durumda atlamak için: git ' + (hook === 'pre-commit' ? 'commit' : 'push') + ' --no-verify (önerilmez).')
  process.exit(1)
}
console.log(`\n✔ ${hook} kontrolleri geçti.`)
