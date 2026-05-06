<!--
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

# Devin Automation Candidates

This file ranks the migration categories from `summary.md` and
`playbook.md` by how amenable each one is to autonomous Devin work,
with concrete prompt-template requirements at the bottom.

The lists below are *representative* — full per-file inventories live in
the `playbook.md` per-category sections, and the exact reproduction
commands are inline there.

## Fully Automatable (Tier 1–2, clear patterns)

| File | Category | Why automatable |
|------|----------|-----------------|
| `superset-frontend/spec/fixtures/mockState.js` | Cat. 4: `.js` → `.ts` | Pure data fixture; sibling `.ts` fixtures already exist; `tsconfig.json` paths are stable. |
| `superset-frontend/spec/fixtures/mockChartQueries.js` | Cat. 4 | Same shape as above. |
| `superset-frontend/spec/fixtures/mockDashboardData.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockDashboardFilters.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockDashboardInfo.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockDashboardLayout.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockDashboardState.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockReportState.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockSliceEntities.js` | Cat. 4 | Same shape. |
| `superset-frontend/spec/fixtures/mockStore.js` | Cat. 4 | Imports redux store types; reuse existing `RootState`. |
| `superset-frontend/spec/__mocks__/mockExportObject.js` | Cat. 4 | 3-line file. |
| `superset-frontend/spec/__mocks__/mockExportString.js` | Cat. 4 | 3-line file. |
| `superset-frontend/packages/superset-ui-core/__mocks__/mockExportObject.js` | Cat. 4 | 3-line file. |
| `superset-frontend/packages/superset-ui-core/__mocks__/mockExportString.js` | Cat. 4 | 3-line file. |
| `superset-frontend/.storybook/preview.jsx` | Cat. 4 | Single `.jsx`; convert to `.tsx`. |
| `superset-frontend/src/components/Tag/index.tsx` | Cat. 5: direct `antd` import | ESLint rule names target path; the wrapper exists in `@superset-ui/core/components`. |
| `superset-frontend/src/components/Splitter/index.tsx` | Cat. 5 | Same. |
| `superset-frontend/src/components/Descriptions/index.tsx` | Cat. 5 | Same. |
| `superset-frontend/src/components/TimePicker/index.tsx` | Cat. 5 | Same. |
| `superset-frontend/src/components/Datasource/ChangeDatasourceModal/index.tsx` | Cat. 5 | Type-only `InputRef` import. |
| `superset-frontend/src/components/Chart/MenuItemWithTruncation.tsx` | Cat. 5 | Type-only `MenuItemProps` import. |
| `superset-frontend/src/components/Chart/DrillBy/DrillBySubmenu.tsx` | Cat. 5 | Type-only `InputRef` import. |
| `superset-frontend/src/hooks/useLocale.ts` | Cat. 5 | `Locale` from `antd/es/locale` → re-export from core wrapper. |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/Pagination.tsx` | Cat. 6: `@ant-design/icons` | Substitute icon name from existing `Icons` enum. |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/CustomHeader.tsx` | Cat. 6 | Same. |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/TimeComparisonVisibility.tsx` | Cat. 6 | Same. |
| `superset-frontend/plugins/plugin-chart-table/src/TableChart.tsx` | Cat. 6 | Same. |
| `superset-frontend/plugins/plugin-chart-pivot-table/src/PivotTableChart.tsx` | Cat. 6 | Same. |
| 463 `*.test.ts(x)` files with single-block `describe()` | Cat. 9: `describe()` → `test()` | Codemod-friendly. Devin can run a `jscodeshift` script and gate on no nested `describe`. |
| ~70 frontend files with stale `eslint-disable …no-explicit-any` | Cat. 3 | The rule is already off; the comment is a no-op. |

## Automatable with Human Review (Tier 2–3)

| File | Category | What needs human review |
|------|----------|------------------------|
| 193 `*.test.ts(x)` files with `: any` (861 occurrences) | Cat. 1 | Devin can replace `as any` with `as unknown as <type>` or `Partial<T>`; reviewer checks that the chosen type actually models the test fixture. |
| `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformers.test.ts` (31 `any`) | Cat. 1 | Confirm the cast targets in echarts `EChartsCoreOption` are correct. |
| `superset-frontend/plugins/plugin-chart-echarts/test/Heatmap/transformProps.test.ts` (27 `any`) | Cat. 1 | Same. |
| `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformProps.test.ts` (25 `any`) | Cat. 1 | Same. |
| `superset-frontend/src/utils/downloadAsImage.test.ts` (23 `any`) | Cat. 1 | Replace with `Partial<HTMLElement>` mocks. |
| `superset-frontend/src/dashboard/components/nativeFilters/selectors.test.ts` (21 `any`) | Cat. 1 | Reuse redux state types from `src/dashboard/types`. |
| `superset-frontend/src/explore/components/controls/MetricControl/MetricsControl.tsx` (22 `any`) | Cat. 1 | Production component — choose between `AdhocMetric` / `Column` / `SavedMetric` unions. |
| `superset-frontend/src/filters/components/Select/SelectFilterPlugin.test.tsx` (28 `@ts-ignore`) | Cat. 2 | Bulk-rewrite to `@ts-expect-error`; delete entries that no longer report errors. |
| `superset-frontend/packages/superset-ui-core/src/components/Table/sorters.test.ts` (13 `@ts-ignore`) | Cat. 2 | Same. |
| `superset/db_engine_specs/databricks.py` (10 `# type: ignore`) | Cat. 11 | Scope each ignore to a specific mypy code; some likely removable after stub upgrade. |
| `superset/core/api/core_api_injection.py` (22 `# type: ignore`) | Cat. 11 | Same. |
| `superset/mcp_service/dataset/schemas.py` (42 `getattr`) | Cat. 13 | Replace with typed projection helper or Pydantic `model_dump`. |
| `superset/mcp_service/dashboard/schemas.py` (37 `getattr`) | Cat. 13 | Same. |
| `superset/mcp_service/database/schemas.py` (21 `getattr`) | Cat. 13 | Same. |
| `superset/migrations/shared/migrate_viz/query_functions.py` (96 `Any`) | Cat. 12 | Codemod can replace `Any` with `Mapping[str, object]`; reviewer confirms call sites accept the narrower type. |
| `superset/utils/log.py` (33 `Any`) | Cat. 12 | Logging helpers; `object` or `Mapping[str, object]` is usually sufficient. |
| 89 `tests/.../test_*.py` `SupersetTestCase` subclasses | Cat. 14 | Devin can rewrite class-based tests to pytest functions with fixtures, but the existing helper coverage in `base_tests.py` must be preserved. |
| 21 files using `PropTypes` (217 occurrences) | Cat. 7 | Generate the equivalent TS interface; consumer files importing the old `propTypes` static must drop it. Concentrated in `legacy-preset-chart-nvd3` so impact is bounded. |
| 5 active Cypress tests | Cat. 10 | Devin can scaffold the Playwright spec by mirroring the Cypress structure; reviewer must validate selector parity. |

