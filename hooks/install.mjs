// Git'e hook klasörünü tanıtır: "npm run hooks:install" (npm install sonrası otomatik de çalışır).
// Git deposu yoksa (CI, Vercel, ilk kurulum) sessizce çıkar; kurulumu bozmaz.
import { spawnSync } from 'node:child_process'
import { chmodSync } from 'node:fs'

const inRepo = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' })
if (inRepo.status !== 0 || process.env.CI) {
  console.log('hooks: git deposu bulunamadı (veya CI); atlandı. "git init" sonrası "npm run hooks:install" çalıştır.')
  process.exit(0)
}

spawnSync('git', ['config', 'core.hooksPath', 'hooks'], { stdio: 'inherit' })
for (const name of ['pre-commit', 'pre-push']) {
  try {
    chmodSync(new URL(`./${name}`, import.meta.url), 0o755) // Windows'ta etkisiz, Mac/Linux için gerekli
  } catch {
    /* yoksay */
  }
}
console.log('hooks: kuruldu (core.hooksPath = hooks).')
