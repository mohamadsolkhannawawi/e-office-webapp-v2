import { test, expect } from "@playwright/test";
import { loginAs, uploadMockFile, USERS } from "./utils";
import path from "path";

test.describe("Surat Rekomendasi Beasiswa - Happy Path", () => {
    test.setTimeout(120000); // 2 minutes timeout for full flow

    let letterId: string;
    // timestamp to make data unique
    const timestamp = Date.now();
    const uniqueBeasiswaName = `Beasiswa E2E Test ${timestamp}`;

    test("Complete Approval Workflow", async ({ page }) => {
        // --- 1. MAHASISWA SUBMISSION ---
        await test.step("Mahasiswa Submission", async () => {
            await loginAs(page, "MAHASISWA");

            // Navigate to SRB creation (Internal)
            await page.goto(
                "/mahasiswa/surat/surat-rekomendasi-beasiswa/internal",
            );

            // Step 1: Identitas (Auto-filled but check validation)
            await expect(page.locator("text=Identitas Pemohon")).toBeVisible();
            const { fillStep1Identitas } = await import("./utils");
            await fillStep1Identitas(page);
            await page.click('button:has-text("Lanjut")');

            // Step 2: Detail
            await expect(page.locator("text=Detail Pengajuan")).toBeVisible();
            await page.fill('input[name="namaBeasiswa"]', uniqueBeasiswaName);
            await page.click('button:has-text("Lanjut")');

            // Step 3: Lampiran
            await expect(page.locator("text=Lampiran Dokumen")).toBeVisible();

            // Upload KTM (First file input)
            // Note: In React, input[type=file] might be hidden.
            // We target the first one for Main files.
            const fileInputs = page.locator('input[type="file"]');
            await expect(fileInputs.first()).toBeAttached();

            // Create dummy file buffer
            const buffer = Buffer.from("dummy content");

            // Upload KTM
            await fileInputs.first().setInputFiles({
                name: "ktm_mock.pdf",
                mimeType: "application/pdf",
                buffer: buffer,
            });
            // Wait for upload (check if file appears in list)
            await expect(page.locator("text=ktm_mock.pdf")).toBeVisible({
                timeout: 10000,
            });

            // Upload additional file (optional but good to test)
            await fileInputs.nth(1).setInputFiles({
                name: "extra_mock.pdf",
                mimeType: "application/pdf",
                buffer: buffer,
            });
            await expect(page.locator("text=extra_mock.pdf")).toBeVisible({
                timeout: 10000,
            });

            await page.click('button:has-text("Lanjut")');

            // Step 4: Review
            await expect(page.locator("text=Review & Ajukan")).toBeVisible();
            await expect(
                page.locator(`text=${uniqueBeasiswaName}`),
            ).toBeVisible();

            // Submit
            await page.click('button:has-text("Ajukan Surat")');
            await page.click('button:has-text("Ya, Ajukan")');

            // Verify redirection to Detail page
            await expect(page).toHaveURL(/\/detail\//);

            // Extract ID from URL
            const url = page.url();
            const IdMatch = url.match(/\/detail\/([a-zA-Z0-9-]+)/);
            if (!IdMatch) throw new Error("Could not extract ID from URL");
            letterId = IdMatch[1];
            console.log(`Created Letter ID: ${letterId}`);

            // Check Status "PENDING" or "DIPROSES" (View Logic might show 'Menunggu Verifikasi Supervisor')
            // Detailed status might be text on page
            await expect(
                page.getByText(/Menunggu Verifikasi|Diproses/i),
            ).toBeVisible();
        });

        // --- 2. SUPERVISOR APPROVAL ---
        await test.step("Supervisor Approval", async () => {
            await loginAs(page, "SUPERVISOR");
            await page.goto("/supervisor-akademik/surat/perlu-tindakan");

            // Filter/Search (Basic check)
            // Assuming there is a search input
            const searchInput = page.getByPlaceholder(/Cari|Search/i);
            if (await searchInput.isVisible()) {
                await searchInput.fill(USERS.MAHASISWA.name); // Search by student name
                await page.keyboard.press("Enter");
                await page.waitForTimeout(1000); // Wait for debounce/fetch
            }

            // Click the row with the letterId (or student name/beasiswa name)
            // Ideally we look for a link or row containing the name
            await page.locator(`text=${uniqueBeasiswaName}`).click();

            // Should be on detail page
            await expect(page).toHaveURL(new RegExp(`/detail/${letterId}`));

            // Approve
            // Look for "Setujui" button
            // It might be in a wrapper or modal trigger
            await page.click('button:has-text("Setujui")');

            // Confirm modal
            await page.locator('button:has-text("Ya, Setujui")').click();

            // Wait for success/redirect
            // Usually goes back to list or stays with updated status
            await expect(page.getByText("Berhasil")).toBeVisible({
                timeout: 10000,
            });
        });

        // --- 3. MANAJER TU APPROVAL ---
        await test.step("Manajer TU Approval", async () => {
            await loginAs(page, "MANAJER_TU");
            await page.goto("/manajer-tu/surat/perlu-tindakan");

            // Find and click
            await page.locator(`text=${uniqueBeasiswaName}`).click();

            // Approve
            await page.click('button:has-text("Setujui")');
            await page.locator('button:has-text("Ya, Setujui")').click();
            await expect(page.getByText("Berhasil")).toBeVisible({
                timeout: 10000,
            });
        });

        // --- 4. WAKIL DEKAN 1 SIGNING ---
        await test.step("Wakil Dekan 1 Signing", async () => {
            await loginAs(page, "WAKIL_DEKAN_1");
            await page.goto("/wakil-dekan-1/surat/perlu-tindakan");

            // Find and click
            await page.locator(`text=${uniqueBeasiswaName}`).click();

            // Tanda Tangani (This might open a modal/dialog)
            const signButton = page.locator('button:has-text("Tanda Tangani")');
            await expect(signButton).toBeVisible();
            await signButton.click();

            // Handling the Signing Modal
            // Assuming Tabs: "Upload", "Template", "Tulis"
            // Let's use "Template" if available, or just submit if it defaults
            // Check for tab "Template"
            const templateTab = page.locator(
                'button[role="tab"]:has-text("Template")',
            );
            if (await templateTab.isVisible()) {
                await templateTab.click();
                // Select a template if list exists, or if one is selected by default
                // Just click "Simpan" or "Tanda Tangani" inside modal
            }

            // Click "Simpan Tanda Tangan" or similar in modal
            await page
                .locator(
                    'button:has-text("Simpan"), button:has-text("Gunakan")',
                )
                .last()
                .click();

            // After signing, usually need to approve explicitly or signing IS the approval?
            // Assuming explicit approval is still needed or signing triggers it.
            // Based on earlier prompt: "Apabila disetujui maka akan naik ke UPA" -> Suggests an approval action.
            // But usually Signing IS the approval for WD1.
            // Let's check if "Setujui" button is there.
            const approveButton = page.locator('button:has-text("Setujui")');
            if (await approveButton.isVisible()) {
                await approveButton.click();
                await page.locator('button:has-text("Ya, Setujui")').click();
            }

            await expect(page.getByText("Berhasil")).toBeVisible({
                timeout: 10000,
            });
        });

        // --- 5. UPA PUBLISHING ---
        await test.step("UPA Publishing", async () => {
            await loginAs(page, "UPA");
            await page.goto("/upa/surat/perlu-tindakan");

            // Find and click
            await page.locator(`text=${uniqueBeasiswaName}`).click();

            // Action: "Terbitkan" / "Nomori"
            await page.click(
                'button:has-text("Terbitkan"), button:has-text("Proses")',
            );

            // Input "Nomor Surat" if prompted
            const noSuratInput = page.locator(
                'input[name="nomorSurat"], input[placeholder*="Nomor Surat"]',
            );
            if (await noSuratInput.isVisible()) {
                await noSuratInput.fill(
                    `B/${Math.floor(Math.random() * 1000)}/UN7.5.8/DL/2026`,
                );
            }

            // Confirm Publish
            await page
                .locator(
                    'button:has-text("Terbitkan"), button:has-text("Simpan")',
                )
                .last()
                .click();

            await expect(page.getByText("Berhasil")).toBeVisible({
                timeout: 10000,
            });
        });

        // --- 6. MAHASISWA FINAL CHECK ---
        await test.step("Mahasiswa Verification", async () => {
            await loginAs(page, "MAHASISWA");
            await page.goto("/mahasiswa/surat/selesai");

            // Check if letter is present
            await expect(
                page.locator(`text=${uniqueBeasiswaName}`),
            ).toBeVisible();

            // Open detail
            await page.locator(`text=${uniqueBeasiswaName}`).click();

            // Check status "Selesai"
            await expect(page.getByText(/Selesai|Terbit/i)).toBeVisible();

            // Check Download button existence
            await expect(
                page.locator(
                    'a:has-text("Download"), button:has-text("Download")',
                ),
            ).toBeVisible();
        });
    });
});
