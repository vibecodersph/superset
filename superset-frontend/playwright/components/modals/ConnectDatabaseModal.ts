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
 * Two connection paths are exposed:
 * - A dynamic form pre-configured for popular databases (selected via the
 *   "preferred" database tiles).
 * - A free-form SQLAlchemy URI form (entered via the "Connect this database
 *   with a SQLAlchemy URI string instead" link).
 */
export class ConnectDatabaseModal extends Modal {
  private static readonly SELECTORS = {
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
   * Click the first preferred-database tile to open the dynamic form.
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
    await this.element
      .locator(ConnectDatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON)
      .click();
  }

  /**
   * Get a dynamic-form input by its HTML name attribute (e.g. host, port,
   * database, username, password, database_name). Scoped to the modal.
   */
  getDynamicFormInput(name: string): Input {
    return new Input(this.page, this.element.locator(`input[name="${name}"]`));
  }

  /**
   * Get the SQLAlchemy-form database name input locator (scoped to the modal).
   */
  getDatabaseNameInput(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.DATABASE_NAME_INPUT,
    );
  }

  /**
   * Get the SQLAlchemy URI input locator (scoped to the modal).
   */
  getSqlAlchemyUriInput(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT,
    );
  }

  /**
   * Get the "Connect" submit button on the dynamic form.
   */
  getSubmitConnectionButton(): Button {
    return new Button(
      this.page,
      this.element.locator(
        ConnectDatabaseModal.SELECTORS.SUBMIT_CONNECTION_BUTTON,
      ),
    );
  }

  /**
   * Get a form-item error element that contains the given text.
   */
  getFormItemErrorWithText(text: string): Locator {
    return this.element
      .locator(ConnectDatabaseModal.SELECTORS.FORM_ITEM_ERROR)
      .filter({ hasText: text });
  }
}
