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
import { waitForPost } from '../../helpers/api/intercepts';
import { TIMEOUT } from '../../utils/constants';
import { URL } from '../../utils/urls';

const VALIDATE_PARAMETERS_URL = '/api/v1/database/validate_parameters/';
const CREATE_DATABASE_URL = '/api/v1/database/';

const VALIDATE_TIMEOUT = 30000;
const CREATE_DB_TIMEOUT = 60000;

const MODAL_SELECTOR = '[data-test="database-modal"]';

test.beforeEach(async ({ page }) => {
  await page.goto(URL.DATABASE_LIST);

  // Close any leftover modal before opening a fresh one (mirrors Cypress setup)
  const modal = page.locator(MODAL_SELECTOR);
  if (await modal.isVisible().catch(() => false)) {
    await page.locator('[aria-label="Close"]').nth(1).click();
    await modal.waitFor({ state: 'hidden', timeout: TIMEOUT.UI_TRANSITION });
  }

  await page.locator('[data-test="btn-create-database"]').click();
  await modal.waitFor({ state: 'visible', timeout: TIMEOUT.FORM_LOAD });
});

test('add database modal should open the dynamic form', async ({ page }) => {
  const modal = page.locator(MODAL_SELECTOR);
  await modal.locator('.preferred > :nth-child(1)').click();

  await expect(modal.locator('input[name="host"]')).toHaveValue('');
  await expect(modal.locator('input[name="port"]')).toHaveValue('');
  await expect(modal.locator('input[name="database"]')).toHaveValue('');
  await expect(modal.locator('input[name="username"]')).toHaveValue('');
  await expect(modal.locator('input[name="password"]')).toHaveValue('');
  // database_name is auto-populated with the selected engine's display name.
  await expect(modal.locator('input[name="database_name"]')).not.toHaveValue(
    '',
  );
});

test('add database modal should open the sqlalchemy form', async ({ page }) => {
  const modal = page.locator(MODAL_SELECTOR);
  await modal.locator('.preferred > :nth-child(1)').click();
  await modal.locator('[data-test="sqla-connect-btn"]').click();

  await expect(
    modal.locator('[data-test="database-name-input"]'),
  ).toBeVisible();
  await expect(
    modal.locator('[data-test="sqlalchemy-uri-input"]'),
  ).toBeVisible();
});

test('add database modal should show error alerts on the dynamic form for a bad host', async ({
  page,
}) => {
  const modal = page.locator(MODAL_SELECTOR);
  await modal.locator('.preferred > :nth-child(1)').click();

  await modal.locator('input[name="host"]').fill('badhost');
  await modal.locator('input[name="port"]').fill('5432');
  await modal.locator('input[name="username"]').fill('testusername');
  await modal.locator('input[name="database"]').fill('testdb');
  await modal.locator('input[name="password"]').fill('testpass');

  // Blur to trigger validation, then wait for the validate_parameters call.
  const initialValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await initialValidate;

  const submitBtn = modal.locator('[data-test="btn-submit-connection"]');
  await expect(submitBtn).toBeEnabled();

  const submitValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  const createDb = waitForPost(page, CREATE_DATABASE_URL, {
    pathMatch: true,
    timeout: CREATE_DB_TIMEOUT,
  });
  await submitBtn.click({ force: true });
  await submitValidate;
  await createDb;

  await expect(
    modal.locator('.ant-form-item-explain-error', {
      hasText: "The hostname provided can't be resolved",
    }),
  ).toBeVisible();
});

test('add database modal should show error alerts on the dynamic form for a bad port', async ({
  page,
}) => {
  const modal = page.locator(MODAL_SELECTOR);
  await modal.locator('.preferred > :nth-child(1)').click();

  const hostBlurValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await modal.locator('input[name="host"]').fill('localhost');
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await hostBlurValidate;

  const fieldsValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await modal.locator('input[name="port"]').fill('5430');
  await modal.locator('input[name="database"]').fill('testdb');
  await modal.locator('input[name="username"]').fill('testusername');
  await fieldsValidate;

  const passwordValidate = waitForPost(page, VALIDATE_PARAMETERS_URL);
  await modal.locator('input[name="password"]').fill('testpass');
  await passwordValidate;

  const submitBtn = modal.locator('[data-test="btn-submit-connection"]');
  await expect(submitBtn).toBeEnabled();

  const firstSubmitValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await submitBtn.click({ force: true });
  await firstSubmitValidate;

  await page.locator('body').click({ position: { x: 0, y: 0 } });

  const createDb = waitForPost(page, CREATE_DATABASE_URL, {
    pathMatch: true,
    timeout: CREATE_DB_TIMEOUT,
  });
  await submitBtn.click({ force: true });
  await createDb;

  await expect(
    modal.locator('.ant-form-item-explain-error', {
      hasText: 'The port is closed',
    }),
  ).toBeVisible();
});
