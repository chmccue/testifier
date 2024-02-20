import { type Locator, type Page } from '@playwright/test';
import { Nth } from '@testifier/interfaces';
import { BaseUtils } from './BaseUtils';

export class LocatorUtils extends BaseUtils {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  strToLoc(toLocator: string, page: Page | Locator = this.page) {
    return page.locator(toLocator);
  }

  locToStr(loc: Locator): string {
    return loc['_selector'];
  }

  async getCount(loc: string | Locator): Promise<number> {
    return this.checkLocatorReady(loc).count();
  }

  // avoids strict mode violation, if user does not pass in unique locator.
  async checkLocatorStrict(loc: Locator) {
    return (await loc.count() > 1) ? loc.first() : loc;
  }

  checkLocatorReady(loc: Locator | string): Locator {
    return this.isString(loc) ? this.strToLoc(loc as string) : loc as Locator;
  }

  async checkLocatorReadyAndStrict(loc: Locator | string) {
    return this.checkLocatorStrict(this.checkLocatorReady(loc));
  }

  combineLocators(
    loc1: string | Locator, loc2: string | Locator, config: { separator: boolean } = { separator: false }) {
    const loc1Ready: string = this.isString(loc1)
      ? loc1 as string : this.locToStr(loc1 as Locator);
    const loc2Ready: string = this.isString(loc2)
      ? loc2 as string : this.locToStr(loc2 as Locator);
    return this.strToLoc(`${loc1Ready}${config.separator ? ' ' : ''}${loc2Ready}`);
  };

  locateByRegex(cssString: string, regex: string, page: Page | Locator = this.page) {
    return page.locator(cssString, {
      hasText: new RegExp(regex),
    });
  };

    // findStringByText is only when using the locId as a string type. This optional parameter
  // allows you to find a locator using children text (default) or value attribute.
  async setLocatorByTextOrNth(
    locBase: string,
    locId: Nth | string,
    findStringByText: boolean = true,
    visibilityWait: boolean = true) {
    let locReady: Locator;
    if (this.isString(locId)) {
      if (findStringByText) {
        locReady = this.locateByRegex(locBase, locId as string);
      } else {
        const attrValue: string = `[value="${locId}" i]`;
        locReady = this.strToLoc(`${locBase} ${attrValue}, ${locBase}${attrValue}`)
      }
    } else {
      locReady = await this.setNth(this.strToLoc(locBase), locId as Nth, visibilityWait);
    }
    return locReady;
  }

  async setNth(baseLocator: Locator, nth: Nth, visibilityWait: boolean = true) {
    /*
    Use this to set tests for when there is more than 1 of the same component on a page.
    * @param nth:
      * Inputting 'last' will use the '.last()' locator found.
      * Inputting an undefined value defaults to the '.first()' locator found.
    */
    try {
      if (visibilityWait) {
        const baseLocatorReady = await this.checkLocatorReadyAndStrict(baseLocator);
        await baseLocatorReady.waitFor({ state: 'visible' });
      }
    // eslint-disable-next-line no-empty
    } catch (ignored) {};
      let locReady: Locator = baseLocator.nth(0);
      if (nth !== undefined) {
        locReady = nth.nth === 'last' ? baseLocator.last() : baseLocator.nth(nth.nth);
      }
      return locReady;
    }
}
