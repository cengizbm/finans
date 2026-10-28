# Ajanlar

Her ajan ayrı bir dosyadır ve ayrı ayrı çalıştırılır.

| Ajan | Dosya | İş |
|------|-------|----|
| 1 | Ajan1-Planlayici.md | İşi analiz eder, plan çıkarır |
| 2 | Ajan2-Gelistirici.md | Kodu yazar/düzenler |
| 3 | Ajan3-Test.md | Test yazar ve çalıştırır |
| 4 | Ajan4-Inceleme.md | Kodu inceler, hata/güvenlik bulur |
| 5 | Ajan5-Dokumantasyon.md | README ve dokümantasyon hazırlar |
| 6 | Ajan6-Docker-Yayin.md | Docker ile canlıya alır, yayın kontrolü ve geri alma planı |

Önerilen sıra: 1 → 2 → 3 → 4 → 5 → 6 (ama istediğin sırayla çalıştırabilirsin).

## Kullanım
Claude Code'da bir ajanı çalıştırmak için dosyayı `.claude/agents/` klasörüne kopyala
(proje içinde veya `C:\Users\kceng\.claude\agents\`), sonra adıyla çağır, örn. `ajan2-gelistirici`.
Ya da dosyanın içeriğini yeni bir oturumun başında talimat olarak yapıştır.
