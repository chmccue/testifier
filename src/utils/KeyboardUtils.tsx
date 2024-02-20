import { BrowserContext, type Locator, type Page } from '@playwright/test';
import { IKeyboardControls } from '@testifier/interfaces';
import { ClickUtils } from './ClickUtils';

export class KeyboardUtils extends ClickUtils {

  constructor(page: Page) {
    super(page);
  }

  // ensure common a11y keys entered correctly
  setKey(keyName: string) {
    let keyNameReady: string = keyName.toLowerCase();
    if (keyNameReady.includes('tab')) {
      keyNameReady = 'Tab';
    } else if (keyNameReady.includes('right')) {
      keyNameReady = 'ArrowRight';
    } else if (keyNameReady.includes('left')) {
      keyNameReady = 'ArrowLeft';
    } else if (keyNameReady.includes('enter')) {
      keyNameReady = 'Enter';
    } else if (this.textHas(keyNameReady, '^space')) {
      keyNameReady = ' ';
    } else {
      keyNameReady = keyName;
    }
    return keyNameReady;
  }
  
  // for cases of navigation, such as pressing Tab, holding Shift goes in reverse.
  // setting pressCount to a negative number will trigger reverse mode, expecting to
  // hold Shift and go in reverse.
  async pressKey(
    keyName: string,
    pressCount: number = 1,
    pressDelay: number = 5,
    shift: { holdShift: boolean } = {holdShift: false}) {
    const page = this.page as Page;
    const keyNameReady = this.setKey(keyName);
    const holdShift: boolean = pressCount < 0 || shift.holdShift;
    const browser = this.currentBrowser();
    if (holdShift) await (page).keyboard.down('Shift');
    if (browser === 'webkit' && keyNameReady === 'Tab') {
      await page.keyboard.down('Alt');
    }
    for (let i = 0; i < Math.abs(pressCount); i++) {
      await (page).keyboard.press(keyNameReady);
      await this.hardWait(pressDelay);
    }
    if (browser === 'webkit' && keyNameReady === 'Tab') {
      await page.keyboard.up('Alt');
    }
    if (holdShift) await (this.page as Page).keyboard.up('Shift');
  }

      // helper method, to help set defaults if IKeyboardControls is not fully filled out.
  async setKeyboardControlParams(keyControls: IKeyboardControls | undefined) {
    const controls: IKeyboardControls = keyControls === undefined ? {} : keyControls;
    const navigationKey = controls.navigationKey === undefined ? 'Tab' : controls.navigationKey;
    const selectorKey = controls.selectorKey === undefined ? 'Enter' : controls.selectorKey;
    const pressCount = controls.pressCount === undefined ? 20 : controls.pressCount;
    const pressDelay = controls.pressDelay === undefined ? 5 : controls.pressDelay;
    return { navigationKey, selectorKey, pressCount, pressDelay };
  }

  async enterText(element: Locator, text: string, typeDelay: number = 0) {
    if (typeDelay > 0) {
      return element.pressSequentially(text, { delay: typeDelay, timeout: 15000 });
    }
      return element.fill(text, { timeout: 15000 });
  };

  async clearAndEnterText (element: Locator, text: string, typeDelay: number = 0) {
    await element.clear();
    return this.enterText(element, text, typeDelay);
  };

  async dragItemByAmount(item: Locator | string, x: number, y: number = 0) {
    const itemReady = await this.checkLocatorReadyAndStrict(item);
    await itemReady.hover();
    await (this.page as Page).mouse.down();
    await (this.page as Page).mouse.move(x, y);
    await (this.page as Page).mouse.up();
  }

  async selectWithKeyboardAndWaitForNewPage(
    context: BrowserContext, textToSelect: string,
    keyControls: IKeyboardControls = {navigationKey: 'Tab', selectorKey: 'Enter', pressDelay: 5}) {
    const keyControlsReady = await this.setKeyboardControlParams(keyControls);
    const keyToAndSelect = (async () => {
      await this.focusElementByTextUsingKeyboard(
        textToSelect, keyControlsReady);
      await this.pressKey(keyControlsReady.selectorKey);
    })
    const newPage: Page = await this.interactAndWaitForNewPage(context, keyToAndSelect);
    return newPage;
  }

  async focusElementByTextUsingKeyboard(
    toSearch: string, keyControls?: IKeyboardControls) {
      return this.focusElementUsingKeyboard('text', toSearch, keyControls);
  }

  async focusElementByLocatorUsingKeyboard(loc: string, keyControls?: IKeyboardControls) {
    return this.focusElementUsingKeyboard('locator', loc, keyControls);
  }

  async focusElementUsingKeyboard(
    finderType: 'text' | 'locator',
    toFocus: string, keyControls?: IKeyboardControls) {
      const keyControlsReady = await this.setKeyboardControlParams(keyControls);
      let elementFocused: boolean = false;
      for (let i: number = 0; i < keyControlsReady.pressCount; i++) {
        if (finderType === 'text') {
          const focusedElementText: string = await (this.page).evaluate(() => {
            const activeElement = document.activeElement;
            if (activeElement === null) {
              throw Error(`activeElement within focusElementUsingKeyboard returned null`);
            }
            if (activeElement.textContent === null) {
              return '';
            }
            return activeElement.textContent;
          });
        elementFocused = focusedElementText.includes(toFocus);
      } else {
        const focusedElement = this.strToLoc(`${toFocus}:focus`);
        elementFocused = await focusedElement.count() === 1;
      }
      if (elementFocused === true) break;
      await this.pressKey(keyControlsReady.navigationKey, 1, keyControlsReady.pressDelay);
      }
      return elementFocused;
    }

  async pressCopyKeys() {
    const modifier = this.setCtrlKeyModifier();
    await this.pressKey(`${modifier}+C`);
  }
  
  async pressCutKeys() {
    const modifier = this.setCtrlKeyModifier();
    await this.pressKey(`${modifier}+X`);
  }
  
  async pressPasteKeys() {
    const modifier = this.setCtrlKeyModifier();
    await this.pressKey(`${modifier}+V`);
  }
  
  async pressTab(pressCount: number = 1) {
    await this.pressKey('Tab', pressCount);
  }
  
  async pressTabThenSpace(tabPressCount: number = 1) {
    await this.pressTab(tabPressCount);
    await this.pressKey(' ');
  }
  
  async pressEscape(pressCount: number = 1) {
    await this.pressKey('Escape', pressCount);
  }
  
  // add data-testid="hover-off" as an attribute of the area to represent the hover-off state.
  async hoverOverOtherArea(hoverOffLocator = '[data-testid*="hover-off"]') {
    const locReady = await this.checkLocatorReadyAndStrict(hoverOffLocator);
    await locReady.hover();
    await locReady.hover();
  }
}