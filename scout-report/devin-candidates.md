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

This document classifies the migration files identified in
`playbook.md` by **automation tier**:

- **Fully Automatable** — Devin runs the prompt, runs the gate command
  (lint/type/test), and the PR is mergeable without per-file review of
  Devin's output.
- **Automatable with Human Review** — Devin produces the PR, but a
  reviewer must spot-check decisions (e.g. introduced generics, mock
  helper choices).
- **Requires Human** — Devin can pair-program but the architecture
  decisions belong to a human.

> File counts are exact (from `grep`/`find` runs in Phase 1); see
> `summary.md` for the discovery commands.

---

## Fully Automatable (Tier 1–2, clear patterns)

### Wave 1.1 + 1.2 — PEP 604 / 585 typing modernization

| File scope | Category | Why automatable |
|------------|----------|-----------------|
| `superset/**/*.py` (excluding `superset/migrations/versions/*`) | `Optional[X]` → `X \| None` and `List/Dict/Tuple/Type` → builtin generics | Mechanical rewrite, ruff `UP006`/`UP007` `--fix` is deterministic. Single PR. |

**Single command:**
```bash
ruff check --select UP006,UP007 --fix --target-version=py310 \
  --extend-exclude='superset/migrations/versions/*' superset/
```

### Wave 1.3 — `React.FC` removal

138 files. All use the same source pattern. A `ts-morph` codemod or
Devin per-package job applies the same transformation.

| Path | File count |
|------|-----------|
| `superset-frontend/src/**/*.tsx` | ~80 |
| `superset-frontend/packages/**/*.tsx` | ~25 |
| `superset-frontend/plugins/**/*.tsx` | ~33 |

### Wave 1.4 — Direct `antd` → `@superset-ui/core/components`

7 files outside `packages/superset-core` (the wrapper layer):

| File | Notes |
|------|-------|
| `superset-frontend/src/components/Tag/index.tsx` | |
| `superset-frontend/src/components/Chart/DrillBy/DrillBySubmenu.tsx` | |
| `superset-frontend/src/components/Chart/MenuItemWithTruncation.tsx` | |
| `superset-frontend/src/components/Datasource/ChangeDatasourceModal/index.tsx` | |
| `superset-frontend/src/theme/utils/antdTokenNames.ts` | Confirm the wrapper re-exports the antd theme token *types* before this PR |
| `superset-frontend/src/theme/tests/ThemeController.test.ts` | |
| `superset-frontend/src/hooks/useLocale.ts` | Confirm `ConfigProvider` is re-exported |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/TimeComparisonVisibility.tsx` | |

(The 9 files inside `superset-frontend/packages/superset-core/` are the
wrapper itself and are intentionally allowed to import from `antd`.)

### Wave 1.5 — Direct `@ant-design/icons` → `src/components/Icons`

10 files (the discovered set in Phase 1):

| File |
|------|
| `superset-frontend/packages/superset-ui-chart-controls/src/components/SQLPopover.tsx` |
| `superset-frontend/packages/superset-ui-chart-controls/src/components/ColumnTypeLabel/ColumnTypeLabel.tsx` |
| `superset-frontend/plugins/plugin-chart-pivot-table/src/PivotTableChart.tsx` |
| `superset-frontend/plugins/plugin-chart-pivot-table/src/react-pivottable/TableRenderers.tsx` |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/renderers/TextCellRenderer.tsx` |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/index.tsx` |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/TimeComparisonVisibility.tsx` |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/CustomHeader.tsx` |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/Pagination.tsx` |
| `superset-frontend/plugins/plugin-chart-table/src/TableChart.tsx` |

### Wave 1.6 — Untyped `def` in `tests/`

318 files containing 3,973 untyped non-`__init__` `def`s. Devin batches
of ~20 files per PR; mypy gate per PR. Top-load files (most untyped
defs):

```
tests/integration_tests/security_tests.py
tests/integration_tests/charts/api_tests.py
tests/integration_tests/dashboards/api_tests.py
tests/integration_tests/databases/api_tests.py
tests/unit_tests/dao/*_test.py
tests/unit_tests/datasets/commands/importers/v1/import_test.py
```

