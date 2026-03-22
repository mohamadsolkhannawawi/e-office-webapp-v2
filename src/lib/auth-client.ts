import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client untuk frontend
 * Dikonfigurasi untuk terhubung ke backend via Next.js Proxy (port 3000 -> 3005)
 * Better Auth otomatis menambahkan basePath (/api/auth) dari konfigurasi server
 */
export const authClient = createAuthClient({
  // Gunakan origin browser saat ini agar request auth selalu ke origin yang sama (hindari CORS).
  // Fallback ke env var untuk SSR, lalu localhost untuk development lokal.
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Fungsi helper auth
 */
export const auth = {
  // Login dengan email dan password
  signIn: async (email: string, password: string) => {
    return await authClient.signIn.email({
      email,
      password,
    });
  },

  // Logout
  signOut: async () => {
    return await authClient.signOut();
  },

  // Ambil session saat ini
  getSession: async () => {
    return await authClient.getSession();
  },

  // Daftar (register)
  signUp: async (email: string, password: string, name: string) => {
    return await authClient.signUp.email({
      email,
      password,
      name,
    });
  },
};
