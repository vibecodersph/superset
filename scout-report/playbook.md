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

# Migration Playbook

This playbook turns the raw discovery counts in `summary.md` into an
ordered execution plan. Each category below is paired with:

- the deprecated pattern → target pattern,
- a representative file (per complexity tier where the category spans
  multiple),
- the engineer-facing decisions a human reviewer would make,
- an automation recommendation.

The numbers come from the same `rg` / `find` queries used to produce
`summary.md`. The exact reproduction commands are listed under each
category so the next scout pass can re-derive them.

---

## Recommended Execution Order

Order rationale: knock out enforcement-friendly mechanical changes first
(so they stop accumulating), then schema-bound ones (UUIDs, SQLAlchemy
2.0) where rollout windows matter, and finally the long-tail of
type-tightening work which is naturally parallelizable across many small
PRs.

### Wave 1 — Quick Wins (Tier 1–2, ≈ 100 h)

1. **Category 4: `.js` / `.jsx` → `.ts` / `.tsx`** — 15 files, ≈ 4 h
   - Strategy: fully automated via the repo's own `js-to-ts` Claude
     command (`.claude/commands/js-to-ts.md`).
   - Devin context required: source file content; a sibling `.ts` file
     to mimic style; `tsconfig.json`; jest config to verify imports.
2. **Category 9: `describe()` → flat `test()`** — 463 files, ≈ 46 h
   - Strategy: codemod (`jscodeshift` / `ts-morph`) to inline single-block
     `describe`s, plus human review for nested or `beforeEach`-bearing
     blocks. AGENTS.md cites Kent C. Dodds' "avoid nesting" article.
   - Devin context: representative migrated file (search for files where
     `test(` appears at module top level with no enclosing `describe`).
3. **Category 5: direct `antd` imports → `@superset-ui/core` wrappers**
   — 11 files, ≈ 6 h
   - Strategy: rule-driven find/replace; ESLint already names this rule
     (`no-antd` in `.eslintrc.js`). Wrappers exist in
     `superset-frontend/packages/superset-ui-core/src/components/`.
4. **Category 6: direct `@ant-design/icons` → `src/components/Icons`** —
   12 files, ≈ 6 h. Same shape as Category 5; rule message points at
   target.
5. **Category 11: backend `# type: ignore` review** — 71 files, ≈ 36 h
   - Strategy: per-file mypy run, replace `# type: ignore` with the real
     fix or scope it to a specific error code. Many are stale.

### Wave 2 — Medium Complexity (Tier 3, ≈ 1,100 h)

6. **Category 2 & 3: `@ts-ignore` / `eslint-disable …no-explicit-any`
   review** — ≈ 220 files between them, ≈ 100 h.
7. **Category 7: `PropTypes` → TS interfaces** — 21 files (legacy NVD3
   plugins), ≈ 32 h.
8. **Category 14: `SupersetTestCase` → pytest functions** — 89 files,
   ≈ 134 h.
9. **Category 13: `getattr` / `setattr` → typed attribute access** —
   ≈ 80 files (concentrated in `superset/mcp_service/`), ≈ 120 h.
10. **Category 1: frontend `any` types** — 563 files, ≈ 466 h. Split:
    - Tests (193 files, 861 occurrences): mostly mechanical → automatable.
    - Production (370 files, 948 occurrences): requires careful typing
      against existing `@superset-ui/core` types.
11. **Category 12: backend `typing.Any` → concrete types** — 403 files,
    ≈ 403 h.
12. **Category 10: Cypress → Playwright** — migrate the 5 active test
    files (≈ 30 h) and decide rewrite-or-delete on the 26 `_skip.*`
    files (≈ 104 h if rewritten).

### Wave 3 — Architectural / Long-running (Tier 4–5, ≈ 540 h)

13. **Category 8: class components → hooks** — 58 files, ≈ 232 h. Most
    are dashboard / explore controls with redux-connected lifecycles.
