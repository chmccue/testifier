import { BrowserContext, type Locator, type Page } from '@playwright/test';
import { LocatorUtils } from './LocatorUtils';

export class WaitUtils extends LocatorUtils {

  constructor(page: Page) {
    super(page);
  }

  async waitForElement(loc: Locator | string, waitState: string = "visible", timeoutNum?: number) {
    const locReady = await this.checkLocatorReadyAndStrict(loc);
    if (this.textHas(waitState, 'hidden')) {
      await locReady.waitFor({ state: 'hidden', timeout: timeoutNum});
    } else if (this.textHas(waitState, 'attached')) {
      await locReady.waitFor({ state: 'attached', timeout: timeoutNum});
    } else if (this.textHas(waitState, 'detached')) {
      await locReady.waitFor({ state: 'detached', timeout: timeoutNum});
    } else {
      await locReady.waitFor({ state: 'visible', timeout: timeoutNum});
    }
  }

  async hardWait(ms: number = 1000) {
    await new Promise(resolve => {return setTimeout(resolve, ms)});
  }

  async webkitDelay(waitTime: number = 50) {
    if (this.currentBrowser() === 'webkit') {
      await this.hardWait(waitTime);
    }
  }

  // pass in a custom function to get an expected new page
  async interactAndWaitForNewPage(context: BrowserContext, interactionMethod: Function) {
    const newPagePromise = context.waitForEvent('page', { timeout: 10000 });
    await interactionMethod();
    const newPage = await newPagePromise;
    try {
      // waiting for an element to load on the page before validations
      await newPage.locator('body').waitFor({ state: 'attached', timeout: 500 });
    } catch (error) {
      // continue regardless of error
    }
    return newPage;
  }
}