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

# Migration Playbook — vibecodersph/superset

> See `summary.md` for the executive summary and category counts. This file
> contains the per-category execution plan, recommended ordering, and
> per-file tier assignments for representative samples.

## Recommended Execution Order

The ordering optimizes for: (1) **CI signal** — make failures more visible
by enabling lint rules first, (2) **dependency order** — landing
`@superset-ui/core` wrapper migrations before `any` cleanup avoids churn,
(3) **cost** — quick wins before deep refactors.

### Wave 1 — Quick Wins (Tier 1–2)

These categories have ~100 % automation potential, well-defined target
patterns, and ship-and-forget lint enforcement.

| Order | Category | Files | Hours | Strategy |
|-------|----------|-------|-------|----------|
| 1.1 | `typing.Optional[X]` → `X \| None` (PEP 604) | 193 | 16 | Run `ruff check --select UP007 --fix` after enabling `UP` rules |
| 1.2 | `typing.List/Dict/Tuple/Type` → `list/dict/tuple/type` (PEP 585) | ~250 | 20 | Run `ruff check --select UP006 --fix` (target = `py310`) |
| 1.3 | `React.FC` removal | 138 | 23 | One-shot codemod or a Devin job per package |
| 1.4 | Direct `antd` → `@superset-ui/core/components` | 16 | 16 | One-shot — small, well-bounded |
| 1.5 | Direct `@ant-design/icons` → `src/components/Icons` | 11 | 11 | One-shot |
| 1.6 | Untyped `def` in `tests/` (Python) | 318 | 159 | Devin batches of ~20 files; run mypy per batch |
| 1.7 | `PropTypes` removal (legacy plugins) | 10 | 30 | Per-file Devin job |

**Wave 1 total: ~660 files, ~275 hours.** Most of these can be a single
Devin "playbook run" each — the source pattern is mechanical and the target
example is in-repo.

### Wave 2 — Medium Complexity (Tier 2–3)

| Order | Category | Files | Hours | Strategy |
|-------|----------|-------|-------|----------|
| 2.1 | `describe()` → flat `test()` | 442 | 220 | Devin per-file with reviewer; non-trivial test refactors |
| 2.2 | `@ts-ignore` / `@ts-nocheck` cleanup | 20 | 30 | Devin per-file, often requires understanding underlying type bug |
| 2.3 | `any` type elimination — frontend src | 388 | 290 | Per-file Devin job; reviewer for ambiguous typings |
| 2.4 | `any` type elimination — packages | 123 | 90 | Same as 2.3, scoped per-package |
| 2.5 | `any` type elimination — plugins | 116 | 90 | Same as 2.3, scoped per-plugin |
| 2.6 | Cypress → Playwright (active, 5) | 5 | 60 | Devin + reviewer; Playwright pages exist |
| 2.7 | Cypress → Playwright (`_skip.*`, 26) | 26 | 260 | Devin + reviewer; verify each test still has business value |
| 2.8 | Backend `Any` → proper types (production) | 227 | 250 | Per-file Devin with mypy gating; reviewer for `Any` in interfaces |

**Wave 2 total: ~1,347 files, ~1,290 hours.**

### Wave 3 — Complex Migrations (Tier 3–5)

| Order | Category | Files | Hours | Strategy |
|-------|----------|-------|-------|----------|
| 3.1 | Class components → functional + hooks | 60 | 240 | Human-led with Devin assistance; complex chart-builder controls |
| 3.2 | UUID columns on production models | 6 | 36 | Human-led; requires Alembic migration + dual-write strategy |

**Wave 3 total: 66 files, 276 hours.**

---

## Per-Category Detail

### 1.1 `typing.Optional[X]` → `X \| None` (PEP 604)

- **Tier:** 1 (Trivial)
- **Current state:** 660 occurrences across 193 files (excluding
  `superset/migrations/versions/*` which are mypy-excluded). Detected with
  `grep -rE 'Optional\[' --include="*.py" superset --exclude-dir=migrations`.
- **Target state:** `X | None` syntax (PEP 604). Repo's `target-version` is
  `py310` so this is supported. Ruff already has `select=["I","B","C","E","F","G","N","PT","Q","S","T","TID","W"]`
  but does **not** have `UP` enabled — turning it on is the trigger.
