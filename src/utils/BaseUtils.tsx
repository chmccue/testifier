import { BrowserContext, type Page } from '@playwright/test';

export class BaseUtils {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // to not use a wildcard, pass in empty string to config: { wildcard: '' }
  // this can generate simple and clean css string locators.
  private locatorGenerator(
    locatorName: string,
    identifier: string,
    config: { wildcard: '^' | '*' | '$' | '' } = { wildcard: '*' }
  ) {
    return `[${locatorName}${config.wildcard}="${identifier}" i]`;
  };

  isMacOs() {
    return process.platform === "darwin";
  }

  currentBrowser() {
    try {
      const pageContext = this.page.context().browser();
      if (pageContext !== null) {
        return pageContext.browserType().name();
      }
    } catch (Error) {
      console.log(Error);
    }
    throw Error('Browser name returned null instead of a name value; check settings.')
  }

  // control key for cut/copy/paste/etc differs based on OS.
  setCtrlKeyModifier() {
    return this.isMacOs() ? 'Meta' : 'Control';
  }

  async grantClipboardPermission(context: BrowserContext) {
    if (this.currentBrowser() !== 'webkit') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
  }

  // To properly use this, data-testid must be set in the component using the valueText,
  // such as data-testid={optionData.valueText}.
  setGroupOptionWithCustomTestId(option: number | string, testIdBody: string = "") {
    const labelText: string = `Option ${option}`;
    const valueText: string = option.toString();
    const testId: string = `[data-testid*="${option}" i]`;
    return { labelText, valueText, testId };
  }

  textHas(expectedText: string | RegExp, actualText: string) {
    if (this.isString(expectedText)) {
      if (actualText.includes(expectedText as string)) {
        return true;
      }
      return (new RegExp(expectedText, 'ms').test(actualText));
    }
    return (expectedText as RegExp).test(actualText);
  }


  isString(value: any): boolean {
    return typeof value === 'string';
  }
}