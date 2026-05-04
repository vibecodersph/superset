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

import { Page, Locator } from '@playwright/test';
import { TIMEOUT } from '../utils/constants';

/**
 * Explore Page object
 */
export class ExplorePage {
  private readonly page: Page;

  private static readonly SELECTORS = {
    DATASOURCE_CONTROL: '[data-test="datasource-control"]',
    VIZ_SWITCHER: '[data-test="fast-viz-switcher"]',
    SLICE_CONTAINER: '[data-test="slice-container"]',
    LOADING_INDICATOR: '[data-test="loading-indicator"]',
    RUN_QUERY_BUTTON: '[data-test="run-query-button"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the explore page for a given chart by slice id.
   * Mirrors the Cypress `visitChartByName` helper which builds an
   * `/explore/?form_data={"slice_id": ID}` URL.
   *
   * @param sliceId - The chart's slice id
   */
  async gotoBySliceId(sliceId: number): Promise<void> {
    const formData = encodeURIComponent(`{"slice_id": ${sliceId}}`);
    await this.page.goto(`explore/?form_data=${formData}`);
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
   * Waits for the chart to render in the slice container.
   * The slice container is visible once the chart-data response is processed,
   * and the chart finishes rendering when the inline loading indicator clears.
   *
   * @param options - Optional wait options
   */
  async waitForSliceLoaded(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? TIMEOUT.API_RESPONSE;
    const sliceContainer = this.page.locator(
      ExplorePage.SELECTORS.SLICE_CONTAINER,
    );
    await sliceContainer.waitFor({ state: 'visible', timeout });
    await sliceContainer
      .locator(ExplorePage.SELECTORS.LOADING_INDICATOR)
      .waitFor({ state: 'hidden', timeout });
  }

  /**
   * Gets the slice container locator (the rendered chart wrapper).
   */
  getSliceContainer(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.SLICE_CONTAINER);
  }

  /**
   * Gets the run query button locator.
   */
  getRunQueryButton(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.RUN_QUERY_BUTTON);
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
}
