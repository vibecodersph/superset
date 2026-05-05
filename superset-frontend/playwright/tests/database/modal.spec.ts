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

  // Connection inputs render with empty values; the "database_name" display
  // input is pre-populated with the selected engine name (e.g. "PostgreSQL").
  for (const name of ['host', 'port', 'database', 'username', 'password']) {
    await expect(modal.getDynamicFieldInput(name)).toHaveValue('');
  }
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

  // Blur the last field so its onBlur fires validate_parameters.
  await Promise.all([
    waitForPost(page, VALIDATE_PARAMETERS_PATH),
    page.locator('body').click({ position: { x: 0, y: 0 } }),
  ]);

  // Submitting re-validates with onCreate=true, which surfaces the hostname
  // error in the form. Use force:true because the button briefly disables
  // itself while validation is in-flight.
  await modal.submitButton.click({ force: true });

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
  await modal.getDynamicFieldInput('port').fill('5430');
  await modal.getDynamicFieldInput('database').fill('testdb');
  await modal.getDynamicFieldInput('username').fill('testusername');
  await modal.getDynamicFieldInput('password').fill('testpass');

  // Blur the last field so its onBlur fires validate_parameters.
  await Promise.all([
    waitForPost(page, VALIDATE_PARAMETERS_PATH),
    page.locator('body').click({ position: { x: 0, y: 0 } }),
  ]);

  // Submitting re-validates with onCreate=true, which surfaces the port-closed
  // error in the form. Use force:true because the button briefly disables
  // itself while validation is in-flight.
  await modal.submitButton.click({ force: true });

  await expect(modal.getFormError('The port is closed')).toBeVisible();
});
