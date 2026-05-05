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

# Scout Report: vibecodersph/superset (fork of apache/superset)

## Generated: 2026-05-05

> Branch analyzed: `master` (the request specified `main`, but neither
> `apache/superset` nor `vibecodersph/superset` has a `main` branch — both
> use `master` as the default branch). All counts below are on
> `vibecodersph/superset@master` HEAD `dc1c0f6ba1`.

## Executive Summary

The repository is in the middle of several explicitly-declared migrations
(documented in `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/dev-standard.mdc`):

1. Cypress → Playwright (E2E)
2. JavaScript → TypeScript (frontend source)
3. `any` → proper TypeScript types
4. Class components → functional components + hooks
5. Direct `antd` / `@ant-design/icons` imports → `@superset-ui/core` wrappers
6. `describe()`-nested tests → flat `test()` blocks (avoid-nesting)
7. `unittest.TestCase` / `SupersetTestCase` → flat `pytest` functions
8. `typing.Optional` / `Union` / `List` / `Dict` → `X | None` / `list` / `dict`
   (PEP 604 / PEP 585; target is `py310`)
9. Auto-incrementing IDs → UUID columns on production models
10. Untyped `def` in tests → fully-typed `def`
11. Backend `Any` → proper typing
12. `React.FC` / `PropTypes` → typed function props
13. `@ts-ignore` / `@ts-nocheck` cleanup
14. Direct `@emotion/styled` and custom CSS → antd theme tokens

**Hard counts:**

- **Total migration categories found:** 14
- **Total files requiring some migration work:** ~975 unique files
  (627 `.ts/.tsx` with `any`, plus 138 `React.FC`, plus 60 class components,
  plus 31 Cypress tests, plus 89 `SupersetTestCase` files, plus 318 untyped
  test files, plus 193 `Optional` files, plus 16 direct `antd` files, plus
  10 `PropTypes` files, plus 11 `@ant-design/icons`, plus 20 `@ts-ignore`,
  plus 6 UUID-less production models, plus 442 `describe()` test files;
  ranges overlap, so the unique-file count is approximate).
- **Estimated total engineer-hours (manual):** ~1,820 h (≈ 11.4
  engineer-weeks at 40 h/week, see breakdown below)
- **Estimated automation-eligible files:** ~720 files (≈ 74 %) — Tier 1–2
  categories (mechanical type-import rewrites, `Optional → | None`,
  `React.FC` removal, JS→TS configs, missing test type hints,
  `PropTypes` removal, direct antd-import swaps).

## Migration Categories

| # | Category | Files | Occurrences | Complexity | Est. Hours (manual) | Automatable |
|---|----------|-------|-------------|------------|---------------------|-------------|
| 1 | `typing.Optional[X]` → `X \| None` (PEP 604) | 193 | 660 | Tier 1 | 16 | **Yes** (full) |
| 2 | `typing.List/Dict/Tuple/Type` → builtin generics (PEP 585) | ~250 | 584 | Tier 1 | 20 | **Yes** (full) |
| 3 | `React.FC` / `FunctionComponent` removal | 138 | 148 | Tier 1 | 23 | **Yes** (full) |
| 4 | `PropTypes` → TypeScript prop types | 10 | 10 imports | Tier 2–3 | 30 | Partial |
| 5 | Direct `antd` imports → `@superset-ui/core/components` | 16 | 19 | Tier 2 | 16 | **Yes** (full) |
| 6 | Direct `@ant-design/icons` → `src/components/Icons` | 11 | 11 | Tier 2 | 11 | **Yes** (full) |
| 7 | `describe()` nested → flat `test()` (avoid-nesting) | 442 | 1,030 | Tier 2 | 220 | Partial |
| 8 | `@ts-ignore` / `@ts-nocheck` cleanup | 20 | 22 | Tier 2–3 | 30 | Partial |
| 9 | `any` type elimination (frontend) | 627 | 2,045 | Tier 2–3 | 470 | Partial |
| 10 | Untyped Python `def` in `tests/` | 318 | ~3,973 | Tier 2 | 159 | **Yes** (full, with mypy run) |
| 11 | Cypress → Playwright (active tests, 5) | 5 | 31 `it()` | Tier 3 | 60 | Partial (with review) |
| 12 | Cypress → Playwright (`_skip.*`, 26) | 26 | 73 `it()` | Tier 3 | 260 | Partial |
| 13 | Class components → functional + hooks | 60 | 60 classes | Tier 3–4 | 240 | Human |
| 14 | Backend `Any` → proper types (production code) | 227 | 1,324 | Tier 3 | 250 | Partial |
| 15 | UUID columns on production models | 6 | 6 models | Tier 4 | 36 | Human |

