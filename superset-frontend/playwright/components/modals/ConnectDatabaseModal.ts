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

import { Locator, Page } from '@playwright/test';
import { Modal, Input, Button } from '../core';

/**
 * The "Connect a database" modal that opens from the database list page.
 *
 * The modal exposes two connection paths:
 * - A dynamic form pre-configured for popular databases (selected via the
 *   "preferred" database tiles).
 * - A free-form SQLAlchemy URI form (entered via the "Connect this database
 *   with a SQLAlchemy URI string instead" link).
 */
export class ConnectDatabaseModal extends Modal {
  private static readonly SELECTORS = {
    CLOSE_BUTTON: '[data-test="close-modal-btn"]',
    PREFERRED_LIST: '.preferred',
    PREFERRED_ITEM: '.preferred-item',
    SQLA_CONNECT_BUTTON: '[data-test="sqla-connect-btn"]',
    SUBMIT_CONNECTION_BUTTON: '[data-test="btn-submit-connection"]',
    DATABASE_NAME_INPUT: '[data-test="database-name-input"]',
    SQLALCHEMY_URI_INPUT: '[data-test="sqlalchemy-uri-input"]',
    FORM_ITEM_ERROR: '.ant-form-item-explain-error',
  } as const;

  constructor(page: Page) {
    super(page, '[data-test="database-modal"]');
  }

  /**
   * Click the first preferred database tile to open the dynamic form.
   */
  async selectFirstPreferredDatabase(): Promise<void> {
    await this.element
      .locator(ConnectDatabaseModal.SELECTORS.PREFERRED_ITEM)
      .first()
      .click();
  }

  /**
   * Click the "Connect this database with a SQLAlchemy URI string instead"
   * link to switch to the SQLAlchemy URI form.
   */
  async clickConnectWithSqlAlchemyUri(): Promise<void> {
    await this.page
      .locator(ConnectDatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON)
      .click();
  }

  /**
   * Get the dynamic form input by HTML name attribute (e.g. host, port,
   * database, username, password, database_name).
   */
  getDynamicFormInput(name: string): Input {
    return new Input(this.page, this.element.locator(`input[name="${name}"]`));
  }

  /**
   * Get the SQLAlchemy form database name input locator.
   */
  getDatabaseNameInput(): Locator {
    return this.page.locator(ConnectDatabaseModal.SELECTORS.DATABASE_NAME_INPUT);
  }

  /**
   * Get the SQLAlchemy URI input locator.
   */
  getSqlAlchemyUriInput(): Locator {
    return this.page.locator(ConnectDatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT);
  }

  /**
   * Get the "Connect" submit button on the dynamic form.
   */
  getSubmitConnectionButton(): Button {
    return new Button(
      this.page,
      this.page.locator(ConnectDatabaseModal.SELECTORS.SUBMIT_CONNECTION_BUTTON),
    );
  }

  /**
   * Get a form-item error locator that contains the given text.
   */
  getFormItemErrorWithText(text: string): Locator {
    return this.page
      .locator(ConnectDatabaseModal.SELECTORS.FORM_ITEM_ERROR)
      .filter({ hasText: text });
  }

  /**
   * Close the modal if it is currently visible.
   */
  async closeIfVisible(): Promise<void> {
    if (await this.element.isVisible()) {
      await this.element
        .locator(ConnectDatabaseModal.SELECTORS.CLOSE_BUTTON)
        .first()
        .click();
      await this.waitForHidden();
    }
  }
}
