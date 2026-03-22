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
  // Gunakan selector sederhana, sesuaikan jika UI berubah
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);

  // Klik tombol login - usahakan spesifik namun tetap robust
  const loginButton = page.locator('button[type="submit"]', {
    hasText: "Masuk",
  });
  await loginButton.click();

  // Tunggu redirect berhasil - biasanya ke dashboard
  // Bergantung role, URL dashboard bisa berbeda, tetapi pasti bukan /login
  await page.waitForLoadState("networkidle");
  await expect(page).not.toHaveURL(/\/login/);

  // Opsional: tunggu elemen dashboard tertentu untuk verifikasi login
  // await expect(page.locator('text=Dashboard')).toBeVisible();
}

/**
 * Mengunggah file mock ke input file
 */
export async function uploadMockFile(
  page: Page,
  selector: string,
  fileName: string = "mock-document.pdf",
) {
  // Buat buffer dummy
  const buffer = Buffer.from("mock content");

  // Set file pada input
  await page.setInputFiles(selector, {
    name: fileName,
    mimeType: "application/pdf",
    buffer: buffer,
  });
}

/**
 * Mengisi Step 1 (Identitas) dengan data dummy jika kosong/perlu
 */
export async function fillStep1Identitas(page: Page) {
  // Tunggu hingga form terlihat
  const container = page.locator('section[aria-label="Informasi Identitas"]');
  await expect(container).toBeVisible({ timeout: 10000 });

  // Untuk form SRB, gunakan pengisian spesifik dan pastikan klik edit jika diperlukan
  // UI saat ini memiliki tombol seperti "Koreksi Data"

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
    // Klik hanya jika tertulis "Pilih tanggal lahir" atau masih kosong
    const dateText = await dateTrigger.textContent();
    if (!dateText?.match(/\d{2}\/\d{2}\/\d{4}/)) {
      await dateTrigger.click();
      await expect(page.locator(".rdp")).toBeVisible();
      await page.click('.rdp-day:has-text("15")');
    }
  } else {
    // Cek apakah perlu klik "Koreksi Data" terlebih dahulu
    const dateEdit = page
      .locator('label:has-text("Tanggal Lahir")')
      .locator('button:has-text("Koreksi Data")');
    if (await dateEdit.isVisible()) {
      await dateEdit.click();
      // Sekarang DatePicker seharusnya bisa diklik
      await page.locator('button[aria-haspopup="dialog"]').click();
      await page.click('.rdp-day:has-text("15")');
    }
  }

  // 3. No HP (biasanya selalu bisa diedit, tapi tetap kita amankan)
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

  // Verifikasi semua field terisi
  await expect(noHp).toHaveValue("081234567890");
  await expect(semester).toHaveValue("6");
  await expect(ipk).toHaveValue("3.75");
  await expect(ips).toHaveValue("3.80");

  // Beri waktu UI untuk stabil
  await page.waitForTimeout(500);
}
