/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Page } from '@playwright/test';
import { URL } from '../utils/urls';

/**
 * Database List Page object (databaseview/list).
 * Provides primitives for navigating to the page and opening the
 * "Connect a database" modal.
 */
export class DatabaseListPage {
  private readonly page: Page;

  private static readonly SELECTORS = {
    CREATE_BUTTON: '[data-test="btn-create-database"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the database list page
   */
  async goto(): Promise<void> {
    await this.page.goto(URL.DATABASE_LIST);
  }

  /**
   * Wait for the create database button to be ready (page-load signal)
   */
  async waitForPageLoad(options?: { timeout?: number }): Promise<void> {
    await this.page
      .locator(DatabaseListPage.SELECTORS.CREATE_BUTTON)
      .waitFor({ state: 'visible', ...options });
  }

  /**
   * Click "+ Database" to open the connection modal
   */
  async clickCreateDatabase(): Promise<void> {
    await this.page.locator(DatabaseListPage.SELECTORS.CREATE_BUTTON).click();
  }
}
