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

import { Page, Locator, Response } from '@playwright/test';
import { TIMEOUT } from '../utils/constants';
import { apiPost } from '../helpers/api/requests';
import { getChartByName } from '../helpers/api/chart';

/**
 * Form data payload for visiting the explore page with custom params.
 * `datasource` is in the format `<id>__<type>` (e.g. `2__table`).
 */
export interface ExploreFormData {
  datasource?: string;
  datasource_id?: number;
  datasource_type?: string;
  viz_type?: string;
  [key: string]: unknown;
}

/**
 * Explore Page object
 */
export class ExplorePage {
  private readonly page: Page;

  private static readonly SELECTORS = {
    DATASOURCE_CONTROL: '[data-test="datasource-control"]',
    VIZ_SWITCHER: '[data-test="fast-viz-switcher"]',
    SLICE_CONTAINER: '.slice_container',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for the Explore page to load.
   * Validates URL contains /explore/ and datasource control is visible.
   *
   * @param options - Optional wait options
   */
  async waitForPageLoad(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? TIMEOUT.PAGE_LOAD;

    await this.page.waitForURL('**/explore/**', { timeout });

    await this.page.waitForSelector(ExplorePage.SELECTORS.DATASOURCE_CONTROL, {
      state: 'visible',
      timeout,
    });
  }

  /**
   * Gets the datasource control locator.
   * Returns a Locator that tests can use with expect() or to read text.
   *
   * @returns Locator for the datasource control
   *
   * @example
   * const name = await explorePage.getDatasourceControl().textContent();
   */
  getDatasourceControl(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.DATASOURCE_CONTROL);
  }

  /**
   * Gets the currently selected dataset name from the datasource control
   */
  async getDatasetName(): Promise<string> {
    const text = await this.getDatasourceControl().textContent();
    return text?.trim() || '';
  }

  /**
   * Gets the visualization switcher locator.
   * Returns a Locator that tests can use with expect().toBeVisible(), etc.
   *
   * @returns Locator for the viz switcher
   *
   * @example
   * await expect(explorePage.getVizSwitcher()).toBeVisible();
   */
  getVizSwitcher(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.VIZ_SWITCHER);
  }

  /**
   * Gets the slice container locator.
   * Wait for this to be visible after a chart data request to confirm
   * the chart has rendered.
   */
  getSliceContainer(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.SLICE_CONTAINER);
  }

  /**
   * Returns a promise that resolves on the next non-legacy chart data POST
   * response (`/api/v1/chart/data`). Set this up before triggering navigation
   * or chart re-render.
   */
  waitForChartDataResponse(): Promise<Response> {
    return this.page.waitForResponse(
      response =>
        response.url().includes('/api/v1/chart/data') &&
        response.request().method() === 'POST',
      { timeout: TIMEOUT.API_RESPONSE },
    );
  }

  /**
   * Waits for a chart to finish loading: the slice container becomes visible
   * after the chart data response resolves.
   *
   * Some chart-data POSTs return non-OK statuses while the chart still mounts
   * (e.g. transient cache misses). We only require the response to resolve
   * before checking the slice container — visibility check covers the success
   * case.
   */
  async waitForChartLoad(chartDataResponse: Promise<Response>): Promise<void> {
    await chartDataResponse;
    await this.getSliceContainer().waitFor({
      state: 'visible',
      timeout: TIMEOUT.CHART_LOAD,
    });
  }

  /**
   * Looks up a chart by name and navigates to the Explore page for it.
   * Mirrors the Cypress `visitChartByName` command.
   *
   * @param name - The slice_name of the chart to visit
   */
  async visitChartByName(name: string): Promise<void> {
    const chart = await getChartByName(this.page, name);
    if (!chart) {
      throw new Error(
        `Chart "${name}" not found — run Superset with --load-examples`,
      );
    }
    await this.page.goto(
      `/explore/?form_data=${encodeURIComponent(
        JSON.stringify({ slice_id: chart.id }),
      )}`,
    );
    await this.waitForPageLoad();
  }

  /**
   * Posts the given form data to the explore form_data endpoint and visits
   * the resulting URL. Mirrors the Cypress `visitChartByParams` command.
   *
   * @param formData - The chart form data to submit
   */
  async visitChartByParams(formData: ExploreFormData): Promise<void> {
    let datasourceId: number | string | undefined;
    let datasourceType: string | undefined;
    if (formData.datasource_id && formData.datasource_type) {
      datasourceId = formData.datasource_id;
      datasourceType = formData.datasource_type;
    } else if (typeof formData.datasource === 'string') {
      const [idPart, typePart] = formData.datasource.split('__');
      datasourceId = idPart;
      datasourceType = typePart;
    }

    const response = await apiPost(this.page, 'api/v1/explore/form_data', {
      datasource_id:
        typeof datasourceId === 'string' ? Number(datasourceId) : datasourceId,
      datasource_type: datasourceType,
      form_data: JSON.stringify(formData),
    });
    const body = await response.json();
    const formDataKey = body.key;
    await this.page.goto(`/explore/?form_data_key=${formDataKey}`);
    await this.waitForPageLoad();
  }
}
