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

import { testWithAssets, expect } from '../../helpers/fixtures';
import { DatabaseListPage } from '../../pages/DatabaseListPage';
import { DatabaseModal } from '../../components/modals';
import { TIMEOUT } from '../../utils/constants';

/**
 * Extend testWithAssets with an opened database connection modal
 * (mirrors Cypress's `beforeEach` that clicked "+ Database").
 */
const test = testWithAssets.extend<{ databaseModal: DatabaseModal }>({
  databaseModal: async ({ page }, use) => {
    const databaseListPage = new DatabaseListPage(page);
    await databaseListPage.goto();
    await databaseListPage.waitForPageLoad();
    await databaseListPage.openCreateModal();

    const modal = new DatabaseModal(page);
    await modal.waitForReady();

    await use(modal);
  },
});

test('should open dynamic form', async ({ databaseModal }) => {
  await databaseModal.selectPreferredDatabase(0);

  // All dynamic-form fields start empty
  for (const name of [
    'host',
    'port',
    'database',
    'username',
    'password',
    'database_name',
  ]) {
    await expect(databaseModal.getDynamicFormInput(name).element).toHaveValue(
      '',
    );
  }
});

test('should open sqlalchemy form', async ({ databaseModal }) => {
  await databaseModal.selectPreferredDatabase(0);
  await databaseModal.clickSqlAlchemyConnect();

  await expect(databaseModal.getDatabaseNameInput()).toBeVisible();
  await expect(databaseModal.getSqlAlchemyUriInput()).toBeVisible();
});

test('show error alerts on dynamic form for bad host', async ({
  page,
  databaseModal,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  await databaseModal.selectPreferredDatabase(0);

  await databaseModal.getDynamicFormInput('host').fill('badhost');
  await databaseModal.getDynamicFormInput('port').fill('5432');
  await databaseModal.getDynamicFormInput('username').fill('testusername');
  await databaseModal.getDynamicFormInput('database').fill('testdb');
  await databaseModal.getDynamicFormInput('password').fill('testpass');

  // Blur the focused field so the form's debounced validation fires.
  await page.locator('body').click({ position: { x: 0, y: 0 }, force: true });

  const submit = databaseModal.getSubmitButton();
  // Submit becomes enabled once the validation request resolves with no
  // missing-field errors. Auto-retry waits for that asynchronously.
  await expect(submit.element).toBeEnabled();
  await submit.element.click({ force: true });

  await expect(
    databaseModal.getFormError("The hostname provided can't be resolved"),
  ).toBeVisible({ timeout: TIMEOUT.API_RESPONSE * 2 });
});

test('show error alerts on dynamic form for bad port', async ({
  page,
  databaseModal,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  await databaseModal.selectPreferredDatabase(0);

  await databaseModal.getDynamicFormInput('host').fill('localhost');
  await databaseModal.getDynamicFormInput('port').fill('5430');
  await databaseModal.getDynamicFormInput('database').fill('testdb');
  await databaseModal.getDynamicFormInput('username').fill('testusername');
  await databaseModal.getDynamicFormInput('password').fill('testpass');

  // Blur the focused field so the form's debounced validation fires.
  await page.locator('body').click({ position: { x: 0, y: 0 }, force: true });

  const submit = databaseModal.getSubmitButton();
  await expect(submit.element).toBeEnabled();
  await submit.element.click({ force: true });

  await expect(databaseModal.getFormError('The port is closed')).toBeVisible({
    timeout: TIMEOUT.API_RESPONSE * 2,
  });
});
