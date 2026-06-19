import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Accessibility gate (spec §14 step 9). Runs against the production server via
// playwright.config.ts webServer. Checks WCAG 2 A/AA on key pages.
const pages = ["/", "/about", "/amenities", "/trainers", "/classes", "/membership", "/contact", "/faq"];

for (const path of pages) {
  test(`a11y: ${path} has no serious/critical violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    if (serious.length) {
      console.log(
        `${path} violations:`,
        serious.map((v) => `${v.id} (${v.nodes.length})`).join(", "),
      );
    }
    expect(serious).toEqual([]);
  });
}