(Use `grep -lE '^[[:space:]]*def[[:space:]]+\w+\([^)]*\)[[:space:]]*:' tests | xargs -I{} sh -c '...'`
to enumerate the full 318 — see Phase 1 commands in `summary.md`.)

---

## Automatable with Human Review (Tier 2–3)

### Wave 1.7 — `PropTypes` removal (mixed difficulty)

| File | Why review |
|------|-----------|
| `superset-frontend/packages/superset-ui-core/test/chart/components/reactify.test.tsx` | Test file; trivial — fully automatable |
| `superset-frontend/plugins/plugin-chart-pivot-table/src/react-pivottable/TableRenderers.tsx` | Vendored React Pivot Table; check upstream patches before mass edit |
| `superset-frontend/plugins/plugin-chart-pivot-table/src/react-pivottable/utilities.ts` | Same as above |
| `superset-frontend/plugins/legacy-preset-chart-nvd3/src/PropTypes.ts` | Defines all NVD3 PropTypes shapes — convert to `interface`s and re-import everywhere |
| `superset-frontend/plugins/legacy-preset-chart-nvd3/src/NVD3Vis.ts` | D3 + NVD3 — typed with PropTypes today |
| `superset-frontend/plugins/legacy-preset-chart-nvd3/src/ReactNVD3.tsx` | NVD3 React wrapper; class component (also Wave 3.1) |
| `superset-frontend/plugins/legacy-plugin-chart-partition/src/OptionDescription.tsx` | Small utility |
| `superset-frontend/plugins/legacy-plugin-chart-partition/src/Partition.ts` | D3 Partition viz |
| `superset-frontend/plugins/legacy-plugin-chart-world-map/src/WorldMap.ts` | D3 / Datamaps wrapper |
| `superset-frontend/plugins/legacy-plugin-chart-rose/src/Rose.ts` | D3 Rose viz |

### Wave 2.1 — `describe()` → flat `test()`

442 test files. Fully mechanical for files with exactly one
`describe()` and no nested `describe()`s; reviewer for nested cases.

| Sub-bucket | File count | Review intensity |
|------------|------------|------------------|
| Single top-level `describe()`, no nesting | ~300 (sample-checked) | Light |
| Multi-`describe()` and/or nested | ~140 | Medium (must hoist `beforeEach` properly) |

### Wave 2.2 — `@ts-ignore` / `@ts-nocheck` cleanup

20 files. Sub-classified:

| File | Tier | Recommendation |
|------|------|---------------|
| `superset-frontend/src/components/Chart/ChartContextMenu/ChartContextMenu.test.tsx` | 2 | Likely a typed-mock fix |
| `superset-frontend/packages/generator-superset/test/plugin-chart.test.ts` | 2 | Yeoman generator test |
| `superset-frontend/packages/generator-superset/test/app.test.ts` | 2 | Yeoman generator test |
| `superset-frontend/plugins/plugin-chart-table/src/stories/testData.ts` | 2 | Storybook fixture |
| `superset-frontend/plugins/plugin-chart-echarts/src/Timeseries/transformers.ts` | 3 | Production echarts transformer; reviewer required |
| All `superset-frontend/plugins/legacy-*` D3/NVD3 files (15) | 3 | Vendor-style code; reviewer required |

### Wave 2.3–2.5 — `any` type elimination (627 files, 2,045 occurrences)

| Sub-bucket | File count | `any` count | Review level |
|------------|-----------|-------------|--------------|
| `**/*.test.ts(x)` (test files) | ~300 | ~900 | Light — replace `as any` with `jest.MockedFunction` / proper test helpers |
| `superset-frontend/src/**/*.ts(x)` (non-test) | ~280 | ~750 | Medium — generics introduced |
| `superset-frontend/packages/**/*.ts(x)` (non-test) | ~50 | ~200 | Heavy — public types affecting multiple consumers |
| `superset-frontend/plugins/**/*.ts(x)` (non-test) | ~50 | ~195 | Medium — chart-specific |

### Wave 2.6 — Cypress → Playwright (active 5)