14. **Category 15: SQLAlchemy 2.0 `Mapped[...]` migration** — ~116
    model classes, ≈ 232 h. Coupled to mypy / Alembic regression risk.
15. **Category 16: integer PK → UUID** — ~13 model files, ≈ 80 h.
    Architectural; requires migrations, API breaking-change review, and
    UPDATING.md entries (per AGENTS.md UUID guidance).

---

## Per-Category Detail

### 1. Frontend `any` types → proper TS types

**Current state:** 1,809 occurrences across 563 files. Production code
holds 948 occurrences in 370 files; tests hold 861 occurrences in 193
files.

**Target state:** explicit interfaces / generics, or `unknown` + narrowing
where the type is genuinely dynamic. The codebase already has a rich type
library in `@superset-ui/core` and `superset-frontend/src/types/` to
reuse.

**Pattern:** `: any`, `: any[]`, `<any>`, `as any` →
named interface / `unknown` / generic.

**Reproduction:**

```bash
rg -g '*.ts' -g '*.tsx' -g '!node_modules' \
   ': any\b|: any\[\]|<any>|as any\b' superset-frontend/ | wc -l
```

**Top hot-spots (occurrences):**

| File | Tier | Occurrences | Notes |
|------|:----:|------------:|-------|
| `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformers.test.ts` | 2 | 31 | test fixtures, mostly `as any` casts on echarts options |
| `superset-frontend/plugins/plugin-chart-echarts/test/Heatmap/transformProps.test.ts` | 2 | 27 | same shape |
| `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformProps.test.ts` | 2 | 25 | same shape |
| `superset-frontend/src/utils/downloadAsImage.test.ts` | 2 | 23 | DOM mocks; could use `Partial<HTMLElement>` |
| `superset-frontend/src/explore/components/controls/MetricControl/MetricsControl.tsx` | 3 | 22 | adhoc-metric/column union; production code |
| `superset-frontend/plugins/plugin-chart-echarts/test/Gauge/transformProps.test.ts` | 2 | 22 | test fixtures |
| `superset-frontend/src/dashboard/components/nativeFilters/selectors.test.ts` | 2 | 21 | redux state casts |
| `superset-frontend/src/dashboard/components/SliceHeaderControls/SliceHeaderControls.test.tsx` | 2 | 21 | event-handler mocks |
| `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Bar/transformProps.test.ts` | 2 | 21 | test fixtures |
| `superset-frontend/src/features/roles/utils.test.ts` | 2 | 19 | test data shapes |

**Representative conversion (Tier 3, production code):**

- Source: `superset-frontend/src/explore/components/controls/MetricControl/MetricsControl.tsx`
- Key decisions: which of the existing `AdhocMetric` / `Column` /
  `SavedMetric` union types from `@superset-ui/core` apply? Which casts
  are genuinely dynamic (json from server) vs. lazy?
- Automation: **partial** — first pass with Devin can replace
  test-fixture `any` (Tier 2) wholesale; production code requires
  per-file human review.

---

### 2. Frontend TypeScript suppression comments

**Current state:** 265 occurrences of `@ts-ignore` / `@ts-nocheck` /
`@ts-expect-error`. Top file:
`superset-frontend/src/filters/components/Select/SelectFilterPlugin.test.tsx`
(28 occurrences). The repo ESLint config explicitly disables
`@typescript-eslint/ban-ts-ignore` and `ban-ts-comment`, so these are not
flagged.

**Target state:** prefer `@ts-expect-error` (errors when the suppression
is unnecessary) with a one-line justification, or fix the underlying
type.

**Pattern:** `// @ts-ignore` → `// @ts-expect-error: <reason>` or real
type fix.

**Reproduction:**

```bash
rg -g '*.ts' -g '*.tsx' '@ts-ignore|@ts-nocheck|@ts-expect-error' \
   superset-frontend/ | wc -l
```

**Representative conversion (Tier 2):**

