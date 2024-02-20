import { Locator, type Page } from '@playwright/test';
import { IKeyboardControls, ISearchData } from '../Interfaces';
import { BaseAssertions } from './BaseAssertions';

export class ConsoleAssertions extends BaseAssertions {

  constructor(page: Page) {
    super(page);
  }

  async pressKeyAndVerifyConsoleOutput(
    page: Page, toSearch: ISearchData, toPress: string = 'Enter') {
    const pressKey = async () => {
      await this.core.pressKey(toPress);
    }
    const checkConsole = await this.core.interactAndCheckConsoleOutput(page, pressKey, toSearch);
    await this.hasLength(checkConsole, 0);
  }

  async clickElementAndVerifyConsoleOutput(
    page: Page, toClick: string | Locator, toSearch: ISearchData) {
    const clickItem = (async () => {
      await this.core.clickOn(toClick);
    });
    await this.hasLength(
      await this.core.interactAndCheckConsoleOutput(page, clickItem, toSearch), 0);
  }

  async selectUsingKeyboardAndVerifyConsoleOutput(
    page: Page, toSearchInConsole: ISearchData,
    textToSelect: string, keyControls?: IKeyboardControls) {
    const keyControlsReady = await this.core.setKeyboardControlParams(keyControls);
    await this.core.focusElementByTextUsingKeyboard(textToSelect, keyControlsReady);
    await this.pressKeyAndVerifyConsoleOutput(
      page, toSearchInConsole, keyControlsReady.selectorKey);
  }

  async interactAndVerifyConsoleOutput(
    page: Page, customFunction: Function, toSearch: ISearchData) {
    await this.hasLength(
      await this.core.interactAndCheckConsoleOutput(page, customFunction, toSearch), 0);
  }
}