| File | `it()` blocks | Why review |
|------|---------------|-----------|
| `superset-frontend/cypress-base/cypress/e2e/database/modal.test.ts` | 4 | Needs new `playwright/pages/DatabaseModalPage.ts` |
| `superset-frontend/cypress-base/cypress/e2e/dashboard/drilltodetail.test.ts` | 23 | Largest of the active set; covers many drill-to-detail paths |
| `superset-frontend/cypress-base/cypress/e2e/dashboard/editmode.test.ts` | 1 | Maps to `playwright/tests/dashboard/...` |
| `superset-frontend/cypress-base/cypress/e2e/dashboard/actions.test.js` | 1 | Also a JS→TS migration |
| `superset-frontend/cypress-base/cypress/e2e/explore/chart.test.js` | 2 | Also a JS→TS migration |

### Wave 2.7 — Cypress → Playwright (skipped 26)

26 files. Per-file Devin task; reviewer first decides whether the test
still has business value (some `_skip.*` viz tests likely overlap with
existing Jest snapshot tests for the same chart type).

| File | `it()` blocks |
|------|---------------|
| `cypress/e2e/dashboard/_skip.nativeFilters.test.ts` | 11 |
| `cypress/e2e/dashboard/_skip.nativeFilters.noInitState.test.ts` | 12 |
| `cypress/e2e/dashboard/_skip.horizontalFilterBar.test.ts` | 7 |
| `cypress/e2e/dashboard/_skip.tabs.test.ts` | 2 |
| `cypress/e2e/dashboard/_skip.controls.test.ts` | 1 |
| `cypress/e2e/dashboard/_skip.url_params.test.ts` | 1 |
| `cypress/e2e/dashboard/_skip.load.test.ts` | 4 |
| `cypress/e2e/dashboard/_skip.key_value.test.ts` | 2 |
| `cypress/e2e/explore/_skip.AdhocFilters.test.ts` | 3 |
| `cypress/e2e/explore/_skip.AdhocMetrics.test.ts` | 1 |
| `cypress/e2e/explore/_skip.advanced_analytics.test.ts` | 1 |
| `cypress/e2e/explore/_skip.annotations.test.ts` | 1 |
| `cypress/e2e/explore/_skip.link.test.ts` | 4 |
| `cypress/e2e/explore/visualizations/_skip.table.test.ts` | 16 |
| `cypress/e2e/explore/visualizations/_skip.graph.test.ts` | 3 |
| `cypress/e2e/explore/visualizations/_skip.big_number.test.js` | 3 |
| `cypress/e2e/explore/visualizations/_skip.big_number_total.test.js` | 3 |
| `cypress/e2e/explore/visualizations/_skip.box_plot.test.js` | 2 |
| `cypress/e2e/explore/visualizations/_skip.bubble.test.js` | 2 |
| `cypress/e2e/explore/visualizations/_skip.compare.test.js` | 4 |
| `cypress/e2e/explore/visualizations/_skip.download_chart.test.js` | 1 |
| `cypress/e2e/explore/visualizations/_skip.gauge.test.js` | 3 |
| `cypress/e2e/explore/visualizations/_skip.pie.test.js` | 3 |
| `cypress/e2e/explore/visualizations/_skip.pivot_table.test.js` | 4 |
| `cypress/e2e/explore/visualizations/_skip.sunburst.test.js` | 1 |
| `cypress/e2e/explore/visualizations/_skip.world_map.test.js` | 4 |

### Wave 2.8 — Backend `Any` → proper types (227 files, 1,324 occurrences)

Top-loaded files:

| File | Approx. `Any` count |
|------|--------------------|
| `superset/views/*` | high — many `dict[str, Any]` API payloads (often correct) |
| `superset/commands/**` | medium — command parameter shapes |
| `superset/connectors/sqla/models.py` | medium — already excluded from `warn_unused_ignores` |

**Recommendation:** start with `superset/utils/`, `superset/charts/`, and
`superset/dashboards/` since they have the highest fix-to-API-surface
ratio.

---

## Requires Human (Tier 3–5)

### Wave 3.1 — Class components → functional + hooks (60 files)

The 60 class-component files cluster as follows:

