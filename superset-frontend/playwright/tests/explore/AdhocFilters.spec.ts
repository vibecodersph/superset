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
import { ExplorePage } from '../../pages/ExplorePage';
import { AceEditor, Select } from '../../components/core';
import { getChartByName, ENDPOINTS } from '../../helpers/api/chart';
import { waitForGet, waitForPost } from '../../helpers/api/intercepts';
import { expectStatusOneOf } from '../../helpers/api/assertions';
import { TIMEOUT } from '../../utils/constants';

const CHART_NAME = 'Boys';
const POPOVER = '#filter-edit-popover';
const COLUMN_VALUES_PATTERN =
  /\/api\/v1\/datasource\/[^/]+\/[^/]+\/column\/[^/]+\/values\/?/;

/**
 * Extend testWithAssets with an explorePage fixture that opens the example
 * "Boys" chart by slice id (Cypress visitChartByName equivalent) and waits
 * for the chart to render and the adhoc filter control to be ready.
 */
const test = testWithAssets.extend<{ explorePage: ExplorePage }>({
  explorePage: async ({ page }, use) => {
    const chart = await getChartByName(page, CHART_NAME);
    if (!chart) {
      throw new Error(
        `Chart "${CHART_NAME}" not found. Ensure example data is loaded.`,
      );
    }

    const explorePage = new ExplorePage(page);
    await explorePage.gotoBySliceId(chart.id);
    await explorePage.waitForPageLoad({ timeout: TIMEOUT.SLOW_TEST });
    await explorePage.waitForSliceLoaded({ timeout: TIMEOUT.SLOW_TEST });

    // Wait for the adhoc filter control wrapper to mount; tests that
    // need the "Add filter" button itself wait for it explicitly.
    await page
      .locator('[data-test="adhoc-filter-control"]')
      .waitFor({ state: 'attached', timeout: TIMEOUT.SLOW_TEST });

    await use(explorePage);
  },
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const dataTestSummary = await page
      .evaluate(() => {
        const els = Array.from(
          document.querySelectorAll<HTMLElement>('[data-test]'),
        );
        return els
          .map(el => el.getAttribute('data-test'))
          .filter(
            (t): t is string =>
              !!t &&
              (t.includes('filter') ||
                t.includes('adhoc') ||
                t.includes('slice') ||
                t.includes('control')),
          )
          .slice(0, 50);
      })
      .catch(() => [] as string[]);
    await testInfo.attach('relevant-data-test-attrs.json', {
      body: JSON.stringify(dataTestSummary, null, 2),
      contentType: 'application/json',
    });
  }
});