- **Pattern:**
  - Source: `from typing import Optional` + `def foo(x: Optional[int]) -> Optional[str]: ...`
  - Target: `def foo(x: int | None) -> str | None: ...` (and remove the
    `Optional` import).
- **Top-loaded files:**

  | File | Tier | `Optional` count | Notes |
  |------|------|------------------|-------|
  | `superset/models/helpers.py` | 1 | 85 | Largest single file; `from __future__ import annotations` already present |
  | `superset/security/manager.py` | 1 | 44 | Mostly method signatures |
  | `superset/exceptions.py` | 1 | 16 | All in `__init__` signatures |
  | `superset/examples/generic_loader.py` | 1 | 12 | Uniform |
  | `superset/daos/base.py` | 1 | 12 | Generic DAO base |

- **Representative conversion (Tier 1):** `superset/models/helpers.py`.
  - Decisions: (a) keep `from __future__ import annotations` (already
    there); (b) remove now-unused `Optional` import after rewrite;
    (c) verify `Union[X, None]` is also caught (it is — `UP007`).
  - Automation recommendation: **Fully automated** — ruff `--fix` is
    deterministic. Devin runs once with a single command, then `mypy` to
    confirm no regression.

### 1.2 `typing.List/Dict/Tuple/Type` → `list/dict/tuple/type` (PEP 585)

- **Tier:** 1 (Trivial)
- **Current state:** 247 `List[`, 278 `Dict[`, 38 `Tuple[`, 21 `Type[`
  occurrences (excluding migrations). Ruff `UP006` covers all of these.
- **Target state:** lowercase generics, e.g. `list[int]`, `dict[str, Any]`,
  `tuple[int, ...]`, `type[Model]`.
- **Pattern:**
  - Source: `from typing import List, Dict, Tuple` + `def foo(x: List[int], y: Dict[str, Any]) -> Tuple[int, ...]: ...`
  - Target: `def foo(x: list[int], y: dict[str, Any]) -> tuple[int, ...]: ...`
- **Automation recommendation:** **Fully automated** in the same
  ruff `UP` enablement PR as 1.1.

### 1.3 `React.FC` / `FunctionComponent` removal

- **Tier:** 1 (Trivial)
- **Current state:** 138 files use `React.FC`, `FC`, or `FunctionComponent`
  type annotations on component declarations.
- **Target state:** A plain function with explicit prop type, e.g.
  `const Foo = ({ a, b }: FooProps) => <div />` (the modern React
  community recommendation; avoids implicit `children` typing).
- **Pattern:**
  - Source: `const Foo: React.FC<FooProps> = (props) => ...`
  - Target: `const Foo = (props: FooProps) => ...`
- **Automation recommendation:** **Fully automated** with a `ts-morph` or
  `jscodeshift` codemod; Devin handles per-package or per-plugin.

### 1.4 Direct `antd` → `@superset-ui/core/components`

- **Tier:** 2 (Simple)
- **Current state:** 16 files import directly from `antd`. Forbidden
  per `AGENTS.md` § Frontend Modernization.
- **Target state:** Re-export from
  `@superset-ui/core/components`, which already re-exports `Button`,
  `Modal`, `Tooltip`, `Tabs`, `Input`, `Select`, etc.
- **Pattern:**
  - Source: `import { Tooltip, Button } from 'antd';`
  - Target: `import { Tooltip, Button } from '@superset-ui/core/components';`
