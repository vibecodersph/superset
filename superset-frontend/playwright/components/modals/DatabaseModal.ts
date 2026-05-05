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

/**
 * "Connect a database" modal rendered by
 * superset-frontend/src/features/databases/DatabaseModal/index.tsx.
 *
 * Wraps the dynamic engine-parameter form, the SQLAlchemy URI form, and the
 * preferred-engine selector. Provides primitives that tests compose into
 * connection flows.
 */
export class DatabaseModal extends Modal {
  private static readonly SELECTORS = {
    MODAL: '[data-test="database-modal"]',
    PREFERRED_ITEM: '.preferred .preferred-item',
    SQLA_CONNECT_BUTTON: '[data-test="sqla-connect-btn"]',
    DATABASE_NAME_INPUT: '[data-test="database-name-input"]',
    SQLALCHEMY_URI_INPUT: '[data-test="sqlalchemy-uri-input"]',
    SUBMIT_BUTTON: '[data-test="btn-submit-connection"]',
    FORM_ITEM_ERROR: '.ant-form-item-explain-error',
  } as const;

  constructor(page: Page) {
    super(page, DatabaseModal.SELECTORS.MODAL);
  }

  /**
   * Click the Nth preferred-engine card (0-indexed, defaults to first).
   */
  async selectPreferredDatabase(index = 0): Promise<void> {
    await this.element
      .locator(DatabaseModal.SELECTORS.PREFERRED_ITEM)
      .nth(index)
      .click();
  }

  /**
   * Click the "Connect with a SQLAlchemy URI" link to switch to the URI form.
   */
  async clickConnectViaSqlAlchemy(): Promise<void> {
    await this.element
      .locator(DatabaseModal.SELECTORS.SQLA_CONNECT_BUTTON)
      .click();
  }

  /**
   * Locator for the database display-name input on the SQLAlchemy form.
   */
  get databaseNameInput(): Locator {
    return this.element.locator(DatabaseModal.SELECTORS.DATABASE_NAME_INPUT);
  }

  /**
   * Locator for the SQLAlchemy URI input on the SQLAlchemy form.
   */
  get sqlAlchemyUriInput(): Locator {
    return this.element.locator(DatabaseModal.SELECTORS.SQLALCHEMY_URI_INPUT);
  }

  /**
   * Locator for a named input on the dynamic connection form
   * (e.g. host, port, database, username, password, database_name).
   */
  getDynamicFieldInput(name: string): Locator {
    return this.element.locator(`input[name="${name}"]`);
  }

  /**
   * Locator for the "Connect" submit button (footer).
   */
  get submitButton(): Locator {
    return this.page.locator(DatabaseModal.SELECTORS.SUBMIT_BUTTON);
  }

  /**
   * Locator for an Ant Design form-item error message containing `text`.
   */
  getFormError(text: string | RegExp): Locator {
    return this.element
      .locator(DatabaseModal.SELECTORS.FORM_ITEM_ERROR)
      .filter({ hasText: text });
  }
}
