import { Before, After } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";
import { CustomWorld } from "./world";

// Before every scenario, launch the browser
Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: false }); // Set headless: true for CI/CD
  const context = await this.browser.newContext();
  this.page = await context.newPage();
});

// After every scenario, close the browser
After(async function (this: CustomWorld) {
  await this.browser.close();
});
