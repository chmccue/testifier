import { BrowserContext, type Locator, type Page } from '@playwright/test';
import { DataUtils } from './DataUtils';

export class ClickUtils extends DataUtils {

  constructor(page: Page) {
    super(page);
  }

    // can take any kind of Locator or a string in cssSelector format
    async clickOn(
      toClick: Locator | string, clickCount: number = 1, clickDelay: number = 20,
      position?: { x: number, y: number }) {
      const clickCountReady: number = clickCount === undefined ? 1 : clickCount;
      const clickReady: Locator = await this.checkLocatorReadyAndStrict(toClick);
      await this.waitForElement(clickReady);
      for (let i = 0; i < clickCountReady; i++) {
        await clickReady.click({ delay: clickDelay, position });
      }
    };
  
    async rightMouseClickOn(toClick: Locator | string, force: boolean = false) {
      const clickReady: Locator = await this.checkLocatorReadyAndStrict(toClick);
      await clickReady.click({ button: 'right', force });
    }
  
    async doubleClickOn(toClick: Locator | string) {
      const clickReady: Locator = await this.checkLocatorReadyAndStrict(toClick);
      await clickReady.dblclick();
    }
  
    async forceClickOn(toClick: Locator | string) {
      (await this.checkLocatorReadyAndStrict(toClick)).click({ force: true });
    }
 
    async clickAndWaitForNewPage(context: BrowserContext, toClick: Locator | string) {
      const clickItem = (async () => {
        await this.clickOn(toClick);
      });
      return this.interactAndWaitForNewPage(context, clickItem);
    }
}