- Source: `superset-frontend/src/filters/components/Select/SelectFilterPlugin.test.tsx`
- Key decisions: bulk-convert `@ts-ignore` to `@ts-expect-error`, then
  re-run TS — anything that errors is a stale suppression that should
  just be deleted.

---

### 3. Frontend explicit `eslint-disable …no-explicit-any`

**Current state:** 92 occurrences in ~70 files. These coexist with the
fact that `@typescript-eslint/no-explicit-any` is *already off* in the
TS override, so most of these are dead suppressions.

**Reproduction:**

```bash
rg -g '*.ts' -g '*.tsx' \
   'eslint-disable.*@typescript-eslint/no-explicit-any|eslint-disable.*no-explicit-any' \
   superset-frontend/ | wc -l
```

**Representative conversion (Tier 2):** delete the comment, run lint;
when the rule is later turned on, add specific suppressions or fix the
type.

---

### 4. `.js` / `.jsx` → `.ts` / `.tsx`

**Current state:** 50 `.js` files and 1 `.jsx` file remain in
`superset-frontend/`. Most are intentional (build/CI configs, scripts,
Yeoman generators). The genuinely-eligible-for-migration set is **15
files**:

| File | Tier | Notes |
|------|:----:|-------|
| `superset-frontend/.storybook/preview.jsx` | 2 | only `.jsx` left; convert to `.tsx` |
| `superset-frontend/spec/fixtures/mockChartQueries.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockDashboardData.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockDashboardFilters.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockDashboardInfo.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockDashboardLayout.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockDashboardState.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockReportState.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockSliceEntities.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockState.js` | 1 | test data |
| `superset-frontend/spec/fixtures/mockStore.js` | 2 | imports redux store types |
| `superset-frontend/spec/__mocks__/mockExportObject.js` | 1 | trivial |
| `superset-frontend/spec/__mocks__/mockExportString.js` | 1 | trivial |
| `superset-frontend/packages/superset-ui-core/__mocks__/mockExportObject.js` | 1 | trivial |
| `superset-frontend/packages/superset-ui-core/__mocks__/mockExportString.js` | 1 | trivial |

**Excluded (kept as `.js` intentionally):**
- Build/CI configs: `babel.config.js`, `webpack.config.js`,
  `webpack.proxy-config.js`, `jest.config.js`, `prettier.config.js`,
  `changelog.config.js`, `test-runner-jest.config.js`,
  `.eslintrc.js`, `.eslintrc.minimal.js`, `.storybook/main.js`.
- Scripts: `scripts/*.js` (8 files), `js_build.sh` references.
- Yeoman generators: `packages/generator-superset/**/*.js` (3 files;
  excluded by the ESLint `'packages/generator-superset/**/*'` carve-out).
- Cypress test files (`cypress-base/cypress/**/*.test.js`, 13 files):
  better treated as part of Category 10 (Cypress → Playwright) — many
  are already `_skip.*` and may be deleted rather than ported.

**Pattern:** `mock*.js` → `mock*.ts` with explicit type imports from
`src/dashboard/types` / `src/SqlLab/types` / etc.

**Representative conversion (Tier 1):**

- Source: `superset-frontend/spec/fixtures/mockState.js`
- Key decisions: which redux slice types apply (`RootState`?). Reuse
  `import type { … } from 'src/dashboard/types'`. The repo already
  ships a `js-to-ts` Claude command at `.claude/commands/js-to-ts.md`.

---

### 5. Direct `antd` imports → `@superset-ui/core` wrappers

**Current state:** 134 occurrences in 102 files. **91 of those files
live in `packages/superset-core/` and `packages/superset-ui-core/`** —
those *are* the wrapper packages and legitimately need direct `antd`
access. The actual migration set is **11 files** in `src/` and
`plugins/`:

