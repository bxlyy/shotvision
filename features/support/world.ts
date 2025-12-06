import { setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, Page } from "@playwright/test";

export class CustomWorld extends World {
  browser!: Browser;
  page!: Page;

  constructor(options: any) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
