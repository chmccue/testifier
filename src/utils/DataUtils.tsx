import { type Locator, type Page } from '@playwright/test';
import { Nth, IPosition } from '@testifier/interfaces';
import { ValueUtils } from './ValueUtils'

export class DataUtils extends ValueUtils {

  constructor(page: Page) {
    super(page);
  }

  generateNumberList(maxNumber: number) {
    const numberList: number[] = [];
    for (let i: number = 0; i < maxNumber; i++) {
      numberList.push(i);
    }
    return numberList;
  }

  getRandomNumber(min: number = 1, max = 5) {
    return Math.random() * (max - min) + min;
  }

  getAverageNumber(numArray: number[]): number {
    const sum = this.getTotalNumber(numArray);
    return sum / numArray.length;
  }

  getTotalNumber(numArray: number[]): number {
    let sum = 0;
    for (let i = 0; i < numArray.length; ++i) {
        sum += numArray[i];
    }
    return sum;
  }

  convertArrayItemsToNumbers(enteredArray: any[]) {
    const numArray: number[] = [];
    for (let i = 0; i < enteredArray.length; i++) {
      numArray.push(+enteredArray[i]);
    }
    return numArray;
  }

  async getOrderedValues(primaryLocator: Locator | string, secondaryLocator: string,
    colPosition: Nth = { nth: 0 }, textOrValue: 'text' | 'value' = 'text') {
    const rowValues: (string | null)[] = [];
    let rowValue: string | null;
    const primaryLocatorReady = this.checkLocatorReady(primaryLocator);
    const rowCount = await primaryLocatorReady.count();
    for (let i = 0; i < rowCount; i++) {
      if (textOrValue === 'text') {
      rowValue = await (await this.setNth(primaryLocatorReady, { nth: i }))
        .locator(secondaryLocator).nth(colPosition.nth as number).innerText();
      } else {
        rowValue = await this.elementValue((await this.setNth(primaryLocatorReady, { nth: i }))
          .locator(secondaryLocator).nth(colPosition.nth as number));
      }
      rowValues.push(rowValue);
    }
    return rowValues;
  }

  async setXYLocator(xyData: IPosition) {
    const locReady = this.checkLocatorReady(xyData.xLocMain);
    return (await this.setNth(locReady, { nth: xyData.x }))
      .locator(xyData.yLocSecondary).nth(xyData.y);
  }

  async getOrderedValuesAsNumbers(row: Locator | string, rowCell: string, columnNth: Nth = {nth: 0}) {
    const getValues = await this.getOrderedValues(row, rowCell, columnNth);
    return this.convertArrayItemsToNumbers(getValues);
  }

  async getRowValueNumberTotal(row: Locator | string, rowCell: string, columnNth: Nth = {nth: 0}) {
    return this.getTotalNumber(
      await this.getOrderedValuesAsNumbers(row, rowCell, columnNth));
  }

  async getRowValueNumberAverage(row: Locator | string, rowCell: string, columnNth: Nth = {nth: 0}) {
    return this.getAverageNumber(
      await this.getOrderedValuesAsNumbers(row, rowCell, columnNth));
  }

}