| Path prefix | File count | Why human-required |
|-------------|-----------|--------------------|
| `superset-frontend/src/explore/components/controls/` | 17 | Chart-builder controls; tangled Redux + drag-drop + adhoc-metric state |
| `superset-frontend/src/dashboard/components/` | 18 | Dashboard layout + DnD + undo/redo; ref-forwarding required |
| `superset-frontend/src/SqlLab/components/{App,TabbedSqlEditors}/index.tsx` | 2 | Redux container components, heavy |
| `superset-frontend/src/components/{Chart,CopyToClipboard,Datasource,ErrorBoundary}/...` | 6 | Mixed; `ErrorBoundary` may stay as a class |
| `superset-frontend/packages/superset-ui-core/src/chart/components/` | 4 | Library boundary; needs ref-forwarding to consumers |
| `superset-frontend/plugins/legacy-*/src/` | 13 | D3-heavy class wrappers; usually paired with `PropTypes` removal |

**Common decisions a human must make per file:**

1. Where do `defaultProps` go? (Default param values, or a wrapping
   higher-order component if `defaultProps` was relied on for shape.)
2. Does any caller pass a `ref`? → `forwardRef` required.
3. Are there `componentDidCatch` / `getDerivedStateFromError` lifecycle
   methods? → Must stay class until React introduces a hook equivalent.
4. Does the component subscribe to Redux via `connect`? → Often easier
   to convert to `useSelector` + `useDispatch` in the same PR.
5. `setState` callback ordering — `setState({ a: 1 }, () => doX())` does
   not have a direct hook equivalent; must restructure with `useEffect`.

### Wave 3.2 — UUID columns on production models (6 models)

| Model file | Class(es) | Why human-required |
|------------|-----------|--------------------|
| `superset/models/cache.py` | `CacheKey` | Cache table, decide on UUID strategy for cache invalidation |
| `superset/models/annotations.py` | `Annotation`, `AnnotationLayer` | Has a public REST API (`/api/v1/annotation_layer/`); breaking-change consideration |
| `superset/models/task_subscribers.py` | `TaskSubscriber` | New table; safest target for UUID-from-day-one migration |
| `superset/models/user_attributes.py` | `UserAttribute` | Tied to user lifecycle; UUID may be redundant if FK-only |
| `superset/models/dynamic_plugins.py` | `DynamicPlugin` | Used by import/export; may benefit from `ImportExportMixin` instead of bare `UUIDMixin` |
| `superset/tags/models.py` | `Tag`, `TaggedObject` | Public Tags API; high traffic; backfill strategy must scale |

**Common decisions a human must make per model:**

1. `UUIDMixin` (just adds the column) or `ImportExportMixin` (which
   provides import/export semantics + UUID)?
2. Backfill strategy — single Alembic migration with `op.execute(...)`
   for SQLite/MySQL/Postgres compatibility (use helpers from
   `superset/migrations/shared/utils.py`).
3. Should the public REST API expose `uuid` instead of `id` (per
   `AGENTS.md` § UUID Migration)? If yes — what is the deprecation
   timeline for the integer `id`?
4. Index strategy on `uuid` (unique, non-null after backfill).

---

## Prompt Template Requirements

For each automatable category, a Devin prompt must include the
following context to maximize first-shot PR success.

### Wave 1.1 / 1.2 — PEP 604 / 585 (Python typing modernization)

- **Source file content**: not needed — Devin runs ruff with `--fix`.
- **Target example**: `superset/models/helpers.py` after the rewrite
  (cite the diff in the prompt).
- **Utility context**:
  - `pyproject.toml` `[tool.ruff]` block (note `target-version = "py310"`).
  - `[[tool.mypy.overrides]] module = "superset.migrations.versions.*"`
    confirms migrations are excluded.
- **Validation steps**:
  ```bash
  ruff check --select UP006,UP007 --fix --target-version=py310 superset/
  pre-commit run mypy --files <changed-files>
  pre-commit run ruff --files <changed-files>
  ```

### Wave 1.3 — `React.FC` removal

- **Source file content**: every `.tsx` file containing `React.FC`,
  `FC<…>`, or `FunctionComponent`.
- **Target example**: `superset-frontend/src/components/CrudThemeProvider.tsx`.
- **Utility context**:
  - `superset-frontend/.eslintrc.js`
  - `superset-frontend/tsconfig.json`
- **Validation steps**:
  ```bash
  cd superset-frontend && npm run type
  cd superset-frontend && npm run lint
  cd superset-frontend && npm test -- <file>
  ```

### Wave 1.4 — Direct `antd` → `@superset-ui/core/components`

