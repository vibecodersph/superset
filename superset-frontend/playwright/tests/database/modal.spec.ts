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
 * Each test opens the connect-database modal from the database list page and
 * exercises the dynamic-form / SQLAlchemy-form code paths. The bad-host /
 * bad-port tests rely on the backend `validate_parameters` and `database`
 * create endpoints to surface error messages, so they bump the test timeout
 * via `TIMEOUT.SLOW_TEST`.
 */

const VALIDATE_PARAMETERS_URL = '/api/v1/database/validate_parameters';
const CREATE_DATABASE_URL = /\/api\/v1\/database\/?$/;

const DYNAMIC_FORM_FIELDS = [
  'host',
  'port',
  'database',
  'username',
  'password',
] as const;

let databaseListPage: DatabaseListPage;
let connectDatabaseModal: ConnectDatabaseModal;

test.beforeEach(async ({ page }) => {
  databaseListPage = new DatabaseListPage(page);
  connectDatabaseModal = new ConnectDatabaseModal(page);

  await databaseListPage.goto();
  await databaseListPage.clickAddDatabase();
  await connectDatabaseModal.waitForReady();
});

test('should open the dynamic database connection form with empty fields', async () => {
  await connectDatabaseModal.selectFirstPreferredDatabase();

  // Connection-detail fields start empty before any user input.
  for (const fieldName of DYNAMIC_FORM_FIELDS) {
    await expect(
      connectDatabaseModal.getDynamicFormInput(fieldName).element,
    ).toHaveValue('');
  }

  // The display-name input is pre-populated with the engine name (e.g.
  // "PostgreSQL") by `setDatabaseModel` in the modal source, so we only
  // assert that it is rendered rather than asserting an empty value.
  await expect(
    connectDatabaseModal.getDynamicFormInput('database_name').element,
  ).toBeVisible();
});

test('should open the SQLAlchemy URI form with the URI inputs visible', async () => {
  await connectDatabaseModal.selectFirstPreferredDatabase();
  await connectDatabaseModal.clickConnectWithSqlAlchemyUri();

  await expect(connectDatabaseModal.getDatabaseNameInput()).toBeVisible();
  await expect(connectDatabaseModal.getSqlAlchemyUriInput()).toBeVisible();
});

test('should show an error on the dynamic form for a bad host', async ({
  page,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  await connectDatabaseModal.selectFirstPreferredDatabase();

  // Fill out the dynamic form with a host that will fail DNS resolution.
  await connectDatabaseModal.getDynamicFormInput('host').fill('badhost');
  await connectDatabaseModal.getDynamicFormInput('port').fill('5432');
  await connectDatabaseModal
    .getDynamicFormInput('username')
    .fill('testusername');
  await connectDatabaseModal.getDynamicFormInput('database').fill('testdb');
  await connectDatabaseModal.getDynamicFormInput('password').fill('testpass');

  // Click outside the form to trigger the on-blur validate_parameters call.
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  const submitButton = connectDatabaseModal.getSubmitButton();
  await expect(submitButton.element).toBeEnabled();

  // Submitting drives the create-database request which returns the
  // hostname-resolution error inside an `.ant-form-item-explain-error`.
  const createDatabaseResponse = waitForPost(page, CREATE_DATABASE_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  await submitButton.click({ force: true });
  await createDatabaseResponse;

  await expect(
    connectDatabaseModal.getFormItemError(
      "The hostname provided can't be resolved",
    ),
  ).toBeVisible();
});

test('should show an error on the dynamic form for a closed port', async ({
  page,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  await connectDatabaseModal.selectFirstPreferredDatabase();

  // localhost resolves but port 5430 is closed in CI, exercising the
  // "port closed" branch of the validator.
  await connectDatabaseModal.getDynamicFormInput('host').fill('localhost');
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  await connectDatabaseModal.getDynamicFormInput('port').fill('5430');
  await connectDatabaseModal.getDynamicFormInput('database').fill('testdb');
  await connectDatabaseModal
    .getDynamicFormInput('username')
    .fill('testusername');
  await waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  await connectDatabaseModal.getDynamicFormInput('password').fill('testpass');
  await waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  const submitButton = connectDatabaseModal.getSubmitButton();
  await expect(submitButton.element).toBeEnabled();

  await submitButton.click({ force: true });
  await waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });

  // Cypress test re-clicks the submit after blurring; mirror that to drive
  // the create-database request which returns the port-closed error.
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  const createDatabaseResponse = waitForPost(page, CREATE_DATABASE_URL, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  await submitButton.click({ force: true });
  await createDatabaseResponse;

  await expect(
    connectDatabaseModal.getFormItemError('The port is closed'),
  ).toBeVisible();
});
