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
import { URL } from '../../utils/urls';
import { waitForPost } from '../../helpers/api/intercepts';
import { TIMEOUT } from '../../utils/constants';

const VALIDATE_PARAMS_PATH = '/api/v1/database/validate_parameters/';
const DATABASE_PATH = '/api/v1/database/';

test.beforeEach(async ({ page }) => {
  await page.goto(URL.DATABASE_LIST);
  await page.getByTestId('btn-create-database').click();
  await expect(page.getByTestId('database-modal')).toBeVisible();
});

test('should open dynamic form', async ({ page }) => {
  await page.locator('.preferred-item').first().click();

  await expect(page.locator('input[name="host"]')).toHaveValue('');
  await expect(page.locator('input[name="port"]')).toHaveValue('');
  await expect(page.locator('input[name="database"]')).toHaveValue('');
  await expect(page.locator('input[name="username"]')).toHaveValue('');
  await expect(page.locator('input[name="password"]')).toHaveValue('');
  await expect(page.locator('input[name="database_name"]')).toHaveValue('');
});

test('should open sqlalchemy form', async ({ page }) => {
  await page.locator('.preferred-item').first().click();
  await page.getByTestId('sqla-connect-btn').click();

  await expect(page.getByTestId('database-name-input')).toBeVisible();
  await expect(page.getByTestId('sqlalchemy-uri-input')).toBeVisible();
});

test('show error alerts on dynamic form for bad host', async ({ page }) => {
  await page.locator('.preferred-item').first().click();

  await page.locator('input[name="host"]').fill('badhost');
  await page.locator('input[name="port"]').fill('5432');
  await page.locator('input[name="username"]').fill('testusername');
  await page.locator('input[name="database"]').fill('testdb');
  await page.locator('input[name="password"]').fill('testpass');

  // Blur the active field to trigger client validation
  const validateAfterBlur = waitForPost(page, VALIDATE_PARAMS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await validateAfterBlur;

  const submitBtn = page.getByTestId('btn-submit-connection');
  await expect(submitBtn).toBeEnabled();

  // Submitting triggers a final validate followed by the create call
  const validateOnSubmit = waitForPost(page, VALIDATE_PARAMS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  const createDb = waitForPost(page, DATABASE_PATH, {
    pathMatch: true,
    timeout: 60000,
  });
  await submitBtn.click({ force: true });
  await validateOnSubmit;
  await createDb;

  await expect(
    page
      .locator('.ant-form-item-explain-error')
      .filter({ hasText: "The hostname provided can't be resolved" }),
  ).toBeVisible();
});

test('show error alerts on dynamic form for bad port', async ({ page }) => {
  await page.locator('.preferred-item').first().click();

  await page.locator('input[name="host"]').fill('localhost');
  const validateAfterHost = waitForPost(page, VALIDATE_PARAMS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  await validateAfterHost;

  await page.locator('input[name="port"]').fill('5430');
  await page.locator('input[name="database"]').fill('testdb');
  await page.locator('input[name="username"]').fill('testusername');

  const validateAfterPortFields = waitForPost(page, VALIDATE_PARAMS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  await page.locator('input[name="password"]').fill('testpass');
  await validateAfterPortFields;

  const submitBtn = page.getByTestId('btn-submit-connection');
  await expect(submitBtn).toBeEnabled();

  const validateOnFirstSubmit = waitForPost(page, VALIDATE_PARAMS_PATH, {
    timeout: TIMEOUT.SLOW_TEST,
  });
  await submitBtn.click({ force: true });
  await validateOnFirstSubmit;

  // Re-trigger the create after validation completes
  await page.locator('body').click({ position: { x: 0, y: 0 } });
  const createDb = waitForPost(page, DATABASE_PATH, {
    pathMatch: true,
    timeout: 60000,
  });
  await submitBtn.click({ force: true });
  await createDb;

  await expect(
    page
      .locator('.ant-form-item-explain-error')
      .filter({ hasText: 'The port is closed' }),
  ).toBeVisible();
});
