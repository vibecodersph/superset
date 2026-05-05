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
import { Button, Input, Modal } from '../core';

/**
 * "Connect a database" modal opened from the database list page.
 *
 * Wraps the modal identified by `data-test="database-modal"`. Exposes the
 * preferred-database tiles, the dynamic-form inputs, the SQLAlchemy URI
 * form fields, the submit button, and the form-item validation errors used
 * by the migrated Cypress modal spec.
 */
export class ConnectDatabaseModal extends Modal {
  private static readonly SELECTORS = {
    PREFERRED_TILE: '.preferred .preferred-item',
    SQLA_CONNECT_BUTTON: '[data-test="sqla-connect-btn"]',
    SUBMIT_CONNECTION_BUTTON: '[data-test="btn-submit-connection"]',
    DATABASE_NAME_INPUT: '[data-test="database-name-input"]',
    SQLALCHEMY_URI_INPUT: '[data-test="sqlalchemy-uri-input"]',
    FORM_ITEM_EXPLAIN_ERROR: '.ant-form-item-explain-error',
  } as const;

  constructor(page: Page) {
    super(page, '[data-test="database-modal"]');
  }

  /**
   * Click the first "preferred" database tile (e.g. PostgreSQL) to open the
   * dynamic connection form for that engine.
   */
  async selectFirstPreferredDatabase(): Promise<void> {
    await this.element
      .locator(ConnectDatabaseModal.SELECTORS.PREFERRED_TILE)
      .first()
      .click();
  }

  /**
   * Click the "Connect this database with a SQLAlchemy URI string instead"
   * link to switch to the URI form.
   */
  async clickConnectWithSqlAlchemyUri(): Promise<void> {
    await new Button(
      this.page,
      this.element.locator(ConnectDatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON),
    ).click();
  }

  /**
   * Get a dynamic-form input by `name` attribute (e.g. `host`, `port`,
   * `database`, `username`, `password`, `database_name`).
   */
  getDynamicFormInput(fieldName: string): Input {
    return new Input(
      this.page,
      this.element.locator(`input[name="${fieldName}"]`),
    );
  }

  /**
   * "Display name" input shown on the SQLAlchemy URI form.
   */
  getDatabaseNameInput(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.DATABASE_NAME_INPUT,
    );
  }

  /**
   * SQLAlchemy URI input shown on the SQLAlchemy URI form.
   */
  getSqlAlchemyUriInput(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT,
    );
  }

  /**
   * Submit / "Connect" button on the dynamic and SQLAlchemy forms.
   */
  getSubmitButton(): Button {
    return new Button(
      this.page,
      this.element.locator(
        ConnectDatabaseModal.SELECTORS.SUBMIT_CONNECTION_BUTTON,
      ),
    );
  }

  /**
   * Locator for an `.ant-form-item-explain-error` containing the given text.
   * Use with `expect(...).toBeVisible()` to assert that a particular
   * validation error is rendered.
   */
  getFormItemError(text: string): Locator {
    return this.element
      .locator(ConnectDatabaseModal.SELECTORS.FORM_ITEM_EXPLAIN_ERROR)
      .filter({ hasText: text });
  }
}
