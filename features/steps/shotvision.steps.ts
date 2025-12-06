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
    // I want to ensure the page loads fully before I do anything.
    await expect(this.page.goto("http://localhost:3000/login")).resolves.not.toThrow();
    // Add a small timeout to make sure the page is fully loaded
    await this.page.waitForTimeout(3000);
  }
);

Given("I sign in as a valid user", async function (this: CustomWorld) {
  const ticket = await generateClerkTicket();
  await this.page.goto(`http://localhost:3000/login?__clerk_ticket=${ticket}`);

  // Wait for the specific "Upload your tennis video" text from VideoUpload component
  // to verify we are actually inside the dashboard.
  await expect(this.page.getByText("Upload your tennis video")).toBeVisible({
    timeout: 15000,
  });
});

Given(
  "I sign in as a user with existing videos",
  async function (this: CustomWorld) {
    // Same logic as standard sign in, but for the second test case.
    const ticket = await generateClerkTicket();
    await this.page.goto(
      `http://localhost:3000/login?__clerk_ticket=${ticket}`
    );

    // Ensure dashboard loaded
    await expect(this.page.getByText("Upload your tennis video")).toBeVisible({
      timeout: 15000,
    });
  }
);

When(
  "I upload the video {string}",
  async function (this: CustomWorld, fileName: string) {
    // The input is hidden in VideoUpload, but Playwright can handle it.
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(`./test-assets/${fileName}`);

    // 2. Click the Upload button
    // In UI, button text changes from "Choose video" to "Upload Video" after a file is selected.
    const uploadButton = this.page.getByRole('button', { name: "Upload Video" });
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
  }
);

When(
  "I wait {int} seconds for the inference to process",
  { timeout: 130 * 1000 },
  async function (this: CustomWorld, seconds: number) {
    // We wait for the Score Card to populate, and if it doesn't in that time, we fail.
    // Based on page.tsx, the score displays "Total Score / 100".
    
    // 1. Ensure the loading spinner is gone first
    await expect(this.page.locator('.lucide-loader-2')).not.toBeVisible({
        timeout: seconds * 1000
    });

    // 2. Wait for the result to appear
    await expect(this.page.getByText("Total Score / 100")).toBeVisible({
      timeout: seconds * 1000,
    });
  }
);

Then(
  "I should see the {string} on the dashboard",
  async function (this: CustomWorld, text: string) {
    await expect(this.page.getByText(text)).toBeVisible({
      timeout: 5000,
    });
  }
);

When(
  "I click on the first video in the catalog",
  { timeout: 20 * 1000 },
  async function (this: CustomWorld) {
    // Open the Catalog
    await this.page.getByText("Or, view videos from your catalog").click();

    // Wait for the Modal Title
    await expect(this.page.getByText("Video Catalog")).toBeVisible();

    // C. Click the specific filename
    await this.page.getByText("test-swing.mp4", { exact: false }).first().click();
  }
);

When("I click the delete button", async function (this: CustomWorld) {
  
  // 1. Click "Edit" in the "Currently Viewing" card
  await this.page.getByRole('button', { name: "Edit" }).click();

  // 2. Wait for Edit Modal
  await expect(this.page.getByText("Edit Video Details")).toBeVisible();

  // 3. Click "Delete Video" (Transition to confirmation view)
  await this.page.getByRole('button', { name: "Delete Video" }).click();

  // 4. Confirm "Yes, Delete Video"
  await expect(this.page.getByRole('button', { name: "Yes, Delete Video" })).toBeVisible();
  await this.page.getByRole('button', { name: "Yes, Delete Video" }).click();
  
  // 5. Wait for the deletion request to finish (Loader disappears)
  await expect(this.page.locator('.animate-spin')).not.toBeVisible();
});

Then(
  "the video should be removed from the catalog",
  async function (this: CustomWorld) {
    // 1. Re-open the catalog to trigger the fetch
    await this.page.getByText("Or, view videos from your catalog").click();

    // 2. Wait for the empty state text
    await expect(this.page.getByText("No videos found in your library.")).toBeVisible();
  }
);