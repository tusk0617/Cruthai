import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Setup diagnostics. Reports only booleans and a mapped hint — never values, hostnames, or usernames.
const HINTS: Record<string, string> = {
  ENOTFOUND: "Host database tidak ditemukan — cek DATABASE_URL (salah salin host).",
  ECONNREFUSED: "Koneksi ditolak — host/port salah, atau memakai localhost (tidak bisa di Vercel).",
  ETIMEDOUT: "Koneksi timeout — database tidak bisa dijangkau.",
  "28P01": "Password database salah — salin ulang connection string dari Neon.",
  "28000": "Autentikasi ditolak — cek user/password pada DATABASE_URL.",
  "3D000": "Nama database tidak ada — cek bagian akhir DATABASE_URL.",
  "08P01": "Protokol ditolak — coba hapus parameter channel_binding dari DATABASE_URL.",
};

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const checks: Record<string, unknown> = {
    databaseUrlSet: !!url,
    databaseUrlLooksValid: /^postgres(ql)?:\/\//.test(url),
    authSecretOk: (process.env.AUTH_SECRET ?? "").length >= 32,
    adminEmailsSet: !!process.env.ADMIN_EMAILS,
    upstashSet: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    aiProvider: process.env.AI_PROVIDER || "mock (atau diatur di /admin/ai)",
  };
  if (!url) {
    checks.db = "DATABASE_URL belum diisi — server memakai database in-memory yang tidak berfungsi di Vercel.";
  } else {
    try {
      await query("select 1");
      checks.db = "ok";
    } catch (e) {
      const err = e as { code?: string; message?: string; errors?: { code?: string }[] };
      const code = err.code ?? err.errors?.[0]?.code ?? "";
      checks.db = HINTS[code] ?? `Gagal terhubung (${code || err.name || "error"})`;
    }
  }
  return NextResponse.json(checks, { status: checks.db === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
