import { test, expect } from "@playwright/test";
import { loginAs, USERS, fillStep1Identitas } from "./utils";

test.describe("Surat Rekomendasi Beasiswa - Revision & Rejection", () => {
  test.setTimeout(120000);

  const timestamp = Date.now();
  const uniqueBeasiswaName = `Beasiswa Revision Test ${timestamp}`;
  let letterId: string;

  test("Scenario A: Supervisor Rejection", async ({ page }) => {
    // 1. Pengajuan oleh Mahasiswa
    await loginAs(page, "MAHASISWA");
    await page.goto("/mahasiswa/surat/surat-rekomendasi-beasiswa/internal");
    await fillStep1Identitas(page);
    await page.click('button:has-text("Lanjut")'); // Tahap 1
    await page.fill(
      'input[name="namaBeasiswa"]',
      uniqueBeasiswaName + " Allow Reject",
    ); // Tahap 2
    await page.click('button:has-text("Lanjut")');
    // Unggah file mock
    const fileInputs = page.locator('input[type="file"]');
    const buffer = Buffer.from("dummy content");
    await fileInputs.first().setInputFiles({
      name: "ktm_mock.pdf",
      mimeType: "application/pdf",
      buffer,
    });
    await expect(page.locator("text=ktm_mock.pdf")).toBeVisible();
    await page.click('button:has-text("Lanjut")'); // Tahap 3
    await page.click('button:has-text("Ajukan Surat")');
    await page.click('button:has-text("Ya, Ajukan")');

    // Ambil ID
    const url = page.url();
    const IdMatch = url.match(/\/detail\/([a-zA-Z0-9-]+)/);
    if (IdMatch) letterId = IdMatch[1];

    // 2. Supervisor menolak
    await loginAs(page, "SUPERVISOR");
    await page.goto("/supervisor-akademik/surat/perlu-tindakan");
    await page.locator(`text=${uniqueBeasiswaName} Allow Reject`).click();

    // Tolak
    await page.click('button:has-text("Tolak")');
    // Isi alasan
    await page.fill(
      'textarea[name="catatan"], textarea[placeholder*="alasan"]',
      "Maaf, data tidak valid. Ditolak.",
    );
    await page.click('button:has-text("Ya, Tolak")');
    await expect(page.getByText("Berhasil")).toBeVisible();

    // 3. Mahasiswa cek status
    await loginAs(page, "MAHASISWA");
    await page.goto("/mahasiswa/surat/selesai"); // Atau halaman riwayat/status
    // Jika ditolak, bisa ada di "Selesai" (sebagai selesai/ditolak) atau "Arsip"?
    // Atau cek langsung ke halaman detail
    await page.goto(
      `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${letterId}`,
    );
    await expect(page.getByText(/Ditolak/i)).toBeVisible();
    await expect(
      page.getByText("Maaf, data tidak valid. Ditolak."),
    ).toBeVisible();
  });

  test("Scenario B: Manajer TU Revision to Mahasiswa", async ({ page }) => {
    const revName = uniqueBeasiswaName + " Revision";

    // 1. Pengajuan oleh Mahasiswa
    await loginAs(page, "MAHASISWA");
    await page.goto("/mahasiswa/surat/surat-rekomendasi-beasiswa/internal");
    await fillStep1Identitas(page);
    await page.click('button:has-text("Lanjut")'); // Tahap 1
    await page.fill('input[name="namaBeasiswa"]', revName); // Tahap 2
    await page.click('button:has-text("Lanjut")');
    const fileInputs = page.locator('input[type="file"]');
    const buffer = Buffer.from("dummy content");
    await fileInputs.first().setInputFiles({
      name: "ktm_mock.pdf",
      mimeType: "application/pdf",
      buffer,
    });
    await expect(page.locator("text=ktm_mock.pdf")).toBeVisible();
    await page.click('button:has-text("Lanjut")'); // Tahap 3
    await page.click('button:has-text("Ajukan Surat")');
    await page.click('button:has-text("Ya, Ajukan")');

    // Ambil ID
    const url = page.url();
    const IdMatch = url.match(/\/detail\/([a-zA-Z0-9-]+)/);
    if (IdMatch) letterId = IdMatch[1];

    // 2. Supervisor menyetujui
    await loginAs(page, "SUPERVISOR");
    await page.goto("/supervisor-akademik/surat/perlu-tindakan");
    await page.locator(`text=${revName}`).click();
    await page.click('button:has-text("Setujui")');
    await page.locator('button:has-text("Ya, Setujui")').click();

    // 3. Manajer TU meminta revisi
    await loginAs(page, "MANAJER_TU");
    await page.goto("/manajer-tu/surat/perlu-tindakan");
    await page.locator(`text=${revName}`).click();
    await page.click('button:has-text("Revisi")');

    // Target: Mahasiswa (jika bisa dipilih)
    // Asumsikan default atau melalui radio button
    const targetRadio = page.locator(
      'input[value="MAHASISWA"], label:has-text("Mahasiswa")',
    );
    if (await targetRadio.isVisible()) {
      await targetRadio.click();
    }

    await page.fill(
      'textarea[name="catatan"], textarea[placeholder*="revisi"]',
      "Tolong perbaiki judul.",
    );
    await page.click('button:has-text("Kirim Revisi")');
    await expect(page.getByText("Berhasil")).toBeVisible();

    // 4. Mahasiswa memperbaiki revisi
    await loginAs(page, "MAHASISWA");
    // Seharusnya masuk ke "Perlu Tindakan"?
    await page.goto("/mahasiswa/surat/proses");
    // Cari baris data
    await page.locator(`text=${revName}`).click();

    // Seharusnya ada tombol atau tautan "Perbaiki"
    const todoButton = page.locator(
      'a:has-text("Perbaiki"), button:has-text("Perbaiki")',
    );
    await expect(todoButton).toBeVisible();
    await todoButton.click();

    // Edit form
    await expect(page).toHaveURL(/revisi/);
    // Ubah judul
    await page.fill('input[name="namaBeasiswa"]', revName + " FIXED");
    await page.click(
      'button:has-text("Simpan"), button:has-text("Kirim Ulang")',
    );
    // Konfirmasi
    await page.locator('button:has-text("Ya")').click();

    // 5. Cek Supervisor (harusnya kembali ke Supervisor?)
    await loginAs(page, "SUPERVISOR");
    await page.goto("/supervisor-akademik/surat/perlu-tindakan");
    await expect(page.locator(`text=${revName} FIXED`)).toBeVisible();
  });
});