- **Files:**

  | File | Tier | Notes |
  |------|------|-------|
  | `superset-frontend/src/components/Tag/index.tsx` | 2 | Likely 1–2 antd imports |
  | `superset-frontend/src/components/Chart/DrillBy/DrillBySubmenu.tsx` | 2 | |
  | `superset-frontend/src/components/Chart/MenuItemWithTruncation.tsx` | 2 | |
  | `superset-frontend/src/components/Datasource/ChangeDatasourceModal/index.tsx` | 2 | |
  | `superset-frontend/src/theme/utils/antdTokenNames.ts` | 2 | Import is for the antd theme token *types* — confirm wrapper exposes them |
  | `superset-frontend/src/theme/tests/ThemeController.test.ts` | 2 | Test file, may need fewer guard rails |
  | `superset-frontend/src/hooks/useLocale.ts` | 2 | Import is `ConfigProvider` — confirm wrapper exposes it |
  | `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/TimeComparisonVisibility.tsx` | 2 | |
  | `superset-frontend/packages/superset-core/src/components/Alert/index.tsx` | 2 | `superset-core` package may legitimately need direct antd — confirm policy with maintainer |
  | `superset-frontend/packages/superset-core/src/theme/Theme.tsx` | 2 | `superset-core` is the wrapper itself; **may stay** |
  | `superset-frontend/packages/superset-core/src/theme/Theme.test.tsx` | 2 | Same — `superset-core` is the wrapper |
  | `superset-frontend/packages/superset-core/src/theme/utils/themeUtils.ts` | 2 | Same |
  | `superset-frontend/packages/superset-core/src/theme/utils/themeUtils.test.ts` | 2 | Same |
  | `superset-frontend/packages/superset-core/src/theme/utils/utils.test.ts` | 2 | Same |
  | `superset-frontend/packages/superset-core/src/theme/utils/index.ts` | 2 | Same |
  | `superset-frontend/packages/superset-core/src/theme/types.ts` | 2 | Same |

  **Note:** 9 of the 16 are inside `packages/superset-core` (the wrapper
  layer itself) and may legitimately need to import from `antd` directly.
  The Devin task should *exclude* `packages/superset-core/**` after
  confirming with a code-owner.

- **Representative conversion (Tier 2):**
  `superset-frontend/src/components/Tag/index.tsx`
  - Decisions: confirm `Tag` is re-exported by `@superset-ui/core/components`;
    if not, the migration requires an upstream PR adding the wrapper.
  - Automation recommendation: **Fully automated with review** — Devin
    runs the rewrite, eslint catches any missing re-exports.

### 1.5 Direct `@ant-design/icons` → `src/components/Icons`

- **Tier:** 2 (Simple)
- **Current state:** 11 files import directly from `@ant-design/icons`.
- **Target state:** Use the project's centralized icon set
  (`superset-frontend/src/components/Icons`), which wraps `@ant-design/icons`
  with consistent sizing, color tokens, and accessibility.
- **Files:** see `tmp/antd_icons.txt` (3 in `packages/superset-ui-chart-controls`,
  6 in `plugins/plugin-chart-ag-grid-table`, 1 in `plugins/plugin-chart-table`,
  1 in `plugins/plugin-chart-pivot-table`).
- **Automation recommendation:** **Fully automated** — single rewrite plus
  an eslint rule (the `eslint-plugin-icons` plugin already exists and could
  be extended with a `no-direct-antd-icons` rule to lock this in).

### 1.6 Untyped Python `def` in `tests/`

- **Tier:** 2 (Simple)
- **Current state:** 3,973 untyped non-`__init__` `def`s across 318 files
  in `tests/` (out of 684 total). Mypy currently overrides
  `[[tool.mypy.overrides]] module = "tests.*"` to disable
  `disallow_untyped_defs`, so adding type hints unblocks turning that
  override off.
- **Target state:** Every test function has type hints (typically `None`
  return), all fixture parameters are typed.
- **Pattern:**
  - Source: `def test_user_favorite_tag(mocker):`
  - Target: `def test_user_favorite_tag(mocker: MockerFixture) -> None:`
- **Representative conversion (Tier 2):** `tests/unit_tests/dao/tag_test.py`
  - Decisions: import `MockerFixture`, `pytest.LogCaptureFixture`,
    `freezegun.api.FrozenDateTimeFactory`, etc. as needed; pick the right
    return type for parametrized tests.
  - Automation recommendation: **Fully automated with mypy gate** — Devin
    rewrites, then runs `pre-commit run mypy --files tests/...`.

### 1.7 `PropTypes` removal (legacy plugins)

- **Tier:** 2–3 (Simple → Medium)
- **Current state:** 10 files. 7 are inside `legacy-*` plugins (NVD3,
  partition, world-map, rose) and have legitimate runtime `PropTypes`
  usage threaded through D3 vis code; converting to TS types is straight­
  forward but the surrounding code is non-functional and dense.
- **Target state:** TypeScript prop types/interfaces.
- **Files:** see the list under "Wave 1.7" in `devin-candidates.md`.
- **Automation recommendation:** **Partial** — Devin handles the easier 3
  files (`utilities.ts`, `OptionDescription.tsx`,
  `reactify.test.tsx`), human review on the 7 NVD3 / D3 charts.

### 2.1 `describe()` → flat `test()` (avoid-nesting)

- **Tier:** 2 (Simple per file, but volume is large)
- **Current state:** 442 test files use `describe()`, 1,030 occurrences
  total across `superset-frontend/{src,packages,plugins,spec}`.
