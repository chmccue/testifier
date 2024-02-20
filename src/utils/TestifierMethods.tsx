import { type Page } from '@playwright/test';
import { KeyboardUtils } from './KeyboardUtils';

class TestifierMethods extends KeyboardUtils {

  constructor(page: Page) {
    super(page);
  }
}

export { TestifierMethods }