# E-Office WebApp Surat Rekomendasi Beasiswa - Frontend

Web Application untuk Sistem E-Office (Surat Rekomendasi Beasiswa & Dashboard Role-Based) yang dibangun dengan Next.js 16 dan Tailwind CSS 4.

## 📋 Daftar Isi

- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Project](#struktur-project)
- [Fitur Utama](#fitur-utama)
- [Troubleshooting](#troubleshooting)

## 🛠️ Prasyarat

Pastikan komputer Anda memiliki tools berikut dengan versi minimal yang ditentukan:

### 1. Bun Runtime

```bash
bun --version
```

**Versi yang diperlukan: Bun 1.0 atau lebih tinggi**

Download dari: https://bun.sh

### 2. Git

```bash
git --version
```

Download dari: https://git-scm.com/downloads

## 📥 Instalasi

### Step 1: Clone Repository

```bash
git clone https://your-repository-url/e-office-webapp-v2.git
cd e-office-webapp-v2
```

### Step 2: Install Dependencies

```bash
bun install
```

## ⚙️ Konfigurasi

### 1. Setup Environment File

Buat file `.env.local` di root folder project dan sesuaikan dengan konfigurasi API Anda:

```env
NEXT_PUBLIC_API_URL=http://localhost:3005
```

> **Note:** `NEXT_PUBLIC_API_URL` harus mengarah ke backend API (e-office-api-v2).

## 🚀 Menjalankan Aplikasi

### Mode Development

Untuk menjalankan aplikasi dalam mode development dengan hot-reloading:

```bash
bun run dev
```

Akses aplikasi di: [http://localhost:3000](http://localhost:3000)

### Mode Production

Untuk membangun dan menjalankan versi produksi:

```bash
# Build aplikasi
bun run build

# Start server produksi
bun run start
```

### Linting

Untuk memeriksa masalah kode:

```bash
bun run lint
```

## 📁 Struktur Project

```
e-office-webapp-v2/
├── src/
│   ├── app/                    # App Router (Pages & Layouts)
│   │   ├── (dashboard)/        # Protected Routes (Role-Based)
│   │   │   ├── mahasiswa/      # Dashboard Mahasiswa
│   │   │   ├── supervisor/     # Dashboard Supervisor Akademik
│   │   │   ├── manajer-tu/     # Dashboard Manajer TU
│   │   │   ├── wakil-dekan-1/  # Dashboard Wakil Dekan 1
│   │   │   └── upa/            # Dashboard UPA
│   │   └── (preview)/          # Document Preview Routes
│   ├── components/
│   │   ├── ui/                 # Reusable UI Components (Shadcn-like)
│   │   ├── layout/             # Navbar, Sidebar, Shell
│   │   └── features/           # Feature-specific Components
│   │       ├── dashboard/      # Dashboard Widgets
│   │       └── surat-rekomendasi-beasiswa/ # Fitur Surat Rekomendasi
│   ├── lib/                    # Utility functions & API clients
│   ├── types/                  # TypeScript Data Types
│   └── constants/              # App Constants (Roles, Routes)
├── public/                     # Static Assets
├── .env.local                  # Environment Variables
├── next.config.ts              # Next.js Configuration
├── package.json                # Project Dependencies
└── tsconfig.json               # TypeScript Configuration
```

## ✨ Fitur Utama

### Role-Based Access Control

Aplikasi menyediakan dashboard yang berbeda berdasarkan role pengguna:

- **Mahasiswa:** Pengajuan surat, tracking status, revisi, riwayat.
- **Supervisor Akademik:** Verifikasi akademik, persetujuan.
- **Manajer TU:** Validasi administratif & kelengkapan dokumen.
- **Wakil Dekan 1:** Approval akhir & tanda tangan elektronik.
- **UPA:** Manajemen data beasiswa & validasi akhir.

### Surat Rekomendasi Beasiswa

- **Multi-step Form:** Pengajuan surat dengan wizard intuitif.
- **Document Preview:** Preview dokumen (PDF/Gambar) langsung di browser.
- **Status Tracking:** Pelacakan status surat real-time (Diajukan, Diverifikasi, Disetujui, Ditolak).
- **Digital Signature:** Integrasi tanda tangan digital untuk pejabat berwenang.

## 🐛 Troubleshooting

### Error: "Module not found"

Jika terjadi error import setelah pull terbaru:

```bash
bun install
```

Lalu restart development server.

### Error: "Hydration failed"

Biasanya terjadi karena ketidakcocokan HTML antara server dan client. Cek console browser untuk detail elemen yang bermasalah.

### Error: "Fetch failed"

Pastikan `e-office-api-v2` (Backend) sudah berjalan pada port yang sesuai dengan `NEXT_PUBLIC_API_URL`.

## 🤝 Kolaborasi

### Workflow & Git

1. **Pull Terbaru:** Selalu update dari branch `main` sebelum mulai.
2. **Branching:** Gunakan format `feature/nama-fitur` atau `fix/nama-bug`.
3. **Commit:** Gunakan Conventional Commits (`feat:`, `fix:`, `refactor:`).

```bash
git commit -m "feat(mahasiswa): tambah form pengajuan beasiswa"
```

---

**Built with Next.js 16 & Bun 🚀**
