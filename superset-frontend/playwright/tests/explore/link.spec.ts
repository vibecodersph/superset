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

import type { Page, Locator } from '@playwright/test';
import { testWithAssets, expect } from '../../helpers/fixtures';
import { ExplorePage } from '../../pages/ExplorePage';
import { countChartsByName, getChartByName } from '../../helpers/api/chart';
import {
  countDashboardsByName,
  getDashboardByName,
} from '../../helpers/api/dashboard';

/**
 * Selects a dashboard in the SaveModal CreatableSelect by typing the title and
 * clicking the matching option. Works for both existing dashboards (filtered
 * results) and new dashboards (the "create new" option that the AsyncSelect
 * renders when `allowNewOptions` is enabled).
 */
async function selectDashboardOption(
  page: Page,
  dashboardForm: Locator,
  optionText: string,
): Promise<void> {
  const combobox = dashboardForm.getByRole('combobox', {
    name: 'Select a dashboard',
  });
  await combobox.click();
  await combobox.fill(optionText);

  const dashboardOption = page
    .locator('.ant-select-item-option', { hasText: optionText })
    .first();
  await dashboardOption.waitFor({ state: 'visible', timeout: 10_000 });
  await dashboardOption.click();
}

const test = testWithAssets.extend<{ explorePage: ExplorePage }>({
  explorePage: async ({ page }, use) => {
    await use(new ExplorePage(page));
  },
});

test('should open and close view query modal', async ({
  page,
  explorePage,
}) => {
  const chartLoad = explorePage.waitForChartDataResponse();
  await explorePage.visitChartByName('Growth Rate');
  await explorePage.waitForChartLoad(chartLoad);

  await page.getByLabel('Menu actions trigger').click();
  await page.getByTestId('view-query-menu-item').click();

  // Modal renders the SQL inside <code> blocks
  const modal = page.locator('.ant-modal-content', {
    has: page.getByText('View query', { exact: true }),
  });
  await expect(modal).toBeVisible();
  await expect(modal.locator('code').first()).toBeVisible();

  await modal.locator('button.ant-modal-close').first().click();
  await expect(modal).toBeHidden();
});

test('should show iframe link in embed code modal', async ({
  page,
  explorePage,
}) => {
  const chartLoad = explorePage.waitForChartDataResponse();
  await explorePage.visitChartByName('Growth Rate');
  await explorePage.waitForChartLoad(chartLoad);

  await page.getByLabel('Menu actions trigger').click();
  await page.getByRole('menuitem', { name: 'Share' }).click();
  await page.getByTestId('embed-code-button').click();

  const popover = page.getByTestId('embed-code-popover');
  await expect(popover).toBeVisible();
  await expect(popover.locator('textarea[name="embedCode"]')).toContainText(
    'iframe',
  );
});

test('should save a chart as new and overwrite it', async ({
  page,
  explorePage,
  testAssets,
}, testInfo) => {
  const newChartName = `Test chart [${Date.now()}_${testInfo.parallelIndex}]`;

  // Source from an existing example chart so the chart-data fetch is reliable
  // across CI environments. The test exercises Save-As + Overwrite, not the
  // chart-builder form-data path.
  let chartLoad = explorePage.waitForChartDataResponse();
  await explorePage.visitChartByName('Growth Rate');
  await explorePage.waitForChartLoad(chartLoad);

  // Save as new chart
  await page.getByTestId('query-save-button').click();
  await page.getByTestId('saveas-radio').check();
  await page.getByTestId('new-chart-name').fill(newChartName);

  chartLoad = explorePage.waitForChartDataResponse();
  await page.getByTestId('btn-modal-save').click();
  await explorePage.waitForChartLoad(chartLoad);

  // Track for cleanup as soon as the chart exists
  const created = await getChartByName(page, newChartName);
  expect(created).not.toBeNull();
  testAssets.trackChart(created!.id);

  // Re-open the saved chart and overwrite it
  chartLoad = explorePage.waitForChartDataResponse();
  await explorePage.visitChartByName(newChartName);
  await explorePage.waitForChartLoad(chartLoad);

  await page.getByTestId('query-save-button').click();
  await page.getByTestId('save-overwrite-radio').check();

  chartLoad = explorePage.waitForChartDataResponse();
  await page.getByTestId('btn-modal-save').click();
  await explorePage.waitForChartLoad(chartLoad);

  // Backend verification: exactly one chart with this name exists
  expect(await countChartsByName(page, newChartName)).toBe(1);
});

test('should save a chart as new and add to a new dashboard', async ({
  page,
  explorePage,
  testAssets,
}, testInfo) => {
  test.setTimeout(60_000);

  const chartName = 'Growth Rate';
  const suffix = `${Date.now()}_${testInfo.parallelIndex}`;
  const newChartName = `${chartName} [${suffix}]`;
  const dashboardTitle = `Test dashboard [${suffix}]`;

  let chartLoad = explorePage.waitForChartDataResponse();
  await explorePage.visitChartByName(chartName);
  await explorePage.waitForChartLoad(chartLoad);

  // Save as new chart and create a new dashboard via the CreatableSelect
  await page.getByTestId('query-save-button').click();
  await page.getByTestId('saveas-radio').check();
  await page.getByTestId('new-chart-name').click();
  await page.getByTestId('new-chart-name').fill(newChartName);

  const dashboardForm = page.getByTestId(
    'save-chart-modal-select-dashboard-form',
  );
  // CreatableSelect renders a "new option" matching the typed text;
  // selectDashboardOption handles both existing and new options uniformly.
  await selectDashboardOption(page, dashboardForm, dashboardTitle);

  chartLoad = explorePage.waitForChartDataResponse();
  await page.getByTestId('btn-modal-save').click();
  await explorePage.waitForChartLoad(chartLoad);

  // Track new chart and dashboard for cleanup
  const createdChart = await getChartByName(page, newChartName);
  expect(createdChart).not.toBeNull();
  testAssets.trackChart(createdChart!.id);

  const createdDashboard = await getDashboardByName(page, dashboardTitle);
  expect(createdDashboard).not.toBeNull();
  testAssets.trackDashboard(createdDashboard!.id);

  expect(await countDashboardsByName(page, dashboardTitle)).toBe(1);

  // Reopen the new chart and overwrite onto the same dashboard
  chartLoad = explorePage.waitForChartDataResponse();
  await explorePage.visitChartByName(newChartName);
  await explorePage.waitForChartLoad(chartLoad);

  await page.getByTestId('query-save-button').click();
  await page.getByTestId('save-overwrite-radio').check();
  await page.getByTestId('new-chart-name').click();
  await page.getByTestId('new-chart-name').fill(newChartName);

  // Typing the same dashboard name again should match the existing dashboard
  // we just created, not create another new option.
  await selectDashboardOption(page, dashboardForm, dashboardTitle);

  chartLoad = explorePage.waitForChartDataResponse();
  await page.getByTestId('btn-modal-save').click();
  await explorePage.waitForChartLoad(chartLoad);

  // Backend verification: only one chart and one dashboard with these names
  expect(await countChartsByName(page, chartName)).toBe(1);
  expect(await countDashboardsByName(page, dashboardTitle)).toBe(1);
});
