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
import { Button } from '../components/core';
import { URL } from '../utils/urls';

/**
 * Page object for the Database list page (`/databaseview/list/`).
 *
 * Exposes the entry point used by the connect-database modal test,
 * namely the "+ Database" button that opens `ConnectDatabaseModal`.
 */
export class DatabaseListPage {
  private readonly page: Page;

  private static readonly SELECTORS = {
    ADD_DATABASE_BUTTON: '[data-test="btn-create-database"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the database list page.
   */
  async goto(): Promise<void> {
    await this.page.goto(URL.DATABASE_LIST);
  }

  /**
   * "+ Database" button that opens the connect-database modal.
   */
  getAddDatabaseButton(): Button {
    return new Button(
      this.page,
      this.page.locator(DatabaseListPage.SELECTORS.ADD_DATABASE_BUTTON),
    );
  }

  /**
   * Click the "+ Database" button to open the connect-database modal.
   */
  async clickAddDatabase(): Promise<void> {
    await this.getAddDatabaseButton().click();
  }
}
