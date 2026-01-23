import { Page, expect } from "@playwright/test";

export const USERS = {
    MAHASISWA: {
        email: "mahasiswa@students.undip.ac.id",
        password: "password123",
        name: "Budi Mahasiswa",
    },
    SUPERVISOR: {
        email: "spv@staff.undip.ac.id",
        password: "password123",
        name: "Dr. Supervisor",
    },
    MANAJER_TU: {
        email: "tu@staff.undip.ac.id",
        password: "password123",
        name: "Budi TU",
    },
    WAKIL_DEKAN_1: {
        email: "wd1@lecturer.undip.ac.id",
        password: "password123",
        name: "Prof. Wakil Dekan 1",
    },
    UPA: {
        email: "upa@staff.undip.ac.id",
        password: "password123",
        name: "Staff UPA",
    },
};

export async function loginAs(page: Page, role: keyof typeof USERS) {
    const user = USERS[role];
    await page.goto("/login");
    // Using simple selectors, adjust if UI changes
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);

    // Click login button - try to be specific but robust
    const loginButton = page.locator('button[type="submit"]', {
        hasText: "Masuk",
    });
    await loginButton.click();

    // Wait for successful redirect - typically to dashboard
    // Depending on role, the dashboard URL might differ, but definitely not /login
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/login/);

    // Optional: wait for some dashboard element to verify login
    // await expect(page.locator('text=Dashboard')).toBeVisible();
}

/**
 * Uploads a mock file to a file input
 */
export async function uploadMockFile(
    page: Page,
    selector: string,
    fileName: string = "mock-document.pdf",
) {
    // Create a dummy buffer
    const buffer = Buffer.from("mock content");

    // Set input files
    await page.setInputFiles(selector, {
        name: fileName,
        mimeType: "application/pdf",
        buffer: buffer,
    });
}

/**
 * Fills Step 1 (Identitas) with dummy data if empty/required
 */
export async function fillStep1Identitas(page: Page) {
    // Wait for the form to be visible
    const container = page.locator('section[aria-label="Informasi Identitas"]');
    await expect(container).toBeVisible({ timeout: 10000 });

    // For SRB form, let's just use specific fills and ensure we click edit if needed
    // The current UI has buttons like "Koreksi Data"

    // 1. Tempat Lahir
    const tempatLahir = page.locator('input[name="tempatLahir"]');
    if ((await tempatLahir.getAttribute("readonly")) !== null) {
        await page
            .locator('label:has-text("Tempat Lahir")')
            .locator('button:has-text("Koreksi Data")')
            .click();
    }
    await tempatLahir.fill("Semarang");

    // 2. Tanggal Lahir (DatePicker)
    const dateTrigger = container.locator("button[data-empty]");
    if ((await dateTrigger.count()) > 0) {
        // Only click if it says "Pilih tanggal lahir" or is empty
        const dateText = await dateTrigger.textContent();
        if (!dateText?.match(/\d{2}\/\d{2}\/\d{4}/)) {
            await dateTrigger.click();
            await expect(page.locator(".rdp")).toBeVisible();
            await page.click('.rdp-day:has-text("15")');
        }
    } else {
        // Check if we need to click "Koreksi Data" first
        const dateEdit = page
            .locator('label:has-text("Tanggal Lahir")')
            .locator('button:has-text("Koreksi Data")');
        if (await dateEdit.isVisible()) {
            await dateEdit.click();
            // Now the DatePicker should be clickable
            await page.locator('button[aria-haspopup="dialog"]').click();
            await page.click('.rdp-day:has-text("15")');
        }
    }

    // 3. No HP (Always editable usually, but let's be safe)
    const noHp = page.locator('input[name="noHp"]');
    await noHp.scrollIntoViewIfNeeded();
    await noHp.fill("081234567890");

    // 4. Semester
    const semester = page.locator('input[name="semester"]');
    await semester.fill("6");

    // 5. IPK
    const ipk = page.locator('input[name="ipk"]');
    await ipk.fill("3.75");

    // 6. IPS
    const ips = page.locator('input[name="ips"]');
    await ips.fill("3.80");

    // Verify all filled
    await expect(noHp).toHaveValue("081234567890");
    await expect(semester).toHaveValue("6");
    await expect(ipk).toHaveValue("3.75");
    await expect(ips).toHaveValue("3.80");

    // Allow UI to settle
    await page.waitForTimeout(500);
}
