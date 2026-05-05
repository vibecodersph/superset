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
 * Database connection modal.
 *
 * Wraps the "Connect a database" wizard rendered by
 * `superset-frontend/src/features/databases/DatabaseModal/index.tsx`.
 *
 * The wizard supports two flows:
 *   - Dynamic form (selected by clicking a preferred-database tile)
 *   - SQLAlchemy URI form (opened via the "Connect this database with a
 *     SQLAlchemy URI string instead" button)
 */
export class DatabaseModal extends Modal {
  private static readonly SELECTORS = {
    PREFERRED_TILE: '.preferred .preferred-item',
    SQLA_CONNECT_BUTTON: '[data-test="sqla-connect-btn"]',
    SUBMIT_BUTTON: '[data-test="btn-submit-connection"]',
    DATABASE_NAME_INPUT: '[data-test="database-name-input"]',
    SQLALCHEMY_URI_INPUT: '[data-test="sqlalchemy-uri-input"]',
    FORM_ERROR: '.ant-form-item-explain-error',
  } as const;

  constructor(page: Page) {
    super(page, '[data-test="database-modal"]');
  }

  /**
   * Click the Nth preferred-database tile (0-indexed) to open the dynamic
   * connection form for that engine.
   *
   * @param index - Zero-based index of the preferred database tile
   */
  async clickPreferredDatabase(index = 0): Promise<void> {
    await this.element
      .locator(DatabaseModal.SELECTORS.PREFERRED_TILE)
      .nth(index)
      .click();
  }

  /**
   * Switch from the dynamic form to the SQLAlchemy URI form.
   */
  async clickSqlAlchemyConnect(): Promise<void> {
    await this.element
      .locator(DatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON)
      .click();
  }

  /**
   * Get a dynamic-form input by its `name` attribute (e.g. "host", "port",
   * "database", "username", "password", "database_name").
   *
   * @param name - The input's `name` attribute
   */
  getDynamicFormInput(name: string): Input {
    return new Input(this.page, this.element.locator(`input[name="${name}"]`));
  }

  /**
   * Get the database-name input on the SQLAlchemy form.
   */
  getDatabaseNameInput(): Locator {
    return this.element.locator(DatabaseModal.SELECTORS.DATABASE_NAME_INPUT);
  }

  /**
   * Get the SQLAlchemy URI input on the SQLAlchemy form.
   */
  getSqlAlchemyUriInput(): Locator {
    return this.element.locator(DatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT);
  }

  /**
   * Get the submit ("Connect") button used to validate and create the
   * database connection.
   */
  getSubmitButton(): Button {
    return new Button(
      this.page,
      this.element.locator(DatabaseModal.SELECTORS.SUBMIT_BUTTON),
    );
  }

  /**
   * Get a form-item error message locator filtered by its visible text.
   *
   * @param message - Substring or RegExp the error message should match
   */
  getFormError(message: string | RegExp): Locator {
    return this.element
      .locator(DatabaseModal.SELECTORS.FORM_ERROR)
      .filter({ hasText: message });
  }
}
