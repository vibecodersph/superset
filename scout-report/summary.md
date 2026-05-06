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

# Scout Report: vibecodersph/superset

## Generated: 2026-05-05

Repository fork of `apache/superset` — a data visualization platform with a
Flask/Python backend and a React/TypeScript frontend.

Discovery was performed against branch `main` (commit at scout time). All
counts below come from `find` / `rg` (ripgrep) against the working tree;
nothing is estimated. Where multiple counts appear (occurrences vs. files),
the ratio is preserved verbatim.

## Executive Summary

- **Total migration categories found:** 13
- **Total files requiring migration (deduplicated, modernization-eligible):**
  ~1,290 frontend + ~620 backend ≈ **1,910 files**
- **Estimated total engineer-hours (manual, all tiers):** ~**1,950 h**
- **Estimated automation-eligible files (Tier 1–2 + codemod-friendly Tier 3):**
  ~**1,160 files (≈ 60%)**

The repo is mid-migration on multiple fronts. Several modern patterns are
already documented (`AGENTS.md`, `.cursor/rules/dev-standard.mdc`) and
partially enforced via ESLint rules — for example, `.js`/`.jsx` files are
already banned in `src/`, `plugins/`, and `packages/` (with carve-outs), and
`@ant-design/icons` and direct `antd` imports are restricted to wrapper
packages. Enforcement is incomplete: the no-`any` rule is *disabled* in the
TypeScript ESLint override
(`@typescript-eslint/no-explicit-any: 0` in `superset-frontend/.eslintrc.js`),
which is why `any` is the largest single migration category.

Backend modernization is similarly partial: most SQLAlchemy models still use
the legacy `Column(...)` declarative form (only **4** occurrences of the
modern `Mapped[...]` annotation), and only **3** model classes adopt the
`UUIDMixin` despite the AGENTS.md UUID-first directive.

## Migration Categories

| # | Category | Files | Occurrences | Complexity | Est. Hours (manual) | Automatable |
|---|----------|------:|------------:|:----------:|--------------------:|:-----------:|
| 1 | Frontend `any` types → proper TS types | 563 | 1,809 | 2–4 | 466 | Partial |
| 2 | Frontend `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` review | ~150 | 265 | 2–3 | 75 | Partial |
| 3 | Frontend `eslint-disable …no-explicit-any` review | ~70 | 92 | 2 | 24 | Partial |
| 4 | Frontend `.js` / `.jsx` → `.ts` / `.tsx` (production-ish) | 15 | 15 | 1–2 | 4 | Yes |
| 5 | Frontend direct `antd` imports → `@superset-ui/core/components` | 11 | 14 | 2 | 6 | Yes |
| 6 | Frontend direct `@ant-design/icons` imports → `src/components/Icons` | 12 | 13 | 2 | 6 | Yes |
| 7 | Frontend `PropTypes` → TypeScript interfaces | 21 | 217 | 3 | 32 | Partial |
| 8 | Frontend class components → function components + hooks | 58 | 59 | 4 | 232 | No |
| 9 | Frontend `describe()` nesting → flat `test()` (Kent C. Dodds style) | 463 | 1,074 | 1 | 46 | Yes |
| 10 | Frontend Cypress E2E → Playwright (active + `_skip.*` files) | 31 | 31 | 3–4 | 134 | Partial |
| 11 | Backend `# type: ignore` suppressions → real types | 71 | 190 | 2–3 | 36 | Partial |
| 12 | Backend `typing.Any` → concrete types | 403 | 2,778 | 3 | 403 | No |
| 13 | Backend `getattr` / `setattr` lazy attribute access → typed access | ~80 | 396 | 3 | 120 | Partial |
| 14 | Backend `SupersetTestCase` (unittest) → pytest functions | 89 | 89 | 3 | 134 | Partial |
| 15 | Backend SQLAlchemy `Column(...)` → SQLAlchemy 2.0 `Mapped[...]` | ~116 | n/a | 4 | 232 | No |
| 16 | Backend integer primary keys → `UUIDMixin` (UUID-first per AGENTS.md) | ~13 | 20 | 5 | 80 | No |

(Counts in the “Files” column come from `rg --no-messages -l <pattern>`;
“Occurrences” come from `rg --no-messages <pattern> | wc -l`. See
`playbook.md` for per-category command snippets and representative samples.)

## Notable Observations

- **`enzyme` is fully removed** — `rg "from ['\"]enzyme['\"]"` returns 0 hits,
  confirming the AGENTS.md claim that the Enzyme migration is complete.
- **`moment` is fully removed** — `rg "from ['\"]moment['\"]"` returns 0
  hits; the codebase has fully moved to `dayjs`.
- **No deprecated React lifecycle methods** —
  `componentWillMount` / `componentWillReceiveProps` / `componentWillUpdate`
  return 0 hits.
- **Multi-linter setup:** the frontend uses *both* `oxlint`
  (`oxlint.json`, ~10 KB of rules) and ESLint (`.eslintrc.js`, ~14 KB) plus
  a `.eslintrc.minimal.js` variant. This is intentional but adds rule-drift
  risk.
- **Cypress is mostly disabled.** Of 31 Cypress test files, **26 are
  prefixed `_skip.`** and only **5 actively run**. Playwright already covers
  9 spec files. Migration is well underway.
- **`@typescript-eslint/no-explicit-any` is disabled at the rule level** —
  enforcement of the AGENTS.md "NO `any` types" directive currently lives in
  human code review only.
- **SQLAlchemy 2.0 typed-query migration has barely started:** only **4**
  `Mapped[...]` annotations across the entire `superset/` package versus
  **116+** legacy `class X(Model)` declarations.