test('should load AceEditor scripts only when needed', async ({
  page,
  explorePage,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  // Verify the chart loaded so the script count baseline is meaningful
  await expect(explorePage.getSliceContainer()).toBeVisible();

  const initialScriptCount = await page.locator('script').count();

  // Open the adhoc filter popover via the "Add filter" button
  const filterControl = page.locator('[data-test="adhoc-filter-control"]');
  await filterControl.scrollIntoViewIfNeeded();
  const addFilterButton = filterControl.getByTestId('add-filter-button');
  await addFilterButton.waitFor({
    state: 'visible',
    timeout: TIMEOUT.PAGE_LOAD,
  });
  await addFilterButton.click();
  const popover = page.locator(POPOVER);
  await expect(popover).toBeVisible();

  // Antd tabs are lazy-rendered, so switching to "Custom SQL" loads the
  // ace editor chunk on demand. Switch back to "Simple" to mirror the
  // original Cypress test.
  await popover
    .locator('.ant-tabs-tab')
    .filter({ hasText: 'Custom SQL' })
    .click();
  await expect(popover.locator('.ace_editor')).toBeVisible();
  await popover.locator('.ant-tabs-tab').filter({ hasText: 'Simple' }).click();

  await expect(async () => {
    const newScriptCount = await page.locator('script').count();
    expect(newScriptCount).toBeGreaterThan(initialScriptCount);
  }).toPass({ timeout: TIMEOUT.UI_TRANSITION });
});

test('should set a simple adhoc filter and run the query', async ({
  page,
  explorePage,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  // Open the adhoc filter popover
  const filterControl = page.locator('[data-test="adhoc-filter-control"]');
  await filterControl.scrollIntoViewIfNeeded();
  const addFilterButton = filterControl.getByTestId('add-filter-button');
  await addFilterButton.waitFor({
    state: 'visible',
    timeout: TIMEOUT.PAGE_LOAD,
  });
  await addFilterButton.click();
  const popover = page.locator(POPOVER);
  await expect(popover).toBeVisible();

  // Pick "name" as the filter subject
  const subjectSelect = Select.fromRole(page, 'Select subject');
  const filterValuesPromise = waitForGet(page, COLUMN_VALUES_PATTERN, {
    timeout: TIMEOUT.API_RESPONSE,
  });
  await subjectSelect.selectOption('name');
  expectStatusOneOf(await filterValuesPromise, [200]);

  // Type a custom value into the comparator (allowNewOptions allows free text)
  const comparatorSelect = Select.fromRole(page, 'Comparator option');
  await comparatorSelect.open();
  await comparatorSelect.type('Jack');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');

  // Save the filter and verify the popover closes
  await page.getByTestId('adhoc-filter-edit-popover-save-button').click();
  await expect(popover).toBeHidden();

  // Verify the new filter renders inside the adhoc filter control
  await expect(
    filterControl
      .getByTestId('option-label')
      .filter({ hasText: /name\s*=\s*'?Jack'?/ }),
  ).toBeVisible();

  // Run the query and verify the chart re-renders successfully
  const runQueryResponsePromise = waitForPost(page, ENDPOINTS.CHART_DATA, {
    timeout: TIMEOUT.API_RESPONSE,
  });
  await explorePage.getRunQueryButton().click();
  expectStatusOneOf(await runQueryResponsePromise, [200]);
  await explorePage.waitForSliceLoaded();
  await expect(explorePage.getSliceContainer()).toBeVisible();
});

test('should set a custom SQL adhoc filter and run the query', async ({
  page,
  explorePage,
}) => {
  test.setTimeout(TIMEOUT.SLOW_TEST);

  const filterSubject = 'name';
  const filterSql = "name = 'Amy' OR name = 'Donald'";

  // Open the adhoc filter popover
  const filterControl = page.locator('[data-test="adhoc-filter-control"]');
  await filterControl.scrollIntoViewIfNeeded();
  const addFilterButton = filterControl.getByTestId('add-filter-button');
  await addFilterButton.waitFor({
    state: 'visible',
    timeout: TIMEOUT.PAGE_LOAD,
  });
  await addFilterButton.click();
  const popover = page.locator(POPOVER);
  await expect(popover).toBeVisible();

  // Pick "name" as the filter subject; this triggers the suggestion fetch
  const subjectSelect = Select.fromRole(page, 'Select subject');
  const filterValuesPromise = waitForGet(page, COLUMN_VALUES_PATTERN, {
    timeout: TIMEOUT.API_RESPONSE,
  });
  await subjectSelect.selectOption(filterSubject);
  expectStatusOneOf(await filterValuesPromise, [200]);

  // Switch to the Custom SQL tab and write the SQL expression
  await popover.locator('#adhoc-filter-edit-tabs-tab-SQL').click();
  const sqlEditor = new AceEditor(page, popover.locator('.ace_editor'));
  await sqlEditor.waitForReady();
  await sqlEditor.setText(filterSql);

  // Save the filter and verify the popover closes
  await page.getByTestId('adhoc-filter-edit-popover-save-button').click();
  await expect(popover).toBeHidden();

  // Verify the SQL filter label appears on the adhoc filter control
  await expect(
    filterControl.getByTestId('option-label').filter({ hasText: filterSql }),
  ).toBeVisible();

  // Run the query and verify the chart re-renders successfully
  const runQueryResponsePromise = waitForPost(page, ENDPOINTS.CHART_DATA, {
    timeout: TIMEOUT.API_RESPONSE,
  });
  await explorePage.getRunQueryButton().click();
  expectStatusOneOf(await runQueryResponsePromise, [200]);
  await explorePage.waitForSliceLoaded();
  await expect(explorePage.getSliceContainer()).toBeVisible();
});
