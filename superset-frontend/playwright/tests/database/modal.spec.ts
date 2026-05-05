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
import { ConnectDatabaseModal } from '../../components/modals';
import { waitForPost } from '../../helpers/api/intercepts';
import { TIMEOUT } from '../../utils/constants';

/**
 * Extend testWithAssets so each test starts on the database list page with
 * the connect-database modal open (matches the Cypress beforeEach flow).
 */
const test = testWithAssets.extend<{
  databaseListPage: DatabaseListPage;
  connectDatabaseModal: ConnectDatabaseModal;
}>({
  databaseListPage: async ({ page }, use) => {
    const databaseListPage = new DatabaseListPage(page);
    await databaseListPage.goto();
    await use(databaseListPage);
  },
  connectDatabaseModal: async ({ page, databaseListPage }, use) => {
    const connectDatabaseModal = new ConnectDatabaseModal(page);
    // Defensive close in case a previous test left the modal open
    await connectDatabaseModal.closeIfVisible();
    await databaseListPage.clickAddDatabase();
    await connectDatabaseModal.waitForReady();
    await use(connectDatabaseModal);
  },
});

test('should open the dynamic database connection form with empty fields', async ({
  connectDatabaseModal,
}) => {
  await connectDatabaseModal.selectFirstPreferredDatabase();

  // Connection-detail fields are empty before the user supplies credentials.
  for (const fieldName of [
    'host',
    'port',
    'database',
    'username',
    'password',
  ]) {
    await expect(
      connectDatabaseModal.getDynamicFormInput(fieldName).element,
    ).toHaveValue('');
  }

  // The display name field is pre-populated with the engine name from the
  // preferred-database tile (e.g. "PostgreSQL") so we just assert it's visible.
  await expect(
    connectDatabaseModal.getDynamicFormInput('database_name').element,
  ).toBeVisible();
});

test('should open the SQLAlchemy URI form', async ({
  connectDatabaseModal,
}) => {
  await connectDatabaseModal.selectFirstPreferredDatabase();
  await connectDatabaseModal.clickConnectWithSqlAlchemyUri();

  await expect(connectDatabaseModal.getDatabaseNameInput()).toBeVisible();
  await expect(connectDatabaseModal.getSqlAlchemyUriInput()).toBeVisible();
});

test('should show an error when the dynamic form has a bad host', async ({
  page,
  connectDatabaseModal,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  await connectDatabaseModal.selectFirstPreferredDatabase();

  // Fill out the dynamic form with values that will fail DNS resolution
  await connectDatabaseModal.getDynamicFormInput('host').fill('badhost');
  await connectDatabaseModal.getDynamicFormInput('port').fill('5432');
  await connectDatabaseModal
    .getDynamicFormInput('username')
    .fill('testusername');
  await connectDatabaseModal.getDynamicFormInput('database').fill('testdb');
  await connectDatabaseModal.getDynamicFormInput('password').fill('testpass');

  // Trigger blur-based validation by clicking outside the form
  const validateOnBlur = waitForPost(
    page,
    '/api/v1/database/validate_parameters',
  );
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await validateOnBlur;

  const submitButton = connectDatabaseModal.getSubmitConnectionButton();
  await expect(submitButton.element).toBeEnabled();

  const validateOnSubmit = waitForPost(
    page,
    '/api/v1/database/validate_parameters',
  );
  const createDb = waitForPost(page, /\/api\/v1\/database\/?$/);
  await submitButton.click({ force: true });
  await validateOnSubmit;
  await createDb;

  await expect(
    connectDatabaseModal.getFormItemErrorWithText(
      "The hostname provided can't be resolved",
    ),
  ).toBeVisible();
});

test('should show an error when the dynamic form has a closed port', async ({
  page,
  connectDatabaseModal,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  await connectDatabaseModal.selectFirstPreferredDatabase();

  await connectDatabaseModal.getDynamicFormInput('host').fill('localhost');
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await waitForPost(page, '/api/v1/database/validate_parameters');

  await connectDatabaseModal.getDynamicFormInput('port').fill('5430');
  await connectDatabaseModal.getDynamicFormInput('database').fill('testdb');
  await connectDatabaseModal
    .getDynamicFormInput('username')
    .fill('testusername');
  await waitForPost(page, '/api/v1/database/validate_parameters');

  await connectDatabaseModal.getDynamicFormInput('password').fill('testpass');
  await waitForPost(page, '/api/v1/database/validate_parameters');

  const submitButton = connectDatabaseModal.getSubmitConnectionButton();
  await expect(submitButton.element).toBeEnabled();

  await submitButton.click({ force: true });
  await waitForPost(page, '/api/v1/database/validate_parameters');

  await page.locator('body').click({ position: { x: 0, y: 0 } });
  const createDb = waitForPost(page, /\/api\/v1\/database\/?$/);
  await submitButton.click({ force: true });
  await createDb;

  await expect(
    connectDatabaseModal.getFormItemErrorWithText('The port is closed'),
  ).toBeVisible();
});
