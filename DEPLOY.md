# Deploy ke Vercel (gratis untuk mulai)

> Vercel Hobby tidak boleh dipakai untuk usaha komersial. Begitu mulai menarik bayaran, pindah ke Vercel Pro atau hosting lain.

## 1. Siapkan layanan pendukung (semua punya paket gratis)
1. **Postgres — Neon** (neon.tech): buat project → salin *connection string* (`postgres://...?sslmode=require`).
2. **Redis — Upstash** (upstash.com): buat database → salin `REST URL` dan `REST TOKEN`. Wajib agar rate limit bekerja lintas instance di serverless.
3. **API key AI** (opsional): OpenAI atau Gemini. Tanpa ini aplikasi memakai `mock`.

## 2. Deploy
```bash
npm i -g vercel
vercel login
vercel            # ikuti pertanyaan; framework terdeteksi Next.js otomatis
```
(Atau push ke GitHub lalu *Import Project* di vercel.com.)

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)
| Nama | Isi |
|---|---|
| `DATABASE_URL` | connection string Neon |
| `AUTH_SECRET` | string acak ≥ 32 karakter (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `ADMIN_EMAILS` | emailmu — bukan `admin@clipplan.local` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | dari Upstash |
| `AI_PROVIDER` | `mock`, `openai`, atau `gemini` |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` | sesuai provider (tanpa prefix `NEXT_PUBLIC_`) |

Setelah mengisi, jalankan `vercel --prod` (atau redeploy).

## 4. Setelah online
1. Daftar di `/signup` memakai email yang ada di `ADMIN_EMAILS` → otomatis admin → `/admin`.
2. Tabel dibuat otomatis saat request pertama.
3. Cek `/admin/audit` untuk memastikan login tercatat.
