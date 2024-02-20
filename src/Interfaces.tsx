import { Locator } from '@playwright/test';

interface IKeyboardControls {
  navigationKey?: string;
  selectorKey?: string;
  pressCount?: number;
  pressDelay?: number;
}

interface ISearchData {
  toBeFound?: any[];
  toNotBeFound?: any[];
}

interface Nth {
  nth: number | 'last';
}

interface IPosition {
  xLocMain: Locator | string;
  yLocSecondary: string;
  x: number;
  y: number;
}

export { IKeyboardControls, ISearchData, Nth, IPosition };
