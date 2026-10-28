# Defterim — Kişisel Finans Paneli

Gelir ve giderleri girip kategori bazında donut grafikte görebileceğin, yerelde çalışan bir panel. Veri yalnızca tarayıcı belleğindedir (React state); sayfa yenilenince örnek (dummy) veriye dönülür. Backend, veritabanı ve giriş yoktur.

## Çalıştırma

```bash
npm install
npm run dev
```

Ardından terminalde yazan adresi aç (genelde http://localhost:5173).

Üretim derlemesi için: `npm run build`.

## Teknoloji

React + Vite + TypeScript, Tailwind CSS v4, Recharts, lucide-react. Yazı tipleri: Fraunces ve Inter (`@fontsource`, Türkçe karakter destekli).

## Dosya yapısı

```
src/
├─ main.tsx, App.tsx        giriş noktası ve durum (state) yönetimi
├─ types.ts                 Transaction, Category tipleri
├─ data/
│  ├─ categories.ts         kategori adı, renk, ikon
│  └─ dummyTransactions.ts  içinde bulunulan aya yayılmış örnek işlemler
├─ lib/
│  ├─ format.ts             TRY (tr-TR) para, tarih, ay biçimlendirme
│  └─ aggregate.ts          saf fonksiyonlar: toplamlar, kategori dağılımı
└─ components/
   ├─ SummaryCards.tsx      net bakiye, gelir, gider, tasarruf oranı
   ├─ CategoryPieChart.tsx  Gider | Gelir geçişli donut + legend
   ├─ TransactionList.tsx   liste, filtre, arama, silme
   ├─ TransactionForm.tsx   doğrulamalı ekleme formu
   ├─ Modal.tsx             yerel <dialog> (odak tuzağı, Esc)
   └─ Toast.tsx             bildirim ve "Geri al"
```

## Kullanım notları

- Legend'daki bir kategoriye tıklamak listeyi o kategoriye göre filtreler; tekrar tıklamak kaldırır.
- Silinen işlem için bildirimdeki "Geri al" ile geri dönülebilir.
- Üstteki ok düğmeleriyle ay değiştirilir; örnek veri yalnızca bu aydadır.
- `prefers-reduced-motion` açıksa animasyonlar kapanır.
