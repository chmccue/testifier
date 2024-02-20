import { BrowserContext, expect, type Locator, type Page } from '@playwright/test';
import { TestifierMethods } from '@testifier/methods';
import { IKeyboardControls, ISearchData } from '../Interfaces';

export class BaseAssertions {
  readonly page: Page;

  protected readonly core: TestifierMethods;

  constructor(page: Page) {
    this.page = page;
    this.core = new TestifierMethods(page);
  }

  async containsText(expectedText: string, actualTextOrLocator: Locator | string) {
    if (this.core.isString(actualTextOrLocator)) {
      expect(actualTextOrLocator as string).toContain(expectedText);
    } else {
      await expect(actualTextOrLocator as Locator).toContainText(expectedText);
    }
  }

  async doesNotContainText(expectedText: string, actualTextOrLocator: Locator | string) {
    if (typeof actualTextOrLocator === 'string') {
      expect(actualTextOrLocator).not.toContain(expectedText);
    } else {
      await expect(actualTextOrLocator).not.toContainText(expectedText);
    }
  }

  async isVisible(loc: Locator | string, yes: boolean = true) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    if (yes) await expect(locReady).toBeVisible();
    else await this.isHidden(locReady);
  }

  async isDefined(loc: Locator | string) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    expect(locReady).toBeDefined();
  }

  async isHidden(loc: Locator | string, wait: number | undefined = undefined) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    const waitSet: boolean = typeof wait !== 'undefined';
    await expect(locReady).toBeHidden(waitSet ? { timeout: wait} : {});
  }

  async isDetached(loc: Locator | string, wait: number | undefined = undefined) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    const waitSet: boolean = typeof wait !== 'undefined';
    await expect(locReady).not.toBeAttached(waitSet ? { timeout: wait} : {});
  }

  async matchCount(
    loc: Locator | string,
    expectedCount: number,
    mathExpression: string = '===',
    retry: boolean = true) {
    const locReady: Locator = this.core.checkLocatorReady(loc);
    const locCount = await locReady.count();
    if (expectedCount === 0 && mathExpression === '===') {
      await this.core.waitForElement(locReady, 'hidden');
      if (locCount !== expectedCount && retry) {
        await this.core.hardWait(400);
        return this.matchCount(loc, expectedCount, mathExpression, false);
      }
    }
    switch(mathExpression) {
      case '>':
        expect(locCount).toBeGreaterThan(expectedCount);
        break;
      case '>=':
        expect(locCount).toBeGreaterThanOrEqual(expectedCount);
        break;
      case '<':
        expect(locCount).toBeLessThan(expectedCount);
        break;
      case '<=':
        expect(locCount).toBeLessThanOrEqual(expectedCount);
        break;
      default:
        await this.isEqual(expectedCount, locCount);
    }
  }

  async hasUrl(page: Page, expectedUrl: string) {
    await expect(page).toHaveURL(expectedUrl);
  }

  async hasAttributeValue(loc: Locator, attribute: string, value: string) {
    await expect(loc).toHaveAttribute(attribute, value);
  }

  async hasLength(toCheck: any, expectedLength: number) {
    expect(toCheck).toHaveLength(expectedLength);
  }

  async isEnabled(loc: Locator | string) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    await expect(locReady).toBeEnabled();
  };

  async isDisabled(loc: Locator | string) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    await expect(locReady).toBeDisabled();
  };

  async pageCountIs(context: BrowserContext, num: number) {
    expect(context.pages().length).toEqual(num);
  }

  async isChecked(loc: Locator | string, yes: boolean = true) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    if (yes) await expect(locReady).toBeChecked();
    else await expect(locReady).not.toBeChecked();
  };

  async isNotChecked(loc: Locator | string) {
    await this.isChecked(loc, false);
  };

  async isEqual(item1: any, item2: any, yes: boolean = true) {
    if (yes) expect(item2.toString().trim()).toEqual(item1.toString().trim());
    else expect(item2.toString().trim()).not.toEqual(item1.toString().trim());
  }

  async enhancedSearchFindsNoFails(searchData: string | string[], toSearch: ISearchData) {
    expect(await this.core.enhancedSearch(searchData, toSearch)).toHaveLength(0);
  }

  async clickAndVerifySameWindowUrlUpdate(
    page: Page,
    urlAfterClick: string,
    toClick: Locator | string = 'body [href]',
    pageCountAfterClick: number = 1) {
    await this.core.clickOn(toClick);
    await this.hasUrl(page, urlAfterClick);
    await this.pageCountIs(page.context(), pageCountAfterClick);
  }

  async clickAndVerifyNewTabOpened(
    context: BrowserContext,
    urlAfterClick: string,
    toClick: Locator | string = 'body [href]') {
    const newPage = await this.core.clickAndWaitForNewPage(
      context, toClick
    );
    await this.hasUrl(newPage, urlAfterClick);
  }

  async selectUsingKeyboardAndVerifyNewTabOpened(
    context: BrowserContext,
    urlAfterClick: string,
    textToSelect: string,
    keyControls?: IKeyboardControls) {
    const keyControlsReady = await this.core.setKeyboardControlParams(keyControls);
    const newPage: Page = await this.core.selectWithKeyboardAndWaitForNewPage(
      context, textToSelect,keyControlsReady);
    await this.hasUrl(newPage, urlAfterClick);
  }

  // will throw exception if expectedText is not found.
  async focusTextFound(
    expectedText: string, keyControls?: IKeyboardControls) {
    const getFocus = await this.core.focusElementByTextUsingKeyboard(expectedText, keyControls);
    await this.isEqual(getFocus, true);
  }

  async locatorHasFocus(loc: Locator | string) {
    const locReady = await this.core.checkLocatorReadyAndStrict(loc);
    await expect(locReady).toBeFocused();
  }

  async labelVisible(yes: boolean = true, labelLocator: string = 'label') {
    if (yes) await this.isVisible(labelLocator);
    else await this.isHidden(labelLocator);
  }
}
