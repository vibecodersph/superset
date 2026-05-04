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
import { ExplorePage } from '../../pages/ExplorePage';
import { getChartByName, ENDPOINTS } from '../../helpers/api/chart';
import { waitForPost } from '../../helpers/api/intercepts';
import { expectStatusOneOf } from '../../helpers/api/assertions';

test('should create a formula annotation y-axis goal line', async ({
  page,
}) => {
  // Look up the existing example chart by name (matches Cypress visitChartByName).
  // The original Cypress test used "Num Births Trend", which is no longer in the
  // YAML-driven example data; "Trends" is the equivalent echarts_timeseries_line
  // chart loaded by superset/examples/usa_births_names/charts/Trends.yaml.
  const chartName = 'Trends';
  const chart = await getChartByName(page, chartName);
  expect(chart, `Expected example chart "${chartName}" to exist`).not.toBe(
    null,
  );

  // Wait for the initial chart data load triggered by the explore page render
  const initialChartLoad = waitForPost(page, ENDPOINTS.CHART_DATA);

  // Relative path so baseURL's APP_PREFIX (e.g. /app/prefix/) is preserved.
  await page.goto(`explore/?form_data={"slice_id": ${chart!.id}}`);

  const explorePage = new ExplorePage(page);
  await explorePage.waitForPageLoad();

  expectStatusOneOf(await initialChartLoad, [200]);

  const layerLabel = 'Goal line';

  // Expand the "Annotations and layers" collapsible section
  await page
    .getByTestId('collapsible-control-panel-header')
    .filter({ hasText: 'Annotations and layers' })
    .click();

  // Open the "Add annotation layer" popover
  await page.getByTestId('annotation_layers').click();

  // Fill out the popover form and submit
  const popover = page.getByTestId('popover-content');
  await popover.getByLabel('Name', { exact: true }).fill(layerLabel);
  await popover.getByLabel('Formula', { exact: true }).fill('y=1400000');
  await popover.getByRole('button', { name: 'OK', exact: true }).click();

  // Run the query and verify a new chart data response succeeds
  const refreshedChartLoad = waitForPost(page, ENDPOINTS.CHART_DATA);
  await page.getByTestId('run-query-button').click();

  // Verify the new annotation layer is listed under the Annotations control
  await expect(
    page.getByTestId('annotation_layers').filter({ hasText: layerLabel }),
  ).toBeVisible();

  expectStatusOneOf(await refreshedChartLoad, [200]);
});