(Row 1 + 2 are sometimes lumped together as "PEP 604/585 typing import
modernization"; they're listed separately because the fixes have different
fixers.)

### Categories explicitly verified as already complete

- **Enzyme removal**: 0 files import `enzyme` anywhere.
- **`moment` → `dayjs`**: 0 files import `moment` (8 import `dayjs`).
- **Deprecated React lifecycle methods** (`componentWillMount`,
  `componentWillReceiveProps`, `componentWillUpdate`, `UNSAFE_*`): 0
  occurrences.
- **FontAwesome icons** (custom rule
  `eslint-plugin-icons/no-fa-icons-usage`): 0 occurrences.
- **Hardcoded hex colors / `rgb()` literals**: 1 file with 2 hex literals
  (effectively done; covered by the custom
  `eslint-plugin-theme-colors/no-literal-colors` rule).
- **Backend production type hints** (`superset/` excluding migrations):
  essentially complete — only 7 untyped non-`__init__` `def`s remain across
  2 files (`superset/tasks/decorators.py`, `superset/tasks/context.py`),
  and they are nested helper closures inside docstrings or example code.
- **`tests/` xUnit `self.assertEqual` style → `assert`**: 82 occurrences
  across 20 files; ruff `PT009` is enabled so this is on a known
  decommission path.

## Hour-estimate methodology

- **Tier 1** (mechanical, < 5 min/file): hours = files × 5/60.
- **Tier 2** (predictable, 15–30 min/file): hours = files × 0.4 (avg 24 min).
- **Tier 3** (1–3 hours/file): hours = files × 2.
- **Tier 4** (3–8 hours/file): hours = files × 6.
- **Tier 5** (1–3 days/file): hours = files × 16 (2 days).

For categories where a file appears in multiple categories (e.g. a `.tsx`
file contains both `any` and `React.FC`), the dominant tier wins for the
final unique-file count, and per-category hours are independent (so manual
hours sum slightly overstates effort if you batch fixes per file).

## Existing target-state examples

- **Playwright pages / fixtures**: `superset-frontend/playwright/pages/*.ts`,
  `superset-frontend/playwright/components/**/*.ts`,
  `superset-frontend/playwright/helpers/api/*.ts` — page-object pattern with
  helper API requests is the canonical Playwright target.
- **Functional component with hooks**: `superset-frontend/src/components/CrudThemeProvider.tsx`,
  most `superset-frontend/src/components/ListView/*.tsx`.
- **Flat `test()` style**: `superset-frontend/src/filters/components/Select/controlPanel.test.ts`.
- **Pytest flat function style**: `tests/unit_tests/dao/base_dao_test.py`,
  `tests/unit_tests/datasets/commands/importers/v1/import_test.py`.
- **UUID-bearing model**: `superset/models/dashboard.py` (uses
  `ImportExportMixin` which inherits `UUIDMixin` defined in
  `superset/models/helpers.py`).
- **`@superset-ui/core` antd wrapper consumer**: e.g.
  `superset-frontend/src/SqlLab/components/SqlEditor/index.tsx` imports
  `Tooltip`, `Modal`, `Button` etc. from `@superset-ui/core/components`
  rather than `antd`.

## See also

- `playbook.md` — wave-ordered execution plan with per-category prompt
  templates and per-file tier assignments for representative samples.
- `devin-candidates.md` — categorized lists of files suitable for fully
  automated, review-assisted, and human-required migration.
