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
    await expect(container).toBeVisible();

    // Fill Tempat Lahir
    await page.fill('input[name="tempatLahir"]', "Semarang");

    // Fill Tanggal Lahir (DatePicker interaction)
    // 1. Click default trigger button
    const dateTrigger = container.locator("button[data-empty]");
    // Usually it has text "Pilih tanggal lahir" or similar.
    // If it's already filled (from API), it won't match "Pilih tanggal lahir" easily unless we check value.
    // But let's assume we need to fill it for robustness or overwrite it.

    // We can also check if it's already filled by checking text content.
    const dateText = await dateTrigger.textContent();
    if (!dateText?.match(/\d{2}\/\d{2}\/\d{4}/)) {
        await dateTrigger.click();
        // Wait for calendar
        await expect(page.locator(".rdp")).toBeVisible(); // react-day-picker class
        // Click a date, e.g., 15th
        await page.click('.rdp-day:has-text("15")');
        // Wait for popover to close or verify value
    }

    // Fill No HP
    await page.fill('input[name="noHp"]', "081234567890");

    // Fill Semester
    await page.fill('input[name="semester"]', "6");

    // Fill IPK
    await page.fill('input[name="ipk"]', "3.75");

    // Fill IPS
    await page.fill('input[name="ips"]', "3.80");

    // Allow UI to settle
    await page.waitForTimeout(500);
}