- **Source file content**: each of the 7 production files listed
  above.
- **Target example**: `superset-frontend/src/SqlLab/components/SqlEditor/index.tsx`
  (which imports `Tooltip`, `Button`, etc. from `@superset-ui/core/components`).
- **Utility context**:
  - The full re-export list from
    `superset-frontend/packages/superset-ui-core/src/components/index.ts`
    (so Devin can detect missing wrapped components and either add the
    wrapper or skip).
- **Validation steps**: same as Wave 1.3.

### Wave 1.5 — `@ant-design/icons` → `src/components/Icons`

- **Source file content**: each of the 10 files.
- **Target example**: any file that imports from
  `src/components/Icons` (e.g.
  `superset-frontend/src/components/Chart/ChartHeader.tsx`).
- **Utility context**: list of icons exported by
  `superset-frontend/src/components/Icons/index.ts`.
- **Validation steps**: same as Wave 1.3.

### Wave 1.6 — Untyped `def` in `tests/`

- **Source file content**: each test file (one batch = ~20 files).
- **Target example**: `tests/unit_tests/datasource/utils/test_replace_verbose_with_column.py`
  (already typed).
- **Utility context**:
  - Common pytest fixture types: `MockerFixture` (from
    `pytest_mock`), `LogCaptureFixture`, `MonkeyPatch`, `CaptureFixture`,
    `FixtureRequest`, `FrozenDateTimeFactory` (from `freezegun`).
  - `[[tool.mypy.overrides]] module = "tests.*"` block from
    `pyproject.toml` so Devin knows the override exists and will be
    flipped after Wave 1.6 completes.
- **Validation steps**:
  ```bash
  pre-commit run mypy --files <changed-files>
  pytest <changed-files> -x
  ```

### Wave 2.6 / 2.7 — Cypress → Playwright

- **Source file content**: the Cypress test file plus its imports
  (`cypress/utils/index.ts`, `cypress/utils/urls.ts`,
  `cypress/support/directories.ts`).
- **Target example**:
  - `superset-frontend/playwright/tests/dashboard/dashboard-list.spec.ts`
  - `superset-frontend/playwright/pages/DashboardListPage.ts`
- **Utility context**:
  - The full list of Playwright page objects under
    `superset-frontend/playwright/pages/`.
  - The full list of API helpers under
    `superset-frontend/playwright/helpers/api/`.
  - `playwright.config.ts` and `playwright/global-setup.ts`.
- **Validation steps**:
  ```bash
  cd superset-frontend && npm run playwright:test -- <new-file>
  ```
  (Devin must also delete the source Cypress file once the Playwright
  port is green; verify no other Cypress test imports its helpers.)

---

## Quick reference: discovery commands

(Replicate Phase 1 by running these in the repo root.)

```bash
# Frontend any usage (files / occurrences)
grep -rlE ':\s*any\b|<any>|\bas\s+any\b|Array<any>|Promise<any>|Record<[^>]*,\s*any>' \
  --include="*.ts" --include="*.tsx" \
  superset-frontend/src superset-frontend/packages superset-frontend/plugins | wc -l

# Cypress active vs skipped
find superset-frontend/cypress-base/cypress/e2e -name "*.test.*" ! -name "_skip.*" | wc -l
find superset-frontend/cypress-base/cypress/e2e -name "_skip.*" | wc -l

# Python Optional usage (excluding migrations)
grep -rE 'Optional\[' --include="*.py" superset --exclude-dir=migrations | wc -l

# Untyped non-init defs in tests/
grep -rE '^[[:space:]]*def[[:space:]]+\w+\([^)]*\)[[:space:]]*:' --include="*.py" tests \
  | grep -vE '\->' | grep -vE 'def __init__' | wc -l

# Class components
grep -rlE 'class\s+\w+\s+extends\s+(React\.)?(Pure)?Component' \
  --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
  superset-frontend/src superset-frontend/packages superset-frontend/plugins | wc -l

# Direct antd imports outside @superset-ui/core
grep -rlE "^import\s+.*\s+from\s+['\"]antd(/.*)?['\"]" \
  --include="*.ts" --include="*.tsx" \
  superset-frontend/src superset-frontend/plugins superset-frontend/packages \
  | grep -v "superset-ui-core"
```
