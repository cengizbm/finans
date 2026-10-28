# Git hook'ları

Kurulum (bir kez): `npm run hooks:install` (depo varsa `npm install` bunu otomatik yapar).

| Hook | Ne zaman | Ne yapar |
|---|---|---|
| `pre-commit` | `git commit` | `.env`, `node_modules`, `dist`, `.pem/.key` gibi dosyaları engeller; 5 MB üstü dosyayı engeller; API anahtarı/token sızıntısı tarar (21st, Anthropic, OpenAI, GitHub, AWS, özel anahtar); hook betiklerinde CRLF'yi yakalar; `oxlint` ve `tsc` çalıştırır |
| `pre-push` | `git push` | Node sürümünü (≥ 20.19) kontrol eder; `package-lock.json`'ın `package.json` ile uyumunu (`npm ci --dry-run`) doğrular; tam `npm run build` çalıştırır; README'yi kontrol eder |

Tüm kurallar `checks.mjs` içinde; Windows, Mac ve Linux'ta aynı çalışır.

## Sık karşılaşılanlar

- **Anahtar bulundu hatası:** anahtarı koddan sil, `.env` dosyasına koy (`.env` zaten `.gitignore`'da). Anahtar bir kez commit'lendiyse yenile; geçmişten silmek yetmez.
- **errno 1455 / out of memory (Windows):** dev sunucusunu ve gereksiz Chrome sekmelerini kapat, tekrar dene.
- **Acil atlama:** `git commit --no-verify` / `git push --no-verify` (önerilmez).
