import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy untuk melindungi route dan menangani autentikasi
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const normalizeRole = (role: string) =>
    role.trim().toUpperCase().replace(/-/g, "_");

  // Definisikan prefix yang dilindungi
  const protectedPrefixes = [
    "/mahasiswa",
    "/supervisor-akademik",
    "/manajer-tu",
    "/wakil-dekan-1",
    "/upa",
    "/super-admin",
    "/dashboard",
  ];

  // Cek apakah path saat ini termasuk path yang dilindungi
  const isProtectedPath = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const sessionToken = request.cookies.get("better-auth.session_token");

  // Jika mencoba mengakses route terlindungi tanpa session, redirect ke login
  if (isProtectedPath && (!sessionToken || !sessionToken.value)) {
    console.log(`[Middleware] Blocking access to ${pathname} - No Session`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-Based Access Control (RBAC)
  // Kita perlu decode cookie untuk mengecek role.
  // Karena cookie BetterAuth bisa signed/encrypted, andalkan bagian yang bisa dibaca di sisi klien atau verifikasi sisi server.
  // Namun, di Middleware kita tidak mudah memanggil database.
  // OPSI: cek "better-auth.session_data" jika tersedia (seperti yang terlihat di log sebelumnya).
  // Kita coba parse cookie 'better-auth.session_data' yang sering berisi info user termasuk roles.

  const sessionData = request.cookies.get("better-auth.session_data");
  if (isProtectedPath && sessionToken && sessionData) {
    try {
      // Nilai session_data sering berupa base64 atau JSON. Dari log terlihat seperti base64 atau mirip jwt.
      // Log menunjukkan: better-auth.session_data=eyJzZXNzaW9u...
      // Kemungkinan berupa objek JSON.

      // CATATAN: Ini pengecekan sederhana. Idealnya gunakan session jwt stateless atau verifikasi di komponen.
      // Namun untuk proteksi path sederhana:

      // decode isi cookie (bisa jadi URI encoded)
      const decodedValue = decodeURIComponent(sessionData.value);
      // Bisa jadi base64, biasanya better-auth menyimpan sebagai JSON string atau Base64.
      // Coba parse jika terlihat seperti JSON, atau decode base64 terlebih dahulu.

      // Cek apakah ini base64 (umum pada session data)
      // Heuristik: awalan 'ey' biasanya berarti Base64 JSON
      let jsonString = decodedValue;
      if (decodedValue.startsWith("ey")) {
        jsonString = Buffer.from(decodedValue, "base64").toString("utf-8");
      }

      // Pertama coba cek cookie user_roles eksplisit yang diset oleh handler manual
      const userRolesCookie = request.cookies.get("user_roles");
      let userRoles: string[] = [];

      if (userRolesCookie) {
        userRoles = userRolesCookie.value
          .split(",")
          .map((role) => normalizeRole(role))
          .filter(Boolean);
      } else {
        // Cadangan: parse session data jika tersedia
        const parsed = JSON.parse(jsonString);
        const rawRoles =
          parsed?.user?.roles ??
          parsed?.user?.role ??
          parsed?.session?.user?.roles ??
          parsed?.session?.user?.role ??
          [];

        if (Array.isArray(rawRoles)) {
          userRoles = rawRoles.map((role) => normalizeRole(role));
        } else if (typeof rawRoles === "string") {
          userRoles = [normalizeRole(rawRoles)];
        }
      }

      // Definisikan pemetaan role ke path
      const rolePathMap: Record<string, string> = {
        MAHASISWA: "/mahasiswa",
        SUPERVISOR_AKADEMIK: "/supervisor-akademik",
        MANAJER_TU: "/manajer-tu",
        WAKIL_DEKAN_1: "/wakil-dekan-1",
        UPA: "/upa",
        SUPER_ADMIN: "/super-admin",
      };

      // Super Admin punya akses ke semua path — lewati pembatasan role-path
      if (userRoles.length === 0) {
        // Jika role tidak terdeteksi dari cookie, jangan block agar user tidak terjebak.
        // Arahkan validasi role ke sisi server atau pastikan cookie user_roles diisi.
      } else if (userRoles.includes("SUPER_ADMIN")) {
        // Izinkan akses ke path terlindungi apa pun
      } else {
        // Cek apakah user mengakses path yang diizinkan untuk rolenya
        // Iterasi semua map. Jika path diawali nilai map tertentu, user WAJIB punya role key tersebut.
        for (const [role, path] of Object.entries(rolePathMap)) {
          if (pathname.startsWith(path)) {
            if (!userRoles.includes(role)) {
              console.log(
                `[Middleware] RBAC Block: User with roles [${userRoles}] tried accessing ${pathname}`,
              );
              // Redirect ke dashboard miliknya berdasarkan role pertama
              const userRole = userRoles[0];
              const targetPath = rolePathMap[userRole] || "/dashboard";
              return NextResponse.redirect(new URL(targetPath, request.url));
            }
          }
        }
      }
    } catch (e) {
      console.error("[Middleware] Failed to parse session data for RBAC:", e);
      // Jika error (cookie dimanipulasi?), bisa diabaikan atau paksa login ulang.
      // Untuk sekarang kita izinkan agar user valid tidak terkunci karena bug parsing,
      // namun di production sebaiknya validasi ketat.
    }
  }

  // Jika sudah login lalu akses halaman login, biarkan halaman yang menangani
  // atau bisa juga redirect ke dashboard berbasis role jika role tersedia di cookie.
  // Untuk saat ini kita izinkan supaya user tetap bisa melihat status atau logout.
  // Jika sudah login dan mengakses /login, bisa diarahkan ke dashboard
  // Jika sudah login dan mengakses /login, bisa diarahkan ke dashboard sesuai role
  // DIHAPUS: Redirect otomatis ke dashboard di sini dapat memicu loop tak berujung atau halaman rusak
  // jika backend down (proxy error) tetapi cookie lama masih ada.
  // Biarkan halaman Login sisi klien memverifikasi session dan redirect jika valid.
  /*
    if (pathname === "/login" && sessionToken) {
        let targetPath = "/dashboard";

        // Coba infer role dari cookie untuk redirect yang lebih tepat
        const userRolesCookie = request.cookies.get("user_roles");

        const rolePathMap: Record<string, string> = {
            MAHASISWA: "/mahasiswa",
            SUPERVISOR: "/supervisor-akademik",
            MANAJER_TU: "/manajer-tu",
            WAKIL_DEKAN_1: "/wakil-dekan-1",
            UPA: "/upa",
        };

        if (userRolesCookie) {
            const roles = userRolesCookie.value.split(",");
            if (roles.length > 0) {
                const firstRole = roles[0].toUpperCase();
                if (rolePathMap[firstRole]) {
                    targetPath = rolePathMap[firstRole];
                }
            }
        } else {
            // Cadangan ke session data
            const sessionData = request.cookies.get("better-auth.session_data");
            if (sessionData) {
                try {
                    const decodedValue = decodeURIComponent(sessionData.value);
                    let jsonString = decodedValue;
                    if (decodedValue.startsWith("ey")) {
                        jsonString = Buffer.from(
                            decodedValue,
                            "base64",
                        ).toString("utf-8");
                    }
                    const parsed = JSON.parse(jsonString);
                    const userRoles = parsed.user?.roles || [];

                    if (userRoles.length > 0) {
                        // Normalisasi role seperti di halaman login (jaga-jaga)
                        const firstRole = userRoles[0].toUpperCase();
                        if (rolePathMap[firstRole]) {
                            targetPath = rolePathMap[firstRole];
                        }
                    }
                } catch {
                    // abaikan error parsing, gunakan fallback ke /dashboard
                }
            }
        }
        return NextResponse.redirect(new URL(targetPath, request.url));
    }
    */

  return NextResponse.next();
}

/**
 * Konfigurasi route mana saja yang dijalankan middleware ini
 */
export const config = {
  matcher: [
    /*
     * Cocokkan semua request path kecuali yang diawali dengan:
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file favicon)
     * - file public (gambar, dll.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