- **Target state:** Flat `test('it should …', () => { ... })` calls without
  `describe()` wrappers (or with at most one top-level `describe()`).
  Reference: <https://kentcdodds.com/blog/avoid-nesting-when-youre-testing>.
- **Pattern:**
  - Source: `describe('Foo', () => { it('does X', ...); it('does Y', ...) })`
  - Target: `test('Foo: does X', () => { ... }); test('Foo: does Y', () => { ... });`
- **Representative target file:**
  `superset-frontend/src/filters/components/Select/controlPanel.test.ts`.
- **Automation recommendation:** **Partial** — single-block `describe()`
  files (where there's exactly one `describe()` and no nested `describe()`s)
  are mechanical. Multi-block / nested files require thoughtful
  `beforeEach` hoisting and are best done with reviewer.

### 2.2 `@ts-ignore` / `@ts-nocheck` cleanup

- **Tier:** 2–3 (Simple → Medium)
- **Current state:** 20 files containing 22 occurrences. 13 are inside
  `legacy-preset-chart-nvd3` and other `legacy-*` plugins (D3 / NVD3
  vendor code); the rest are in tests.
- **Target state:** Either fix the underlying type or replace with a
  narrowly-scoped `@ts-expect-error <reason>` comment.
- **Automation recommendation:** **Partial** — Devin can attempt removal
  in test files (often a missing import or typed mock helper); human-led
  for the legacy chart vendor files.

### 2.3 / 2.4 / 2.5 `any` type elimination

- **Tier:** 2–3 (mostly 2 in tests, 3 in production code)
- **Current state:** 2,045 occurrences of `: any`, `<any>`, `as any`,
  `Array<any>`, `Promise<any>`, `Record<…, any>` across **627** files
  (388 in `src/`, 123 in `packages/`, 116 in `plugins/`).
  `@typescript-eslint/no-explicit-any` is currently `off` in both
  `.eslintrc.js` and `oxlint.json`.
- **Target state:** Proper TS types, or `unknown` with narrowing.
- **Top-loaded files:**

  | File | Tier | `any` count | Notes |
  |------|------|-------------|-------|
  | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformers.test.ts` | 2 | 35 | Test file; use ECharts types |
  | `superset-frontend/plugins/plugin-chart-echarts/test/Heatmap/transformProps.test.ts` | 2 | 29 | Same |
  | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformProps.test.ts` | 2 | 25 | Same |
  | `superset-frontend/src/utils/downloadAsImage.test.ts` | 2 | 23 | Test of html2canvas/jspdf wrappers |
  | `superset-frontend/src/explore/components/controls/MetricControl/MetricsControl.tsx` | 3 | 22 | Production class component (also Wave 3.1) |
  | `superset-frontend/src/reduxUtils.ts` | 3 | 19 | Generic redux helpers — needs proper generics |
  | `superset-frontend/src/views/CRUD/utils.tsx` | 3 | 18 | Public CRUD helpers used by many list pages |
  | `superset-frontend/plugins/preset-chart-deckgl/src/utilities/tooltipUtils.tsx` | 3 | 14 | Deck.gl typed via own dts |

- **Representative conversion (Tier 2 — test):**
  `superset-frontend/src/utils/downloadAsImage.test.ts`.
  - Decisions: use `jest.MockedFunction<typeof saveAs>` instead of `as any`;
    introduce a typed mock helper.
  - Automation recommendation: **Partial** — Devin per-file; human review
    when `any` is in a public type signature.

- **Representative conversion (Tier 3 — production):**
  `superset-frontend/src/reduxUtils.ts`.
  - Decisions: introduce generic state type, e.g.
    `function alterInArr<S extends Record<string, unknown>, K extends keyof S>(state: S, arrKey: K, …): S`.
  - Automation recommendation: **Partial** — needs human review of the
    introduced generics; cross-file impact (this file is imported widely).

### 2.6 / 2.7 Cypress → Playwright

- **Tier:** 3 (Medium)
- **Current state:**
  - 5 active Cypress test files (`*.test.ts` / `*.test.js`, no `_skip.`
    prefix), 31 `it()` blocks, 2,140 LOC.
  - 26 `_skip.*` Cypress test files (tests already disabled), 73 `it()`
    blocks, 3,724 LOC.
  - Target: 9 existing Playwright spec files (`.spec.ts`) plus a rich
    page-object / component library in
    `superset-frontend/playwright/{pages,components,helpers}/`.
- **Pattern:**
  - Source: `cy.get(...).click()`, `cy.intercept(...)`, `describe + it`
  - Target: `page.locator(...).click()`, `page.route(...)`, `test`
    with imports from `@playwright/test` and the project's page objects.
- **Active Cypress files (5) — Wave 2.6:**

  | File | Tier | `it()` blocks | LOC |
  |------|------|---------------|-----|
  | `superset-frontend/cypress-base/cypress/e2e/dashboard/actions.test.js` | 3 | 1 | ~200 |
  | `superset-frontend/cypress-base/cypress/e2e/dashboard/drilltodetail.test.ts` | 3 | 23 | ~700 |
  | `superset-frontend/cypress-base/cypress/e2e/dashboard/editmode.test.ts` | 3 | 1 | ~300 |
  | `superset-frontend/cypress-base/cypress/e2e/database/modal.test.ts` | 3 | 4 | ~300 |
  | `superset-frontend/cypress-base/cypress/e2e/explore/chart.test.js` | 3 | 2 | ~150 |

- **Skipped Cypress files (26) — Wave 2.7:** all start with `_skip.`. They
  are already disabled and the migration order should reflect their
  business value: `dashboard/_skip.nativeFilters.test.ts` (11 it()),
  `dashboard/_skip.nativeFilters.noInitState.test.ts` (12 it()), and
  `dashboard/_skip.tabs.test.ts` (2 it()) carry the most signal; visualization
  `_skip.*` smoke tests likely overlap with existing Jest snapshots and
  may be deprecated rather than ported.

- **Representative conversion (Tier 3):**
  `superset-frontend/cypress-base/cypress/e2e/database/modal.test.ts`.
  - Decisions: which page object covers the database modal? (None yet —
    needs `playwright/pages/DatabaseModalPage.ts`); which Playwright
    fixture intercepts the `validate_parameters` endpoint? (Use
    `playwright/helpers/api/database.ts`).
  - Automation recommendation: **Partial with human review** — there are
    existing Devin sessions doing this exact migration (visible in
    branch list `origin/devin/177*-migrate-database-modal-playwright`).
    The pattern is well-established; reviewer focuses on whether
    intercept timing maps cleanly.

### 2.8 Backend `Any` → proper types (production)

- **Tier:** 3 (Medium)
- **Current state:** 1,324 `Any` occurrences across 227 files in
  `superset/` (excluding migrations). Many are in well-typed signatures
  (e.g. `dict[str, Any]` for JSON-shaped data) and would stay; the
  migration target is the subset where a richer type is feasible (e.g.
  TypedDict, marshmallow-derived schemas, or pydantic models).
- **Automation recommendation:** **Partial** — Devin per-file, with
  reviewer to decide if `Any` is correct here (e.g. for SQLAlchemy column
  types).

### 3.1 Class components → functional + hooks

- **Tier:** 3–4 (Medium → Complex)
- **Current state:** 60 class components (59 unique files; one file has
  two classes). Concentration:
  - `src/explore/components/controls/` — 17 files (chart builder, complex
    state with Redux + drag-drop + modal logic)
  - `src/dashboard/components/` — 18 files (DnD, undo/redo, layout)
  - `src/components/` — 6 files
  - `src/SqlLab/components/` — 2 files (`App/index.tsx`,
    `TabbedSqlEditors/index.tsx` — heavy Redux integration)
  - `packages/superset-ui-core/src/chart/components/` — 4 files (these may
    intentionally stay class components for `componentDidCatch` /
    `getDerivedStateFromError` use)
  - `plugins/legacy-*` — 13 files (legacy charts, lower priority)
- **Target state:** Functional component with `useState`, `useEffect`,
  `useRef`, `useCallback`, `useMemo`. ErrorBoundary-style classes can stay
  class-based until React introduces a hook equivalent.
- **Representative conversion (Tier 3):**
  `superset-frontend/src/components/CopyToClipboard/index.tsx`.
  - Decisions: where do `defaultProps` go (default param values)? Does
    any caller pass a `ref`? (yes — `cloneElement`, requires
    `forwardRef`).
  - Automation recommendation: **Human-led** — Devin can scaffold but
    a human must reason about `setState` callback ordering, ref
    forwarding, `componentDidCatch` boundaries.

- **Representative conversion (Tier 4):**
  `superset-frontend/src/explore/components/controls/MetricControl/MetricsControl.tsx`
  (also a top-`any`-density file at 22 occurrences).
  - Decisions: 22 `any` types tangled with Redux + adhoc-metric drag-drop
    state machine; refactor must be done with the rest of the
    `MetricControl/` directory at the same time.
  - Automation recommendation: **Human-led** with Devin pair-programming
    on smaller pieces.

### 3.2 UUID columns on production models

- **Tier:** 4 (Complex — Alembic migration + dual-write)
- **Current state:** 6 production models lack a `uuid` column or
  `UUIDMixin`/`ImportExportMixin` inheritance:
  - `superset/models/cache.py` — `CacheKey`
  - `superset/models/annotations.py` — `Annotation`, `AnnotationLayer`
  - `superset/models/task_subscribers.py` — `TaskSubscriber`
  - `superset/models/user_attributes.py` — `UserAttribute`
  - `superset/models/dynamic_plugins.py` — `DynamicPlugin`
  - `superset/tags/models.py` — `Tag`, `TaggedObject`
- **Target state:** Add a `uuid` column (using `UUIDMixin` from
  `superset/models/helpers.py`) plus an Alembic migration that backfills
  existing rows with `uuid.uuid4()`.
- **Representative conversion (Tier 4):** `superset/tags/models.py` (Tag).
  - Decisions: backfill strategy for large tag tables; whether the
    public Tags REST API in `superset/views/tags.py` should expose
    `uuid` instead of `id`; backwards-compat headers; index strategy.
  - Automation recommendation: **Human-led** — needs design alignment
    on whether external API exposes new UUID, and Alembic migration
    correctness across MySQL/Postgres/SQLite.

---

## Cross-cutting prerequisites

These are **not** migration categories but should land **before** any
Devin batch run, because they tighten the lint signal that catches
regressions:

| # | Action | Effort |
|---|--------|--------|
| A | Enable ruff `UP` (pyupgrade) rules to auto-flag `Optional/List/Dict/Tuple` regressions | < 1 h |
| B | Flip `@typescript-eslint/no-explicit-any` to `warn` (then `error` per directory) | 1 h + per-dir conversion |
| C | Add a custom `eslint-plugin-icons/no-direct-antd-icons` rule | 2 h |
| D | Add an eslint rule banning direct `from 'antd'` imports outside `packages/superset-core/` and `packages/superset-ui-core/` | 2 h |
| E | Drop the `[[tool.mypy.overrides]] module = "tests.*"` block once Wave 1.6 lands | < 1 h |
| F | Drop the deprecated `superset-frontend/cypress-base` directory once Wave 2.6 + 2.7 are complete | < 1 h |

These prerequisites turn ad-hoc migrations into **enforced** invariants
and prevent the categories above from creeping back.

---

## Devin prompt-template requirements (per-category)

For Devin runs to succeed without per-file babysitting, every prompt
should include:

1. **Source-file content** — the raw file to migrate.
2. **Target example** — link to an in-repo file that already follows the
   target pattern (see "Existing target-state examples" in `summary.md`).
3. **Utility context** — the `@superset-ui/core/components` re-export
   list, the `playwright/pages/` index, the `UUIDMixin` definition,
   etc.
4. **Validation commands** — every Devin run must end with the
   appropriate gate command(s):
   - Frontend types: `cd superset-frontend && npm run type`
   - Frontend lint: `cd superset-frontend && npm run lint`
   - Frontend tests: `cd superset-frontend && npm test -- <file>`
   - Backend types: `pre-commit run mypy --files <file>`
   - Backend lint: `pre-commit run ruff --files <file>`
   - Pre-commit overall: `pre-commit run --all-files`
5. **Pre-commit acknowledgement** — every prompt must include the
   `AGENTS.md` directive that pre-commit must pass before push, and that
   `git commit --amend --no-verify` is **not** allowed.
6. **Branch + PR convention** — Devin should push to
   `devin/<unix-timestamp>-<short-slug>` and open a PR with a
   `chore(<scope>):` or `refactor(<scope>):` prefix per Conventional
   Commits.

The `devin-candidates.md` file lists each migration category alongside
the specific automation-tier classification (fully-automatable vs.
review-assisted vs. human-required) and the exact extra context Devin
needs.
