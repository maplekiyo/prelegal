import { test, expect } from "@playwright/test";

// Party 1 address uses a long placeholder — grab the textarea by index instead
const FIELDS = {
  party1Name: { placeholder: "Acme Corporation" },
  party1Address: { nth: 0 }, // first textarea
  party2Name: { placeholder: "Beta LLC" },
  party2Address: { nth: 1 }, // second textarea
  purpose: { placeholder: "Evaluating a potential business partnership between the parties" },
  governingLaw: { placeholder: "California" },
} as const;

test.describe("NDA Creator — page structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the prelegal logo and page title", async ({ page }) => {
    // Use the header element to avoid matching the footer disclaimer
    await expect(page.locator("header").getByText("prelegal")).toBeVisible();
    // The h1 uses a non-breaking hyphen (&#8209;) so match loosely
    await expect(page.locator("h1").filter({ hasText: /mutual.*disclosure/i })).toBeVisible();
  });

  test("renders all 8 form fields", async ({ page }) => {
    await expect(page.getByPlaceholder("Acme Corporation")).toBeVisible();
    await expect(page.locator("textarea").nth(0)).toBeVisible(); // party1 address
    await expect(page.getByPlaceholder("Beta LLC")).toBeVisible();
    await expect(page.locator("textarea").nth(1)).toBeVisible(); // party2 address
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator("textarea").nth(2)).toBeVisible(); // purpose
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.getByPlaceholder("California")).toBeVisible();
  });

  test("shows the NDA document in the preview panel", async ({ page }) => {
    await expect(
      page.getByText("MUTUAL NON-DISCLOSURE AGREEMENT")
    ).toBeVisible();
  });

  test("shows the Download PDF button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeVisible();
  });
});

test.describe("NDA Creator — initial state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("term years field defaults to 2", async ({ page }) => {
    await expect(page.locator('input[type="number"]')).toHaveValue("2");
  });

  test("progress counter starts at 1/8 (term_years pre-filled)", async ({
    page,
  }) => {
    await expect(page.getByText("1/8")).toBeVisible();
  });

  test("preview shows amber placeholders for unfilled fields", async ({
    page,
  }) => {
    const placeholders = page.locator(".empty-placeholder");
    await expect(placeholders.first()).toBeVisible();
    // party1_name and party2_name each appear twice in the template (intro + signature).
    // All other 5 empty fields appear once. term_years is pre-filled.
    // Total empty spans: 2+1+2+1+1+1+1 = 9
    await expect(placeholders).toHaveCount(9);
  });

  test("only term_years filled-value span exists initially", async ({ page }) => {
    // term_years appears once in the template (section 4)
    const filled = page.locator(".filled-value");
    await expect(filled).toHaveCount(1);
  });
});

test.describe("NDA Creator — live preview updates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("typing Party 1 Name appears immediately in the preview", async ({
    page,
  }) => {
    await page.getByPlaceholder("Acme Corporation").fill("Globex Corporation");
    const preview = page.locator(".nda-content");
    await expect(preview.locator(".filled-value").first()).toContainText(
      "Globex Corporation"
    );
  });

  test("party 1 name filled-value replaces both its placeholders", async ({
    page,
  }) => {
    await page.getByPlaceholder("Acme Corporation").fill("Globex Corporation");
    // party1_name appears twice (intro + signature), so 9 - 2 = 7 remain empty
    const placeholders = page.locator(".empty-placeholder");
    await expect(placeholders).toHaveCount(7);
  });

  test("clearing a field reverts the preview to placeholder", async ({
    page,
  }) => {
    await page.getByPlaceholder("Acme Corporation").fill("Globex Corporation");
    await page.getByPlaceholder("Acme Corporation").clear();
    await expect(page.locator(".empty-placeholder")).toHaveCount(9);
  });

  test("party 2 name appears in the preview", async ({ page }) => {
    await page.getByPlaceholder("Beta LLC").fill("Initech Ltd");
    const preview = page.locator(".nda-content");
    await expect(preview).toContainText("Initech Ltd");
  });

  test("effective date appears in the preview when filled", async ({
    page,
  }) => {
    await page.locator('input[type="date"]').fill("2026-06-01");
    // Multiple .filled-value spans exist (term_years + effective_date), so use getByText
    await expect(page.locator(".nda-content")).toContainText("2026-06-01");
  });

  test("governing law state appears in the preview", async ({ page }) => {
    await page.getByPlaceholder("California").fill("New York");
    const preview = page.locator(".nda-content");
    await expect(preview).toContainText("New York");
  });

  test("purpose text appears in the preview", async ({ page }) => {
    const purposeInput = page.locator("textarea").nth(2);
    await purposeInput.fill("exploring a joint venture");
    const preview = page.locator(".nda-content");
    await expect(preview).toContainText("exploring a joint venture");
  });
});

test.describe("NDA Creator — progress tracking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("progress increments as fields are filled", async ({ page }) => {
    await expect(page.getByText("1/8")).toBeVisible();

    await page.getByPlaceholder("Acme Corporation").fill("Globex Corporation");
    await expect(page.getByText("2/8")).toBeVisible();

    await page.getByPlaceholder("Beta LLC").fill("Initech Ltd");
    await expect(page.getByText("3/8")).toBeVisible();
  });

  test("progress reaches 8/8 when all fields are filled", async ({ page }) => {
    await page.getByPlaceholder("Acme Corporation").fill("Globex Corporation");
    await page.locator("textarea").nth(0).fill("123 Main St, Springfield");
    await page.getByPlaceholder("Beta LLC").fill("Initech Ltd");
    await page.locator("textarea").nth(1).fill("456 Oak Ave, Shelbyville");
    await page.locator('input[type="date"]').fill("2026-06-01");
    await page.locator("textarea").nth(2).fill("evaluating a potential partnership");
    // term_years already has value "2"
    await page.getByPlaceholder("California").fill("Delaware");

    await expect(page.getByText("8/8")).toBeVisible();
  });
});

test.describe("NDA Creator — PDF download", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("download button is always enabled (placeholders allowed in PDF)", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeEnabled();
  });

  test("clicking Download PDF triggers a .pdf file download", async ({
    page,
  }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test("PDF filename contains both party names when filled", async ({
    page,
  }) => {
    await page.getByPlaceholder("Acme Corporation").fill("Globex Corporation");
    await page.getByPlaceholder("Beta LLC").fill("Initech Ltd");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download pdf/i }).click();
    const download = await downloadPromise;

    const name = download.suggestedFilename().toLowerCase();
    expect(name).toContain("globex");
    expect(name).toContain("initech");
  });

  test("button shows spinner while generating and re-enables after", async ({
    page,
  }) => {
    const button = page.getByRole("button", { name: /download pdf/i });

    const downloadPromise = page.waitForEvent("download");
    await button.click();

    // After download resolves the button is enabled again
    await downloadPromise;
    await expect(button).toBeEnabled();
  });
});
