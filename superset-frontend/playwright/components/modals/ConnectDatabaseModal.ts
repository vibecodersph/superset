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
import { Modal } from '../core';

/**
 * Connect-database modal rendered by
 * `superset-frontend/src/features/databases/DatabaseModal/index.tsx`.
 *
 * Scoped to the modal container (`[data-test="database-modal"]`) so locators
 * don't collide with elements on the underlying database list page.
 */
export class ConnectDatabaseModal extends Modal {
  private static readonly SELECTORS = {
    SQLA_CONNECT_BUTTON: '[data-test="sqla-connect-btn"]',
    SUBMIT_CONNECTION_BUTTON: '[data-test="btn-submit-connection"]',
    DATABASE_NAME_INPUT: '[data-test="database-name-input"]',
    SQLALCHEMY_URI_INPUT: '[data-test="sqlalchemy-uri-input"]',
    PREFERRED_DATABASE: '.preferred .preferred-item',
    FORM_ERROR: '.ant-form-item-explain-error',
  } as const;

  constructor(page: Page) {
    super(page, '[data-test="database-modal"]');
  }

  /**
   * Click the first preferred database tile (e.g. PostgreSQL) to switch the
   * modal into the dynamic-form connection wizard.
   */
  async selectFirstPreferredDatabase(): Promise<void> {
    await this.element
      .locator(ConnectDatabaseModal.SELECTORS.PREFERRED_DATABASE)
      .first()
      .click();
  }

  /**
   * Click "Connect this database with a SQLAlchemy URI string instead" to
   * switch the modal into the SQLAlchemy URI form.
   */
  async clickConnectWithSqlAlchemyUri(): Promise<void> {
    await this.element
      .locator(ConnectDatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON)
      .click();
  }

  /**
   * Locator for a dynamic-form input by its `name` attribute (e.g. `host`,
   * `port`, `database`, `username`, `password`, `database_name`).
   */
  getDynamicFormInput(name: string): Locator {
    return this.element.locator(`input[name="${name}"]`);
  }

  /**
   * Locator for the display-name input in the SQLAlchemy URI form.
   */
  getDatabaseNameInput(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.DATABASE_NAME_INPUT,
    );
  }

  /**
   * Locator for the SQLAlchemy URI input in the SQLAlchemy URI form.
   */
  getSqlAlchemyUriInput(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT,
    );
  }

  /**
   * Locator for the primary "Connect" submit button shown on the dynamic
   * connection form.
   */
  getSubmitConnectionButton(): Locator {
    return this.element.locator(
      ConnectDatabaseModal.SELECTORS.SUBMIT_CONNECTION_BUTTON,
    );
  }

  /**
   * Locator for an inline form error message that contains the given text.
   */
  getFormError(message: string): Locator {
    return this.element
      .locator(ConnectDatabaseModal.SELECTORS.FORM_ERROR)
      .filter({ hasText: message });
  }
}
