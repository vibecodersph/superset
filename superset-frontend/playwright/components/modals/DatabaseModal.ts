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
import { Modal } from '../core/Modal';
import { Input } from '../core/Input';
import { Button } from '../core/Button';

/**
 * Field names rendered by the database connection dynamic form.
 */
export type DynamicFormFieldName =
  | 'host'
  | 'port'
  | 'database'
  | 'username'
  | 'password'
  | 'database_name';

/**
 * Database connection modal component.
 *
 * Wraps the "Connect a database" wizard rendered by
 * `superset-frontend/src/features/databases/DatabaseModal/index.tsx`.
 */
export class DatabaseModal extends Modal {
  private static readonly SELECTORS = {
    PREFERRED_ITEM: '.preferred .preferred-item',
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
   * Selects the Nth preferred database tile (0-indexed) to open the
   * dynamic connection form.
   * @param index - Zero-based index of the preferred database tile
   */
  async selectPreferredDatabase(index = 0): Promise<void> {
    await this.element
      .locator(DatabaseModal.SELECTORS.PREFERRED_ITEM)
      .nth(index)
      .click();
  }

  /**
   * Switches the dynamic form to the SQLAlchemy URI form.
   */
  async clickSqlAlchemyConnect(): Promise<void> {
    await this.element
      .locator(DatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON)
      .click();
  }

  /**
   * Returns a dynamic-form input wrapper by its `name` attribute
   * (e.g. "host", "port", "database", "username", "password",
   * "database_name").
   */
  getDynamicFormInput(name: DynamicFormFieldName): Input {
    return new Input(this.page, this.element.locator(`input[name="${name}"]`));
  }

  /**
   * Returns the database-name input on the SQLAlchemy URI form.
   */
  getDatabaseNameInput(): Locator {
    return this.element.locator(DatabaseModal.SELECTORS.DATABASE_NAME_INPUT);
  }

  /**
   * Returns the SQLAlchemy URI input on the SQLAlchemy URI form.
   */
  getSqlAlchemyUriInput(): Locator {
    return this.element.locator(DatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT);
  }

  /**
   * Returns the submit/connect button.
   */
  getSubmitButton(): Button {
    return new Button(
      this.page,
      this.element.locator(DatabaseModal.SELECTORS.SUBMIT_BUTTON),
    );
  }

  /**
   * Returns a form-error message locator filtered by text content.
   */
  getFormError(message: string | RegExp): Locator {
    return this.element
      .locator(DatabaseModal.SELECTORS.FORM_ERROR)
      .filter({ hasText: message });
  }
}