| File | Tier | Occurrences | Notes |
|------|:----:|------------:|-------|
| `superset-frontend/src/components/Descriptions/index.tsx` | 2 | 2 | re-exports antd Descriptions; should re-export from core wrapper |
| `superset-frontend/src/components/Splitter/index.tsx` | 2 | 2 | same shape |
| `superset-frontend/src/components/Tag/index.tsx` | 2 | 2 | same shape |
| `superset-frontend/src/components/TimePicker/index.tsx` | 2 | 1 | imports from antd |
| `superset-frontend/src/components/Datasource/ChangeDatasourceModal/index.tsx` | 2 | 1 | `InputRef` type |
| `superset-frontend/src/components/Chart/MenuItemWithTruncation.tsx` | 2 | 1 | `MenuItemProps` type |
| `superset-frontend/src/components/Chart/DrillBy/DrillBySubmenu.tsx` | 2 | 1 | `InputRef` type |
| `superset-frontend/src/hooks/useLocale.ts` | 2 | 1 | `Locale` from `antd/es/locale` |
| `superset-frontend/src/theme/utils/antdTokenNames.ts` | 2 | 1 | `theme` from antd |
| `superset-frontend/src/theme/tests/ThemeController.test.ts` | 2 | 1 | test only |
| `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/TimeComparisonVisibility.tsx` | 2 | 1 | direct antd component |

**Pattern:** `import { X } from 'antd'` →
`import { X } from '@superset-ui/core/components'` (or the appropriate
sub-path). The ESLint message in `.eslintrc.js` line 68 already names
the target path.

**Representative conversion (Tier 2):**

- Source: `superset-frontend/src/components/Tag/index.tsx`
- Key decisions: is there an existing `@superset-ui/core/components/Tag`
  wrapper? If yes, switch the import; if no, create the wrapper inside
  the core package and then re-export from `src/components/Tag` — this
  matches the pattern visible in `packages/superset-ui-core/src/components/`.

---

### 6. Direct `@ant-design/icons` → `src/components/Icons`

**Current state:** 13 occurrences in 12 files (mostly in plugins and
`superset-ui-chart-controls`).

**Pattern:** `import X from '@ant-design/icons'` → use the local
`Icons` component (`src/components/Icons` or
`packages/superset-ui-core/src/components/Icons`).

**Representative conversion (Tier 2):**

- Source: `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/Pagination.tsx`
- Key decisions: pick the icon name from the existing `Icons` enum, or
  add it to that enum first.

---

### 7. `PropTypes` → TypeScript interfaces

**Current state:** 217 occurrences in 21 files; ~80% concentrated in the
`legacy-preset-chart-nvd3` and other `legacy-plugin-chart-*` packages.

**Top files:**

| File | Tier | Occurrences |
|------|:----:|------------:|
| `superset-frontend/plugins/legacy-preset-chart-nvd3/src/NVD3Vis.ts` | 3 | 57 |
| `superset-frontend/plugins/legacy-preset-chart-nvd3/src/PropTypes.ts` | 3 | 45 |
| `superset-frontend/plugins/legacy-plugin-chart-partition/src/Partition.ts` | 3 | 26 |
| `superset-frontend/plugins/legacy-plugin-chart-world-map/src/WorldMap.ts` | 3 | 20 |
| `superset-frontend/plugins/legacy-plugin-chart-rose/src/Rose.ts` | 3 | 15 |
| `superset-frontend/src/features/databases/DatabaseModal/DatabaseConnectionForm/CommonParameters.tsx` | 2 | 15 |

**Pattern:** `PropTypes.shape({...})` → `interface XProps { ... }`.

**Representative conversion (Tier 3):**

- Source: `superset-frontend/plugins/legacy-preset-chart-nvd3/src/PropTypes.ts`
- Key decisions: this file is the *PropTypes definition module* for the
  plugin. Converting it requires designing the equivalent TS interfaces
  and rewiring every `<Component propTypes={...}>` consumer to drop the
  `propTypes` static and rely on TS instead.

---

### 8. Class components → function components + hooks

