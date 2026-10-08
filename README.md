# crutha.ai — AI Pre-Production Planner for Short-Form Video

From Product Brief to Shoot-Ready Video Plan. (Next.js 15 · React 19 · TypeScript · Tailwind · PostgreSQL)

## Run
```bash
npm install
cp .env.example .env.local     # tanpa DATABASE_URL => Postgres in-memory (pg-mem), data hilang saat restart
npm run dev                    # http://localhost:3000
```
Postgres sungguhan: `docker compose up -d`, lalu isi `DATABASE_URL` (skema dibuat otomatis, lihat `src/lib/db/index.ts`).

## AI provider (modular)
`AI_PROVIDER=mock|openai|gemini` — lihat `src/lib/ai/`. UI tidak pernah memanggil provider langsung.
Alur: input → zod validation → `strategy.ts` → `prompt.ts` → `AIProvider` → JSON parse + zod validation (retry/repair 3x) → DB.
Tambah provider baru: implement `AIProvider` di `provider.ts`, daftarkan di `getProvider()` (`engine.ts`).

## Config
- Harga/paket: `src/config/pricing.ts` (satu-satunya sumber)
- Template: `src/config/templates.ts`

## MVP scope
Auth (JWT cookie), dashboard, create project, Product→Video Plan, hook/script/scene/shot list/editing guide/CTA/caption,
edit semua output (autosave), regenerate per section, duplicate/rename/delete project, export Markdown.
Mode 2–4 tampil sebagai "Segera". Tidak ada video generation / auto-editing.

## Web & mobile
- Responsive: sidebar di desktop, tab bar bawah di HP; scene tampil sebagai kartu di layar kecil, tabel di desktop.
- PWA: bisa di-install ke home screen (manifest + service worker aktif di production). Di HP: buka website → "Add to Home Screen".
- Deploy: `docker build -t clipplan . && docker run -p 3000:3000 --env-file .env.local clipplan`
  (set `DATABASE_URL`, `AUTH_SECRET`, dan `AI_PROVIDER` + API key). Bisa juga di-deploy ke Vercel/Railway/Render; wajib pakai Postgres sungguhan.

## Security
- **Auth**: email + password, bcrypt (cost 10), JWT (HS256, 7 hari) di cookie `HttpOnly` + `SameSite=Lax` + `Secure` (production). Akun nonaktif langsung ditolak di setiap request.
- **RBAC**: role `user` / `admin` (kolom `users.role` atau env `ADMIN_EMAILS`). Role dibaca ulang dari DB di setiap request; `/admin` dan `/api/admin/*` dijaga di level page dan API (`adminOnly`).
- **Ownership**: semua query project di-scope `user_id`; project milik orang lain = 404.
- **Rate limiting** (`src/lib/ratelimit.ts`, in-memory per instance — ganti ke Redis jika multi-instance): login 8/15 mnt per akun+IP & 30 per IP, register 5/jam per IP, generate 10/mnt & 100/hari, regenerate 20/mnt & 300/hari, API umum 120/mnt per user.
- **Validasi backend**: semua body divalidasi zod (termasuk plan yang dikirim client ke regenerate), batas ukuran body, cek Origin untuk request tulis (CSRF), pesan error server tidak membocorkan detail internal.
- **API key**: `OPENAI_API_KEY` / `GEMINI_API_KEY` hanya dibaca di server (`src/lib/ai/*`), tidak pernah dikirim ke browser. Jangan memakai prefix `NEXT_PUBLIC_`.
- **Audit log**: tabel `audit_logs` (login, login gagal, register, logout, create/rename/delete/duplicate project, aksi admin) — lihat di `/admin/audit`.
- Production: set `AUTH_SECRET` (≥32 karakter acak), `DATABASE_URL`, jalankan di belakang HTTPS.
