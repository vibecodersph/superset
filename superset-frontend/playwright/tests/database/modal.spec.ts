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

import { expect, test } from '@playwright/test';
import { DatabaseListPage } from '../../pages/DatabaseListPage';
import { DatabaseModal } from '../../components/modals';
import { waitForPost } from '../../helpers/api/intercepts';
import { TIMEOUT } from '../../utils/constants';

const VALIDATE_PARAMETERS_PATH = 'api/v1/database/validate_parameters/';
const DATABASE_PATH = 'api/v1/database/';

const EMPTY_DYNAMIC_CONNECTION_FIELDS = [
  'host',
  'port',
  'database',
  'username',
  'password',
] as const;

test.beforeEach(async ({ page }) => {
  const databaseList = new DatabaseListPage(page);
  await databaseList.goto();
  await databaseList.waitForPageLoad();
  await databaseList.clickCreateDatabase();
});

test('should open dynamic form', async ({ page }) => {
  const modal = new DatabaseModal(page);
  await modal.waitForReady();
  await modal.selectPreferredDatabase();

  // Connection inputs default to empty when the dynamic form first renders.
  for (const name of EMPTY_DYNAMIC_CONNECTION_FIELDS) {
    await expect(modal.getDynamicFieldInput(name)).toHaveValue('');
  }
  // Selecting a preferred engine pre-fills `database_name` with the engine
  // label (e.g. "PostgreSQL").
  await expect(modal.getDynamicFieldInput('database_name')).not.toHaveValue('');
});

test('should open sqlalchemy form', async ({ page }) => {
  const modal = new DatabaseModal(page);
  await modal.waitForReady();
  await modal.selectPreferredDatabase();
  await modal.clickConnectViaSqlAlchemy();

  await expect(modal.databaseNameInput).toBeVisible();
  await expect(modal.sqlAlchemyUriInput).toBeVisible();
});

test('show error alerts on dynamic form for bad host', async ({ page }) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  const modal = new DatabaseModal(page);
  await modal.waitForReady();
  await modal.selectPreferredDatabase();

  await modal.getDynamicFieldInput('host').fill('badhost');
  await modal.getDynamicFieldInput('port').fill('5432');
  await modal.getDynamicFieldInput('username').fill('testusername');
  await modal.getDynamicFieldInput('database').fill('testdb');
  await modal.getDynamicFieldInput('password').fill('testpass');

  // Trigger blur-driven validation by clicking outside any input.
  await Promise.all([
    waitForPost(page, VALIDATE_PARAMETERS_PATH),
    page.locator('body').click({ position: { x: 0, y: 0 } }),
  ]);

  await expect(modal.submitButton).toBeEnabled();
  await Promise.all([
    waitForPost(page, DATABASE_PATH, { pathMatch: true }),
    modal.submitButton.click(),
  ]);

  await expect(
    modal.getFormError("The hostname provided can't be resolved"),
  ).toBeVisible();
});

test('show error alerts on dynamic form for bad port', async ({ page }) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  const modal = new DatabaseModal(page);
  await modal.waitForReady();
  await modal.selectPreferredDatabase();

  await modal.getDynamicFieldInput('host').fill('localhost');
  await Promise.all([
    waitForPost(page, VALIDATE_PARAMETERS_PATH),
    page.locator('body').click({ position: { x: 0, y: 0 } }),
  ]);

  await modal.getDynamicFieldInput('port').fill('5430');
  await modal.getDynamicFieldInput('database').fill('testdb');
  await modal.getDynamicFieldInput('username').fill('testusername');
  await modal.getDynamicFieldInput('password').fill('testpass');

  // Blur the password input so the form fires a final validate_parameters.
  await Promise.all([
    waitForPost(page, VALIDATE_PARAMETERS_PATH),
    page.locator('body').click({ position: { x: 0, y: 0 } }),
  ]);

  await expect(modal.submitButton).toBeEnabled();
  // First submit click triggers validate_parameters; while the button is in
  // its loading/disabled state, click outside and force a second submit to
  // fire the actual create request that surfaces the port error. The
  // `force` clicks mirror Cypress's `click({ force: true })`.
  await Promise.all([
    waitForPost(page, VALIDATE_PARAMETERS_PATH),
    modal.submitButton.click({ force: true }),
  ]);
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await Promise.all([
    waitForPost(page, DATABASE_PATH, { pathMatch: true }),
    modal.submitButton.click({ force: true }),
  ]);

  await expect(modal.getFormError('The port is closed')).toBeVisible();
});