**Current state:** 58 files, 59 class definitions. 45 of these are in
`src/`; the rest are in plugins / `packages/superset-ui-core`.

**Top-level grouping:**

- 16 in `src/dashboard/components/` (Dashboard, DashboardGrid,
  DragDroppable, multiple gridComponent classes…).
- 14 in `src/explore/components/controls/` (SelectControl,
  CheckboxControl, MetricControl/Adhoc*, FilterControl/Adhoc*,
  AnnotationLayer…).
- 4 in `src/components/` (Chart, ChartRenderer, ErrorBoundary,
  CopyToClipboard).
- 3 in `src/SqlLab/components/`.
- 2 in `packages/superset-ui-core/src/chart/components/` (SuperChart,
  SuperChartCore, ChartDataProvider, reactify).
- Remainder split across plugins.

**Representative conversion (Tier 4):**

- Source: `superset-frontend/src/dashboard/components/Dashboard.tsx`
- Key decisions: this is a `PureComponent` with `componentDidMount`,
  `componentDidUpdate`, multiple lifecycle-driven side effects (mount
  logger, route tracking, related-charts diffing). Conversion needs:
  - replace `componentDidMount` with `useEffect(() => {}, [])`,
  - replace `componentDidUpdate` with dependency-array `useEffect`s,
  - move instance fields (`appliedFilters`, `appliedOwnDataCharts`) to
    `useRef`,
  - confirm Redux store access pattern (current uses connect HOC; could
    move to `useSelector`/`useDispatch`).
- Automation: **no** — too much per-file design judgement.

---

### 9. `describe()` nesting → flat `test()`

**Current state:** 1,074 `describe()` calls across 463 files. AGENTS.md
endorses Kent C. Dodds' "avoid nesting" pattern and explicitly says
*"Use `test()` instead of `describe()`"*.

**Pattern:** single-block `describe('X', () => { test('does Y', ...) })`
→ `test('X > does Y', ...)` at module top-level.

**Representative conversion (Tier 1):**

- Source: any spec where the only `describe` wraps the entire file.
- Key decisions: when `beforeEach`/`beforeAll` is used, the codemod
  must hoist setup into individual tests or convert to a fixture.
- Automation: **yes** with a custom `jscodeshift` codemod; flag any file
  that has nested `describe` for human review.

---

### 10. Cypress → Playwright

**Current state:**

- `superset-frontend/cypress-base/cypress/e2e/`: 31 test files. **Only 5
  actively run**:
  - `cypress/e2e/explore/chart.test.js`
  - `cypress/e2e/dashboard/actions.test.js`
  - `cypress/e2e/dashboard/drilltodetail.test.ts`
  - `cypress/e2e/dashboard/editmode.test.ts`
  - `cypress/e2e/database/modal.test.ts`
- 26 are prefixed `_skip.` (disabled).
- `superset-frontend/playwright/tests/`: 9 spec files already migrated
  (`auth/login.spec.ts`, `dataset/dataset-list.spec.ts`,
  `dataset/create-dataset.spec.ts`, `dashboard/theme.spec.ts`,
  `dashboard/export.spec.ts`, `dashboard/dashboard-list.spec.ts`,
  `chart/chart-list.spec.ts`, `sqllab/sqllab.spec.ts`,
  `generators/docs/docs-screenshots.spec.ts`).

**Pattern:** Cypress `cy.get(...).click()` → Playwright
`await page.locator(...).click()`. Cypress `cy.intercept` →
`page.route`. Per-test login → reuse Playwright `auth/login.spec.ts`
auth-state pattern.

**Representative conversion (Tier 4):**

- Source: `superset-frontend/cypress-base/cypress/e2e/dashboard/editmode.test.ts`
- Key decisions: many Cypress tests rely on session-state cookies set
  by previous tests; Playwright requires explicit `storageState`. The
  existing `superset-frontend/playwright/global-setup.ts` shows the
  target pattern.