## Requires Human (Tier 4–5)

| File | Category | Why |
|------|----------|-----|
| `superset-frontend/src/dashboard/components/Dashboard.tsx` | Cat. 8: class → hooks | `PureComponent` with multi-effect `componentDidUpdate` and instance-field side effects. |
| `superset-frontend/src/dashboard/components/DashboardGrid.tsx` | Cat. 8 | Drag-and-drop redux integration; lifecycle ordering is brittle. |
| `superset-frontend/src/components/Chart/Chart.tsx` | Cat. 8 | Coupled to `ChartRenderer` lifecycle; rerender semantics matter for performance. |
| `superset-frontend/src/components/Chart/ChartRenderer.tsx` | Cat. 8 | Same — paired with `Chart`. |
| `superset-frontend/src/explore/components/controls/MetricControl/AdhocMetricEditPopover/index.tsx` | Cat. 8 | Multi-step form with internal state machine; refactor risk high. |
| `superset-frontend/src/explore/components/controls/FilterControl/AdhocFilterEditPopover/index.tsx` | Cat. 8 | Same shape. |
| `superset-frontend/src/SqlLab/components/TabbedSqlEditors/index.tsx` | Cat. 8 | Tab state + redux + URL sync; needs targeted refactor PR. |
| `superset-frontend/src/SqlLab/components/App/index.tsx` | Cat. 8 | Top-level SQL Lab app shell; cross-cutting. |
| `superset-frontend/packages/superset-ui-core/src/chart/components/SuperChart.tsx` | Cat. 8 | Library-level component; behavior change must not break consumers. |
| `superset-frontend/packages/superset-ui-core/src/chart/components/SuperChartCore.tsx` | Cat. 8 | Same. |
| `superset-frontend/packages/superset-ui-core/src/chart/components/reactify.tsx` | Cat. 8 | Higher-order component; type signature is contract-bearing. |
| `superset-frontend/cypress-base/cypress/e2e/dashboard/editmode.test.ts` | Cat. 10 | Multi-page dashboard edit flow; selector-by-selector design call. |
| `superset-frontend/cypress-base/cypress/e2e/dashboard/drilltodetail.test.ts` | Cat. 10 | Same. |
| `superset-frontend/cypress-base/cypress/e2e/explore/chart.test.js` | Cat. 10 | Long Cypress chain; manual port to Playwright. |
| `superset-frontend/cypress-base/cypress/e2e/database/modal.test.ts` | Cat. 10 | DB-connection wizard; manual port. |
| `superset/db_engine_specs/base.py` (59 `Any`) | Cat. 12 | Abstract base for every DB engine; type changes ripple to every subclass. |
| `superset/models/helpers.py` (50 `Any`) | Cat. 12 | Cross-cutting model mixins; mypy fallout is repo-wide. |
| `superset/viz.py` (49 `Any`) | Cat. 12 | Legacy viz layer; partial-deprecation context required. |
| `superset/utils/core.py` (33 `Any`) | Cat. 12 | Used everywhere; coordinated PR needed. |
| ~116 model files | Cat. 15: SQLAlchemy 2.0 `Mapped[...]` | Per-file design call on nullability and relationship typing; mypy regressions cascade. |
| `superset/models/core.py` | Cat. 15 | Holds `Database`, `Theme`, `CssTemplate` — touching any of these needs production rollout coordination. |
| `superset/reports/models.py` | Cat. 16: integer PK → UUID | Architectural; needs Alembic migration + breaking-change review. |
| `superset/key_value/models.py` | Cat. 16 | Public-API key-value cache; UUID change is a breaking migration. |
| `superset/connectors/sqla/models.py` | Cat. 16 | Core dataset model; UUID-first migration is multi-quarter work. |
| `superset/tags/models.py` | Cat. 16 | Tag system is referenced by many endpoints. |

