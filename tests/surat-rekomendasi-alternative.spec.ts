import { test, expect } from "@playwright/test";
import { loginAs, USERS, fillStep1Identitas } from "./utils";

test.describe("Surat Rekomendasi Beasiswa - Revision & Rejection", () => {
    test.setTimeout(120000);

    const timestamp = Date.now();
    const uniqueBeasiswaName = `Beasiswa Revision Test ${timestamp}`;
    let letterId: string;

    test("Scenario A: Supervisor Rejection", async ({ page }) => {
        // 1. Submit by Mahasiswa
        await loginAs(page, "MAHASISWA");
        await page.goto("/mahasiswa/surat/surat-rekomendasi-beasiswa/internal");
        await fillStep1Identitas(page);
        await page.click('button:has-text("Lanjut")'); // Step 1
        await page.fill(
            'input[name="namaBeasiswa"]',
            uniqueBeasiswaName + " Allow Reject",
        ); // Step 2
        await page.click('button:has-text("Lanjut")');
        // Upload mock files
        const fileInputs = page.locator('input[type="file"]');
        const buffer = Buffer.from("dummy content");
        await fileInputs.first().setInputFiles({
            name: "ktm_mock.pdf",
            mimeType: "application/pdf",
            buffer,
        });
        await expect(page.locator("text=ktm_mock.pdf")).toBeVisible();
        await page.click('button:has-text("Lanjut")'); // Step 3
        await page.click('button:has-text("Ajukan Surat")');
        await page.click('button:has-text("Ya, Ajukan")');

        // Capture ID
        const url = page.url();
        const IdMatch = url.match(/\/detail\/([a-zA-Z0-9-]+)/);
        if (IdMatch) letterId = IdMatch[1];

        // 2. Supervisor Reject
        await loginAs(page, "SUPERVISOR");
        await page.goto("/supervisor-akademik/surat/perlu-tindakan");
        await page.locator(`text=${uniqueBeasiswaName} Allow Reject`).click();

        // Reject
        await page.click('button:has-text("Tolak")');
        // Fill reason
        await page.fill(
            'textarea[name="catatan"], textarea[placeholder*="alasan"]',
            "Maaf, data tidak valid. Ditolak.",
        );
        await page.click('button:has-text("Ya, Tolak")');
        await expect(page.getByText("Berhasil")).toBeVisible();

        // 3. Mahasiswa Check Status
        await loginAs(page, "MAHASISWA");
        await page.goto("/mahasiswa/surat/selesai"); // Or history/status page
        // If rejected, it might be in "Selesai" (as Done/Rejected) or "Arsip"?
        // Or check detail directly
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

        // 1. Submit by Mahasiswa
        await loginAs(page, "MAHASISWA");
        await page.goto("/mahasiswa/surat/surat-rekomendasi-beasiswa/internal");
        await fillStep1Identitas(page);
        await page.click('button:has-text("Lanjut")'); // Step 1
        await page.fill('input[name="namaBeasiswa"]', revName); // Step 2
        await page.click('button:has-text("Lanjut")');
        const fileInputs = page.locator('input[type="file"]');
        const buffer = Buffer.from("dummy content");
        await fileInputs.first().setInputFiles({
            name: "ktm_mock.pdf",
            mimeType: "application/pdf",
            buffer,
        });
        await expect(page.locator("text=ktm_mock.pdf")).toBeVisible();
        await page.click('button:has-text("Lanjut")'); // Step 3
        await page.click('button:has-text("Ajukan Surat")');
        await page.click('button:has-text("Ya, Ajukan")');

        // Capture ID
        const url = page.url();
        const IdMatch = url.match(/\/detail\/([a-zA-Z0-9-]+)/);
        if (IdMatch) letterId = IdMatch[1];

        // 2. Supervisor Approve
        await loginAs(page, "SUPERVISOR");
        await page.goto("/supervisor-akademik/surat/perlu-tindakan");
        await page.locator(`text=${revName}`).click();
        await page.click('button:has-text("Setujui")');
        await page.locator('button:has-text("Ya, Setujui")').click();

        // 3. Manajer TU Request Revision
        await loginAs(page, "MANAJER_TU");
        await page.goto("/manajer-tu/surat/perlu-tindakan");
        await page.locator(`text=${revName}`).click();
        await page.click('button:has-text("Revisi")');

        // Target: Mahasiswa (if selectable)
        // Assume default or radio button
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

        // 4. Mahasiswa Fix Revision
        await loginAs(page, "MAHASISWA");
        // Should be in "Perlu Tindakan"?
        await page.goto("/mahasiswa/surat/proses");
        // Find row
        await page.locator(`text=${revName}`).click();

        // Should have "Perbaiki" button or link
        const todoButton = page.locator(
            'a:has-text("Perbaiki"), button:has-text("Perbaiki")',
        );
        await expect(todoButton).toBeVisible();
        await todoButton.click();

        // Edit form
        await expect(page).toHaveURL(/revisi/);
        // Change title
        await page.fill('input[name="namaBeasiswa"]', revName + " FIXED");
        await page.click(
            'button:has-text("Simpan"), button:has-text("Kirim Ulang")',
        );
        // Confirm
        await page.locator('button:has-text("Ya")').click();

        // 5. Supervisor Check (Should be back to Supervisor?)
        await loginAs(page, "SUPERVISOR");
        await page.goto("/supervisor-akademik/surat/perlu-tindakan");
        await expect(page.locator(`text=${revName} FIXED`)).toBeVisible();
    });
});