- For the 26 `_skip.*` files: most have been disabled because of
  flakiness or coverage already moved elsewhere. Each needs an
  individual call: rewrite, fold into an existing Playwright spec, or
  delete with a justification.

---

### 11. Backend `# type: ignore` review

**Current state:** 190 occurrences in 71 files.

**Top files:**

| File | Tier | Occurrences |
|------|:----:|------------:|
| `superset/core/api/core_api_injection.py` | 2 | 22 |
| `superset/db_engine_specs/databricks.py` | 2 | 10 |
| `superset/viz.py` | 3 | 9 |
| `superset/models/helpers.py` | 3 | 9 |
| `superset/tasks/schemas.py` | 2 | 6 |
| `superset/mcp_service/system/tool/get_instance_info.py` | 2 | 6 |
| `superset/mcp_service/auth.py` | 2 | 6 |

**Representative conversion (Tier 2):**

- Source: `superset/db_engine_specs/databricks.py`
- Key decisions: each `# type: ignore` should be scoped
  (`# type: ignore[attr-defined]`), justified, or eliminated by adding
  the missing typing stub or refining a `cast()`. Many will become
  removable simply by upgrading the underlying type stubs listed in
  `.pre-commit-config.yaml`.

---

### 12. Backend `typing.Any` → concrete types

**Current state:** 2,778 `Any` references in 403 files.

**Top files:**

| File | Tier | Occurrences |
|------|:----:|------------:|
| `superset/migrations/shared/migrate_viz/query_functions.py` | 3 | 96 |
| `superset/db_engine_specs/base.py` | 4 | 59 |
| `superset/models/helpers.py` | 4 | 50 |
| `superset/viz.py` | 4 | 49 |
| `superset/mcp_service/server.py` | 3 | 41 |
| `superset/mcp_service/chart/chart_utils.py` | 3 | 34 |
| `superset/utils/log.py` | 3 | 33 |
| `superset/utils/core.py` | 4 | 33 |
| `superset/jinja_context.py` | 3 | 32 |
| `superset/mcp_service/chart/schemas.py` | 2 | 31 |

**Representative conversion (Tier 4):**

- Source: `superset/db_engine_specs/base.py`
- Key decisions: this is the abstract base class for every DB engine
  spec; signatures like `def get_function_names(cls, ...) -> Any:`
  need a `list[str]` (or `Sequence[str]`) return type, and that
  refinement may cascade through every subclass in
  `superset/db_engine_specs/`.

---

### 13. Backend `getattr` / `setattr` lazy attribute access

**Current state:** 396 occurrences. AGENTS.md prohibits these as a
"lazy way to access attributes".

**Top files:**

| File | Tier | Occurrences |
|------|:----:|------------:|
| `superset/mcp_service/dataset/schemas.py` | 3 | 42 |
| `superset/mcp_service/dashboard/schemas.py` | 3 | 37 |
| `superset/mcp_service/database/schemas.py` | 3 | 21 |
| `superset/mcp_service/chart/schemas.py` | 3 | 18 |
| `superset/mcp_service/middleware.py` | 3 | 17 |
| `superset/mcp_service/chart/chart_utils.py` | 3 | 17 |
| `superset/mcp_service/chart/tool/get_chart_preview.py` | 3 | 14 |
| `superset/models/helpers.py` | 3 | 14 |

**Representative conversion (Tier 3):**

- Source: `superset/mcp_service/dataset/schemas.py`
- Key decisions: most `getattr(obj, "field", default)` calls here are
  flattening Pydantic / SQLAlchemy models into MCP-tool response shapes.
  The proper fix is to add a typed mapping helper (e.g. a `TypedDict` or
  a Pydantic `model_dump` projection) so the type system can verify
  every attribute exists.

---

### 14. `SupersetTestCase` → pytest

**Current state:** 89 test files inherit from `SupersetTestCase` (which
itself extends `unittest.TestCase`). 236 calls to `self.assert*`. AGENTS
prefers pytest functions and unit tests.

