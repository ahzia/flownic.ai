import { test, expect } from "@playwright/test";

test("home page shows Flownic brand", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Practice the conversation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start practicing/i })).toBeVisible();
});
