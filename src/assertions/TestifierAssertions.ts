import { type Page, test, expect } from '@playwright/test';
import { ConsoleAssertions } from './ConsoleAssertions';

class TestifierAssertions extends ConsoleAssertions {

  constructor(page: Page) {
    super(page);
  }
}

export  { TestifierAssertions, test, expect }