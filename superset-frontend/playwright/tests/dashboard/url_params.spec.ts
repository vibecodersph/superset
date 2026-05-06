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

import { test, expect, Request } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { TIMEOUT } from '../../utils/constants';

/**
 * Dashboard URL params E2E test.
 *
 * Verifies that query string parameters on the dashboard URL are forwarded
 * as `url_params` to the chart-data API and the legacy explore_json
 * endpoint when each chart on the World Health dashboard loads.
 */

interface ChartSpec {
  name: string;
  viz: string;
}

const WORLD_HEALTH_CHARTS: readonly ChartSpec[] = [
  { name: '% Rural', viz: 'world_map' },
  { name: 'Most Populated Countries', viz: 'table' },
  { name: "World's Population", viz: 'big_number' },
  { name: 'Growth Rate', viz: 'echarts_timeseries_line' },
  { name: 'Rural Breakdown', viz: 'sunburst_v2' },
  { name: "World's Pop Growth", viz: 'echarts_area' },
  { name: 'Life Expectancy VS Rural %', viz: 'bubble_v2' },
  { name: 'Treemap', viz: 'treemap_v2' },
  { name: 'Box plot', viz: 'box_plot' },
];

const urlParams = { param1: '123', param2: 'abc' } as const;

/**
 * Extract a named field from a multipart/form-data POST body. Mirrors the
 * Cypress `parsePostForm` helper, which decodes Superset's legacy
 * `/superset/explore_json/` payloads.
 */
function getMultipartField(body: string | null, name: string): string | null {
  if (!body) return null;
  const pattern = new RegExp(
    `Content-Disposition: form-data; name="${name}"\\r?\\n\\r?\\n([\\s\\S]*?)\\r?\\n--`,
  );
  const match = body.match(pattern);
  return match ? match[1] : null;
}

test('should apply url params to slice requests', async ({ page }) => {
  // World Health renders nine charts; allow extra time for cold-cache CI runs.
  test.setTimeout(TIMEOUT.SLOW_TEST);

  // Listeners must be attached before navigation so requests fired during
  // the initial dashboard load are captured.
  const chartDataRequests: Request[] = [];
  const exploreJsonRequests: Request[] = [];

  page.on('request', request => {
    if (request.method() !== 'POST') return;
    const url = request.url();
    if (url.includes('/api/v1/chart/data')) {
      chartDataRequests.push(request);
    } else if (url.includes('/superset/explore_json/')) {
      exploreJsonRequests.push(request);
    }
  });

  const dashboardPage = new DashboardPage(page);
  const queryString = new URLSearchParams(urlParams).toString();
  await page.goto(`superset/dashboard/world_health/?${queryString}`);
  await dashboardPage.waitForLoad();

  // Equivalent to the Cypress `waitForChartLoad` for each chart spec:
  // verify the chart grid component renders with the expected viz type
  // and the inner `#chart-id-<id>` becomes visible (rendered).
  for (const chart of WORLD_HEALTH_CHARTS) {
    const gridChart = page
      .locator(`[data-test-chart-name="${chart.name}"]`)
      .first();
    await expect(gridChart).toHaveAttribute('data-test-viz-type', chart.viz);
    const chartId = await gridChart.getAttribute('data-test-chart-id');
    expect(chartId).toBeTruthy();
    await expect(page.locator(`#chart-id-${chartId}`)).toBeVisible({
      timeout: TIMEOUT.SLOW_TEST,
    });
  }

  await dashboardPage.waitForChartsToLoad();

  // Modern viz types hit `/api/v1/chart/data` with a JSON body. Each query
  // should carry the navigated url_params.
  expect(chartDataRequests.length).toBeGreaterThan(0);
  for (const request of chartDataRequests) {
    const body = request.postDataJSON() as {
      queries?: { url_params?: Record<string, string> }[];
    } | null;
    const queries = body?.queries ?? [];
    for (const query of queries) {
      expect(query.url_params).toEqual(urlParams);
    }
  }

  // Legacy `/superset/explore_json/` is multipart-encoded with a `form_data`
  // field that holds the JSON params. Modern viz types may not hit it, but
  // any request that does fire should also carry the url_params.
  for (const request of exploreJsonRequests) {
    const formDataField = getMultipartField(request.postData(), 'form_data');
    if (!formDataField) continue;
    const formData = JSON.parse(formDataField) as {
      url_params?: Record<string, string>;
    };
    expect(formData.url_params).toEqual(urlParams);
  }
});
