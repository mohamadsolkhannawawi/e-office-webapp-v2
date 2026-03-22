import { test, expect } from "@playwright/test";
import { loginAs, uploadMockFile, USERS, fillStep1Identitas } from "./utils";
import path from "path";

test.describe("Surat Rekomendasi Beasiswa - Happy Path", () => {
  test.setTimeout(120000); // timeout 2 menit untuk alur penuh

  let letterId: string;
  // timestamp agar data unik
  const timestamp = Date.now();
  const uniqueBeasiswaName = `Beasiswa E2E Test ${timestamp}`;

  test("Complete Approval Workflow", async ({ page }) => {
    // --- 1. PENGAJUAN MAHASISWA ---
    await test.step("Mahasiswa Submission", async () => {
      await loginAs(page, "MAHASISWA");

      // Navigasi ke pembuatan SRB (Internal)
      await page.goto("/mahasiswa/surat/surat-rekomendasi-beasiswa/internal");

      // Tahap 1: Identitas (terisi otomatis, tetapi tetap cek validasi)
      await expect(page.locator("text=Identitas Pemohon")).toBeVisible();
      await fillStep1Identitas(page);
      await page.click('button:has-text("Lanjut")');

      // Tahap 2: Detail
      await expect(page.locator("text=Detail Pengajuan")).toBeVisible();
      await page.fill('input[name="namaBeasiswa"]', uniqueBeasiswaName);
      await page.click('button:has-text("Lanjut")');

      // Tahap 3: Lampiran
      await expect(page.locator("text=Lampiran Dokumen")).toBeVisible();

      // Unggah KTM (input file pertama)
      // Catatan: di React, input[type=file] bisa tersembunyi.
      // Kita targetkan input pertama untuk berkas utama.
      const fileInputs = page.locator('input[type="file"]');
      await expect(fileInputs.first()).toBeAttached();

      // Buat buffer file dummy
      const buffer = Buffer.from("dummy content");

      // Unggah KTM
      await fileInputs.first().setInputFiles({
        name: "ktm_mock.pdf",
        mimeType: "application/pdf",
        buffer: buffer,
      });
      // Tunggu proses unggah (cek apakah file muncul di daftar)
      await expect(page.locator("text=ktm_mock.pdf")).toBeVisible({
        timeout: 10000,
      });

      // Unggah file tambahan (opsional tetapi baik untuk diuji)
      await fileInputs.nth(1).setInputFiles({
        name: "extra_mock.pdf",
        mimeType: "application/pdf",
        buffer: buffer,
      });
      await expect(page.locator("text=extra_mock.pdf")).toBeVisible({
        timeout: 10000,
      });

      await page.click('button:has-text("Lanjut")');

      // Tahap 4: Review
      await expect(page.locator("text=Review & Ajukan")).toBeVisible();
      await expect(page.locator(`text=${uniqueBeasiswaName}`)).toBeVisible();

      // Submit
      await page.click('button:has-text("Ajukan Surat")');
      await page.click('button:has-text("Ya, Ajukan")');

      // Verifikasi redirect ke halaman Detail
      await expect(page).toHaveURL(/\/detail\//);

      // Ambil ID dari URL
      const url = page.url();
      const IdMatch = url.match(/\/detail\/([a-zA-Z0-9-]+)/);
      if (!IdMatch) throw new Error("Could not extract ID from URL");
      letterId = IdMatch[1];
      console.log(`Created Letter ID: ${letterId}`);

      // Cek status "PENDING" atau "DIPROSES" (view bisa menampilkan 'Menunggu Verifikasi Supervisor')
      // Detail status kemungkinan berupa teks pada halaman
      await expect(
        page.getByText(/Menunggu Verifikasi|Diproses/i),
      ).toBeVisible();
    });

    // --- 2. APPROVAL SUPERVISOR ---
    await test.step("Supervisor Approval", async () => {
      await loginAs(page, "SUPERVISOR");
      await page.goto("/supervisor-akademik/surat/perlu-tindakan");

      // Filter/Search (cek dasar)
      // Asumsikan ada input pencarian
      const searchInput = page.getByPlaceholder(/Cari|Search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill(USERS.MAHASISWA.name); // Cari berdasarkan nama mahasiswa
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000); // Tunggu debounce/fetch
      }

      // Klik baris dengan letterId (atau nama mahasiswa/nama beasiswa)
      // Idealnya cari link atau baris yang memuat nama
      await page.locator(`text=${uniqueBeasiswaName}`).click();

      // Harus berada di halaman detail
      await expect(page).toHaveURL(new RegExp(`/detail/${letterId}`));

      // Approve
      // Cari tombol "Setujui"
      // Bisa jadi berada di wrapper atau pemicu modal
      await page.click('button:has-text("Setujui")');

      // Konfirmasi modal
      await page.locator('button:has-text("Ya, Setujui")').click();

      // Tunggu sukses/redirect
      // Biasanya kembali ke daftar atau tetap di detail dengan status terbaru
      await expect(page.getByText("Berhasil")).toBeVisible({
        timeout: 10000,
      });
    });

    // --- 3. APPROVAL MANAJER TU ---
    await test.step("Manajer TU Approval", async () => {
      await loginAs(page, "MANAJER_TU");
      await page.goto("/manajer-tu/surat/perlu-tindakan");

      // Cari dan klik
      await page.locator(`text=${uniqueBeasiswaName}`).click();

      // Approve
      await page.click('button:has-text("Setujui")');
      await page.locator('button:has-text("Ya, Setujui")').click();
      await expect(page.getByText("Berhasil")).toBeVisible({
        timeout: 10000,
      });
    });

    // --- 4. PENANDATANGANAN WAKIL DEKAN 1 ---
    await test.step("Wakil Dekan 1 Signing", async () => {
      await loginAs(page, "WAKIL_DEKAN_1");
      await page.goto("/wakil-dekan-1/surat/perlu-tindakan");

      // Cari dan klik
      await page.locator(`text=${uniqueBeasiswaName}`).click();

      // Tanda Tangani (dapat membuka modal/dialog)
      const signButton = page.locator('button:has-text("Tanda Tangani")');
      await expect(signButton).toBeVisible();
      await signButton.click();

      // Menangani modal tanda tangan
      // Asumsikan tab: "Upload", "Template", "Tulis"
      // Gunakan "Template" jika tersedia, atau langsung submit jika default
      // Cek tab "Template"
      const templateTab = page.locator(
        'button[role="tab"]:has-text("Template")',
      );
      if (await templateTab.isVisible()) {
        await templateTab.click();
        // Pilih template jika daftar ada, atau gunakan yang sudah default
        // Cukup klik "Simpan" atau "Tanda Tangani" di dalam modal
      }

      // Klik "Simpan Tanda Tangan" atau sejenisnya pada modal
      await page
        .locator('button:has-text("Simpan"), button:has-text("Gunakan")')
        .last()
        .click();

      // Setelah menandatangani, biasanya perlu approve eksplisit atau signing langsung dianggap approve?
      // Asumsikan approve eksplisit masih dibutuhkan atau signing memicunya.
      // Berdasarkan prompt sebelumnya: "Apabila disetujui maka akan naik ke UPA" -> mengindikasikan ada aksi approve.
      // Namun umumnya Signing adalah approve untuk WD1.
      // Cek apakah tombol "Setujui" tersedia.
      const approveButton = page.locator('button:has-text("Setujui")');
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await page.locator('button:has-text("Ya, Setujui")').click();
      }

      await expect(page.getByText("Berhasil")).toBeVisible({
        timeout: 10000,
      });
    });

    // --- 5. PENERBITAN OLEH UPA ---
    await test.step("UPA Publishing", async () => {
      await loginAs(page, "UPA");
      await page.goto("/upa/surat/perlu-tindakan");

      // Cari dan klik
      await page.locator(`text=${uniqueBeasiswaName}`).click();

      // Aksi: "Terbitkan" / "Nomori"
      await page.click(
        'button:has-text("Terbitkan"), button:has-text("Proses")',
      );

      // Isi "Nomor Surat" jika diminta
      const noSuratInput = page.locator(
        'input[name="nomorSurat"], input[placeholder*="Nomor Surat"]',
      );
      if (await noSuratInput.isVisible()) {
        await noSuratInput.fill(
          `B/${Math.floor(Math.random() * 1000)}/UN7.5.8/DL/2026`,
        );
      }

      // Konfirmasi terbitkan
      await page
        .locator('button:has-text("Terbitkan"), button:has-text("Simpan")')
        .last()
        .click();

      await expect(page.getByText("Berhasil")).toBeVisible({
        timeout: 10000,
      });
    });

    // --- 6. CEK AKHIR MAHASISWA ---
    await test.step("Mahasiswa Verification", async () => {
      await loginAs(page, "MAHASISWA");
      await page.goto("/mahasiswa/surat/selesai");

      // Cek apakah surat tersedia
      await expect(page.locator(`text=${uniqueBeasiswaName}`)).toBeVisible();

      // Buka detail
      await page.locator(`text=${uniqueBeasiswaName}`).click();

      // Cek status "Selesai"
      await expect(page.getByText(/Selesai|Terbit/i)).toBeVisible();

      // Cek keberadaan tombol Download
      await expect(
        page.locator('a:has-text("Download"), button:has-text("Download")'),
      ).toBeVisible();
    });
  });
});