## Prompt Template Requirements

For each automatable category below, the corresponding Devin session
needs the following inputs to run autonomously.

### Cat. 4 — `.js` / `.jsx` → `.ts` / `.tsx`

- **Source file content:** the `.js` to convert.
- **Target example:** an existing similar `.ts` fixture (e.g.
  `superset-frontend/spec/fixtures/mockChartQueries.js` paired with any
  already-typed sibling under `spec/fixtures/`).
- **Utility context:** `superset-frontend/tsconfig.json` paths,
  relevant `src/.../types.ts`, `superset-frontend/.eslintrc.js` overrides.
- **Validation:**
  - `git mv old.js new.ts` (preserves history).
  - `npx tsc --noEmit -p superset-frontend/tsconfig.json`.
  - `npm --prefix superset-frontend run test -- <changed-test>` if a
    test imports the file.
  - `pre-commit run --files <new file>` (prettier + eslint).

### Cat. 5 — direct `antd` imports → core wrappers

- **Source file content:** the `.tsx` with the offending import.
- **Target example:** any existing wrapper in
  `superset-frontend/packages/superset-ui-core/src/components/<X>/index.tsx`.
- **Utility context:** the ESLint rule message in `.eslintrc.js`
  line 65–69 and the `restrictedImportsRules['no-antd']` definition.
