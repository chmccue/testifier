import { type Locator, type Page } from '@playwright/test';
import { ISearchData } from '@testifier/interfaces';
import { WaitUtils } from './WaitUtils';

export class ValueUtils extends WaitUtils {

  constructor(page: Page) {
    super(page);
  }

  async enhancedSearch(searchData: string | string[], toSearch: ISearchData) {
    /*
    if 'toSearch' data doesn't match what's found,
    it returns relevant failData as an array that can be asserted for array length > 0.
    Can search for text found or text not found using ISearchData
    */
    const searchDataReady = searchData.toString();
    const fails: string[] = [];
    const firstFailAdditionalDetails =
    `search data (view below to see error list) =>\n'''\n${searchDataReady}\n'''\n>>> ERROR LIST >>>\n|\n|`;
    const notFoundDetails = '- expected to be found, but wasn\'t:'
    const foundDetails = '- expected not to be found, but was:'
    if (toSearch.toBeFound !== undefined) {
      toSearch.toBeFound.forEach(async (item) => {
        if (!this.textHas(item, searchDataReady)) {
          if (fails.length === 0) {
            fails.push(`${firstFailAdditionalDetails}\n1${notFoundDetails} ${item}`);
          } else {
          fails.push(`\n${fails.length + 1}${notFoundDetails} ${item}`);
          }
        }
      });
    }
    if (toSearch.toNotBeFound !== undefined) {
      toSearch.toNotBeFound.forEach(async (item) => {
        if (this.textHas(item, searchDataReady)) {
          if (fails.length === 0) {
            fails.push(`${firstFailAdditionalDetails}\n1${foundDetails} ${item}`);
          } else {
          fails.push(`\n${fails.length + 1}${foundDetails} ${item}`);
          }
        }
      });
    }
    return fails;
  }

  // pass in a custom function to check an expected console output
  async interactAndCheckConsoleOutput(
    page: Page, interactionMethod: Function, toSearch: ISearchData) {
    const submitPromise = page.waitForEvent('console');
    await interactionMethod();
    const msg = await submitPromise;
    return this.enhancedSearch(msg.text(), toSearch);
  }

  async getElementText(loc: string | Locator) {
    await this.webkitDelay();
    const locReady = await this.checkLocatorReadyAndStrict(loc);
    const text = await locReady.allInnerTexts();
    return text;
  }

  async elementValue(element: Locator) {
    return element.getAttribute('value');
  };

  async elementPlaceholder(element: Locator) {
    return element.getAttribute('placeholder');
  };

  async getAttribute(loc: Locator | string, attribute: string) {
    const locReady = await this.checkLocatorReadyAndStrict(loc);
    return locReady.getAttribute(attribute);
  };

}