**Pattern:**

```python
class TestThing(SupersetTestCase):
    def test_x(self):
        self.assertEqual(a, b)
```

→

```python
def test_thing__x(client) -> None:
    assert a == b
```

**Representative conversion (Tier 3):**

- Source: any of the 89 files (e.g.
  `tests/integration_tests/dashboards/api_tests.py`).
- Key decisions: integration tests rely heavily on `self.login_as_admin`,
  `self.create_dashboard`, etc. The conversion must add equivalent
  pytest fixtures (or thin wrappers) before the class can be removed.
- AGENTS.md's "Prefer unit tests over integration tests" guidance also
  applies — many of these are good candidates for outright relocation
  to `tests/unit_tests/` rather than mechanical conversion.

---

### 15. SQLAlchemy 2.0 `Mapped[...]` migration

**Current state:** ~116 model class declarations in `superset/`
(`class X(Model)` / `class X(Model, AuditMixinNullable, ...)`); only 4
occurrences of `Mapped[` exist anywhere in `superset/`.

**Pattern (legacy → 2.0):**

```python
class Slice(Model, AuditMixinNullable):
    id = Column(Integer, primary_key=True)
    slice_name = Column(String(250))
```

→

```python
class Slice(Model, AuditMixinNullable):
    id: Mapped[int] = mapped_column(primary_key=True)
    slice_name: Mapped[str | None] = mapped_column(String(250))
```

**Representative conversion (Tier 4):**

- Source: `superset/models/slice.py`
- Key decisions: every nullable column must be deliberately `| None`;
  every relationship needs `Mapped[list["X"]]` etc. mypy will surface
  hundreds of fixups elsewhere in the code base. Coordinate with
  Category 12 (`typing.Any`).

---

### 16. Integer PK → UUID-first models

**Current state:** Only 3 model files use the existing `UUIDMixin`
(`Dashboard`, `Slice`, `Theme` etc. via `core.py`); 13 model files in
`superset/` declare integer primary keys. 160 `Column(Integer, ...,
primary_key=True)` total when migrations are counted (most live inside
historical Alembic scripts and should not be touched).

**Pattern:**

```python
class Foo(Model):
    id = Column(Integer, primary_key=True)
```

→

```python
class Foo(UUIDMixin, Model):
    ...
```

…with an Alembic migration, an API-payload audit (UUIDs replace integer
IDs in public responses), and an `UPDATING.md` entry.

**Representative conversion (Tier 5):**

- Source: `superset/reports/models.py`
- Key decisions: report schedules are referenced by integer ID across
  the report-execution system, the alerting log table, and external
  webhooks. A move to UUID needs:
  - additive migration adding a `uuid` column,
  - dual-write window,
  - public-API surface refactor,
  - `UPDATING.md` breaking-change note.
- Automation: **no** — architectural decision per model.

---

## Reproducibility

Every count in this report can be regenerated with the snippets above
plus:

```bash
# Frontend file totals
find superset-frontend -name '*.js'   -not -path '*/node_modules/*' | wc -l
find superset-frontend -name '*.jsx'  -not -path '*/node_modules/*' | wc -l
find superset-frontend -name '*.ts'   -not -path '*/node_modules/*' | wc -l
find superset-frontend -name '*.tsx'  -not -path '*/node_modules/*' | wc -l

# Backend
find superset -name '*.py' -not -path '*/migrations/*' | wc -l
find tests    -name '*.py' | wc -l

# any types in production vs tests
rg -g '*.ts' -g '*.tsx' -g '!*.test.ts' -g '!*.test.tsx' \
   ': any\b|: any\[\]|<any>|as any\b' superset-frontend/ | wc -l
rg -g '*.test.ts' -g '*.test.tsx' \
   ': any\b|: any\[\]|<any>|as any\b' superset-frontend/ | wc -l
```