- **Validation:** `npx eslint <file>` must produce zero errors;
  `npm run test --prefix superset-frontend -- <related test>`.

### Cat. 6 — `@ant-design/icons` → `Icons` component

- **Source file content:** the file with the icon import.
- **Target example:** `superset-frontend/src/components/Icons/index.tsx`
  and the existing icon usage in any `src/components/*` consumer.
- **Validation:** ESLint clean; visual regression via Storybook or
  Playwright `docs-screenshots.spec.ts`.

### Cat. 9 — `describe()` → `test()`

- **Source file content:** the test file.
- **Target example:** any spec already authored without an outer
  `describe`.
- **Codemod:** `jscodeshift` transform that:
  1. flattens `describe('A', () => describe('B', () => test('C')))` to
     `test('A > B > C')`,
  2. inlines `beforeEach`/`afterEach` blocks into individual `test()`
     bodies (or rejects the file for human review),
  3. preserves `it` aliases.
- **Validation:** `npm test` for each touched file plus the CI Jest
  suite.

### Cat. 1 (test files only) — strip `any` from tests

- **Source file content:** the test file.
- **Target example:** any test file that already uses
  `as unknown as <T>` or `Partial<T>`.
- **Utility context:** the type definitions used by the file under
  test (e.g. for `dashboard/.../selectors.test.ts`, the redux state
  types in `src/dashboard/types`).
- **Validation:**
  - `npx tsc --noEmit -p superset-frontend/tsconfig.json`,
  - the specific Jest spec must still pass.

### Cat. 2 — `@ts-ignore` → `@ts-expect-error`

- **Source file content:** the file.
- **Codemod:** literal find/replace of `@ts-ignore` →
  `@ts-expect-error: <reason>` with a placeholder reason that requires
  reviewer clarification, then run TS — comments that no longer suppress
  anything will surface as `Unused @ts-expect-error directive` errors
  and can be deleted.
- **Validation:** `npx tsc --noEmit`.

### Cat. 11 — backend `# type: ignore` review

- **Source file content:** the `.py`.
- **Utility context:** the `mypy` config in `pyproject.toml`, the
  pre-commit `mypy` hook configuration in `.pre-commit-config.yaml`
  (additional dependencies + args).
- **Validation:** `pre-commit run mypy --files <file>`.

### Cat. 13 — `getattr` / `setattr` → typed access

- **Source file content:** the `.py`.
- **Target example:** any neighbouring file that has already migrated to
  `model.field` access on a typed Pydantic model.
- **Utility context:** the relevant Pydantic / SQLAlchemy model class
  definitions.
- **Validation:** `pre-commit run mypy --files <file>` and the existing
  test file (if any) under `tests/unit_tests/mcp_service/`.

### Cat. 14 — `SupersetTestCase` → pytest

- **Source file content:** the class-based test file.
- **Target example:** any function-based test under
  `tests/unit_tests/`.
- **Utility context:** `tests/integration_tests/base_tests.py`
  (`login_as_admin`, `create_dashboard`, etc.) so equivalent fixtures
  can be authored.
- **Validation:** `pytest <file>`; CI `superset-python-integrationtest.yml`.

### Cat. 7 — `PropTypes` → TS interfaces

- **Source file content:** the file with `PropTypes`.
- **Utility context:** any consumer importing the file's `propTypes`
  static (find with `rg "<ComponentName.*propTypes"`).
- **Validation:** `npx tsc --noEmit` and the relevant Jest specs.

### Cat. 10 — Cypress → Playwright (active tests only)

- **Source file content:** the Cypress `.test.ts(x)` file.
- **Target example:** the closest existing Playwright spec under
  `superset-frontend/playwright/tests/` (e.g. for `editmode.test.ts`,
  pair with `playwright/tests/dashboard/dashboard-list.spec.ts`).
- **Utility context:** `superset-frontend/playwright/global-setup.ts`,
  `superset-frontend/playwright/helpers/`, `playwright.config.ts`.
- **Validation:** `npm --prefix superset-frontend run playwright:test
  -- <new-spec>`; the corresponding Cypress file should be deleted in
  the same PR.
