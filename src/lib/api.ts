import { treaty } from "@elysiajs/eden";

/**
 * API client dikonfigurasi untuk:
 * - Mengirim cookie otomatis (credentials: "include")
 * - Terhubung ke API backend
 *
 * Catatan: Menggunakan client tanpa tipe karena backend dideploy terpisah
 */
export const client = treaty(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  {
    fetch: {
      credentials: "include", // Aktifkan pengiriman cookie pada request
    },
  },
);
