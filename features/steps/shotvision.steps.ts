import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

// --- Helper Function ---
async function generateClerkTicket() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const userId = process.env.TEST_USER_ID;

  if (!secretKey || !userId) {
    throw new Error("Missing CLERK_SECRET_KEY or TEST_USER_ID in .env.local");
  }

  const response = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      expires_in_seconds: 60,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate Clerk ticket: ${errorText}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

// --- Step Definitions ---

Given(
  "I navigate to the ShotVision login page",
  async function (this: CustomWorld) {
    // Even if we use tickets, sometimes it's good to start fresh
    await this.page.goto("http://localhost:3000/login");
  }
);

Given("I sign in as a valid user", async function (this: CustomWorld) {
  // 1. Generate a FRESH ticket dynamically
  const ticket = await generateClerkTicket();

  // 2. Use it immediately
  await this.page.goto(`http://localhost:3000/login?__clerk_ticket=${ticket}`);

  // 3. Verify login
  await expect(this.page.locator('input[type="file"]')).toBeVisible({
    timeout: 15000,
  });
});

Given(
  "I sign in as a user with existing videos",
  async function (this: CustomWorld) {
    // 1. Generate ANOTHER fresh ticket for this specific scenario
    const ticket = await generateClerkTicket();

    await this.page.goto(
      `http://localhost:3000/login?__clerk_ticket=${ticket}`
    );

    await expect(this.page.locator('input[type="file"]')).toBeVisible({
      timeout: 15000,
    });
  }
);

When(
  "I upload the video {string}",
  async function (this: CustomWorld, fileName: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles(`./test-assets/${fileName}`);

    await this.page.click('button:has-text("Upload Video")');
  }
);

When(
  "I wait {int} seconds for the inference to process",
  async function (this: CustomWorld, seconds: number) {
    await expect(this.page.locator(".inference-score")).toBeVisible({
      timeout: seconds * 1000,
    });
  }
);

Then(
  "I should see the {string} on the dashboard",
  async function (this: CustomWorld, text: string) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible();
  }
);

When(
  "I click on the first video in the catalog",
  async function (this: CustomWorld) {
    await this.page.click(".video-card:first-child");
  }
);

When("I click the delete button", async function (this: CustomWorld) {
  this.page.once("dialog", (dialog) => dialog.accept());
  await this.page.click('button[aria-label="delete"]');
});

Then(
  "the video should be removed from the catalog",
  async function (this: CustomWorld) {
    await expect(
      this.page.locator(".video-card:first-child")
    ).not.toBeVisible();
  }
);
