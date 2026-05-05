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

import { test, expect } from '@playwright/test';
import { ConnectDatabaseModal } from '../../components/modals';
import { DatabaseListPage } from '../../pages/DatabaseListPage';
import { waitForPost } from '../../helpers/api/intercepts';
import { TIMEOUT } from '../../utils/constants';

/**
 * Migrated from
 * `superset-frontend/cypress-base/cypress/e2e/database/modal.test.ts`.
 *
 * Each test opens the connect-database modal from the database list and
 * exercises the dynamic-form / SQLAlchemy-form code paths. The bad-host /
 * bad-port tests rely on the backend `validate_parameters` and `database`
 * create endpoints to surface error messages, so they bump the test timeout
 * to `TIMEOUT.SLOW_TEST`.
 */

const VALIDATE_PARAMETERS_PATH = '/api/v1/database/validate_parameters/';
const CREATE_DATABASE_PATH = '/api/v1/database/';

const EMPTY_DYNAMIC_FORM_FIELDS = [
  'host',
  'port',
  'database',
  'username',
  'password',
] as const;

test.beforeEach(async ({ page }) => {
  const databaseListPage = new DatabaseListPage(page);
  const connectDatabaseModal = new ConnectDatabaseModal(page);

  await databaseListPage.goto();
  await databaseListPage.clickAddDatabase();
  await connectDatabaseModal.waitForReady();
});

test('should open dynamic form', async ({ page }) => {
  const connectDatabaseModal = new ConnectDatabaseModal(page);
  await connectDatabaseModal.selectFirstPreferredDatabase();

  for (const fieldName of EMPTY_DYNAMIC_FORM_FIELDS) {
    await expect(
      connectDatabaseModal.getDynamicFormInput(fieldName),
    ).toHaveValue('');
  }

  // The display-name input is pre-populated with the selected engine name
  // (e.g. "PostgreSQL") by `setDatabaseModel`, so we only assert that it is
  // rendered rather than asserting an empty value.
  await expect(
    connectDatabaseModal.getDynamicFormInput('database_name'),
  ).toBeVisible();
});

test('should open sqlalchemy form', async ({ page }) => {
  const connectDatabaseModal = new ConnectDatabaseModal(page);
  await connectDatabaseModal.selectFirstPreferredDatabase();
  await connectDatabaseModal.clickConnectWithSqlAlchemyUri();

  await expect(connectDatabaseModal.getDatabaseNameInput()).toBeVisible();
  await expect(connectDatabaseModal.getSqlAlchemyUriInput()).toBeVisible();
});

test('show error alerts on dynamic form for bad host', async ({ page }) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  const connectDatabaseModal = new ConnectDatabaseModal(page);
  await connectDatabaseModal.selectFirstPreferredDatabase();

  await connectDatabaseModal.getDynamicFormInput('host').fill('badhost');
  await connectDatabaseModal.getDynamicFormInput('port').fill('5432');
  await connectDatabaseModal
    .getDynamicFormInput('username')
    .fill('testusername');
  await connectDatabaseModal.getDynamicFormInput('database').fill('testdb');
  await connectDatabaseModal.getDynamicFormInput('password').fill('testpass');

  // Blur the active input so validate_parameters fires.
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await waitForPost(page, VALIDATE_PARAMETERS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  const submitButton = connectDatabaseModal.getSubmitConnectionButton();
  await expect(submitButton).toBeEnabled();

  // Submit fires another validate_parameters call followed by the create
  // request, which is the call that surfaces the host-resolution error.
  const createDatabaseResponse = waitForPost(page, CREATE_DATABASE_PATH, {
    pathMatch: true,
    timeout: TIMEOUT.SLOW_TEST,
  });
  await submitButton.click({ force: true });
  await createDatabaseResponse;

  await expect(
    connectDatabaseModal.getFormError(
      "The hostname provided can't be resolved",
    ),
  ).toBeVisible();
});

test('show error alerts on dynamic form for bad port', async ({ page }) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  const connectDatabaseModal = new ConnectDatabaseModal(page);
  await connectDatabaseModal.selectFirstPreferredDatabase();

  await connectDatabaseModal.getDynamicFormInput('host').fill('localhost');
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await waitForPost(page, VALIDATE_PARAMETERS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  await connectDatabaseModal.getDynamicFormInput('port').fill('5430');
  await connectDatabaseModal.getDynamicFormInput('database').fill('testdb');
  await connectDatabaseModal
    .getDynamicFormInput('username')
    .fill('testusername');
  await waitForPost(page, VALIDATE_PARAMETERS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  await connectDatabaseModal.getDynamicFormInput('password').fill('testpass');
  await waitForPost(page, VALIDATE_PARAMETERS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  const submitButton = connectDatabaseModal.getSubmitConnectionButton();
  await expect(submitButton).toBeEnabled();

  await submitButton.click({ force: true });
  await waitForPost(page, VALIDATE_PARAMETERS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  // The first submit only triggers re-validation; click again to fire the
  // create request that ultimately surfaces the closed-port error.
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  const createDatabaseResponse = waitForPost(page, CREATE_DATABASE_PATH, {
    pathMatch: true,
    timeout: TIMEOUT.SLOW_TEST,
  });
  await submitButton.click({ force: true });
  await createDatabaseResponse;

  await expect(
    connectDatabaseModal.getFormError('The port is closed'),
  ).toBeVisible();
});
