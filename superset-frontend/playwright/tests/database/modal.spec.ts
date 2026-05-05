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

test.beforeEach(async ({ page }) => {
  await page.goto(URL.DATABASE_LIST);

  // Close any leftover modal before opening a fresh one (mirrors Cypress setup)
  const modal = page.locator('[data-test="database-modal"]');
  if (await modal.isVisible().catch(() => false)) {
    await page.locator('[aria-label="Close"]').nth(1).click();
    await modal.waitFor({ state: 'hidden', timeout: TIMEOUT.UI_TRANSITION });
  }

  await page.locator('[data-test="btn-create-database"]').click();
  await modal.waitFor({ state: 'visible', timeout: TIMEOUT.FORM_LOAD });
});

test('add database modal should open the dynamic form', async ({ page }) => {
  await page.locator('.preferred > :nth-child(1)').click();

  await expect(page.locator('input[name="host"]')).toHaveValue('');
  await expect(page.locator('input[name="port"]')).toHaveValue('');
  await expect(page.locator('input[name="database"]')).toHaveValue('');
  await expect(page.locator('input[name="username"]')).toHaveValue('');
  await expect(page.locator('input[name="password"]')).toHaveValue('');
  await expect(page.locator('input[name="database_name"]')).toHaveValue('');
});

test('add database modal should open the sqlalchemy form', async ({ page }) => {
  await page.locator('.preferred > :nth-child(1)').click();
  await page.locator('[data-test="sqla-connect-btn"]').click();

  await expect(page.locator('[data-test="database-name-input"]')).toBeVisible();
  await expect(
    page.locator('[data-test="sqlalchemy-uri-input"]'),
  ).toBeVisible();
});

test('add database modal should show error alerts on the dynamic form for a bad host', async ({
  page,
}) => {
  await page.locator('.preferred > :nth-child(1)').click();

  await page.locator('input[name="host"]').fill('badhost');
  await page.locator('input[name="port"]').fill('5432');
  await page.locator('input[name="username"]').fill('testusername');
  await page.locator('input[name="database"]').fill('testdb');
  await page.locator('input[name="password"]').fill('testpass');

  // Blur to trigger validation, then wait for the validate_parameters call.
  const initialValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await initialValidate;

  const submitBtn = page.locator('[data-test="btn-submit-connection"]');
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
    page.locator('.ant-form-item-explain-error', {
      hasText: "The hostname provided can't be resolved",
    }),
  ).toBeVisible();
});

test('add database modal should show error alerts on the dynamic form for a bad port', async ({
  page,
}) => {
  await page.locator('.preferred > :nth-child(1)').click();

  const hostBlurValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await page.locator('input[name="host"]').fill('localhost');
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await hostBlurValidate;

  const fieldsValidate = waitForPost(page, VALIDATE_PARAMETERS_URL, {
    timeout: VALIDATE_TIMEOUT,
  });
  await page.locator('input[name="port"]').fill('5430');
  await page.locator('input[name="database"]').fill('testdb');
  await page.locator('input[name="username"]').fill('testusername');
  await fieldsValidate;

  const passwordValidate = waitForPost(page, VALIDATE_PARAMETERS_URL);
  await page.locator('input[name="password"]').fill('testpass');
  await passwordValidate;

  const submitBtn = page.locator('[data-test="btn-submit-connection"]');
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
    page.locator('.ant-form-item-explain-error', {
      hasText: 'The port is closed',
    }),
  ).toBeVisible();
});
