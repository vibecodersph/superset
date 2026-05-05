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

# Frontend `any` Types — Full File List

Companion to `scout-report/playbook.md` § "1. Frontend `any` types →
proper TS types". Lists every TypeScript file under
`superset-frontend/` (excluding `node_modules/`, `dist/`, `build/`,
`coverage/`) that contains at least one occurrence of the patterns
`: any`, `: any[]`, `<any>`, or `as any`.

## Counts

- **563 files** match.
- **1,809 total occurrences.**
- **196 files / 864 occurrences** in test code (broad definition: any
  file matching `.test.`, `.spec.`, `/test/`, `/spec/`, or
  `/__tests__/` in its path).
- **367 files / 945 occurrences** in production code.

(The narrower split reported in `summary.md` — 193 test / 370
production files — uses only `*.test.ts(x)` filename matching. The
broader split here picks up files inside `test/` directories that hold
support code rather than the test entry point itself, e.g. echarts
plugin test fixtures. The total of 563 / 1,809 is identical under
both definitions.)

## Tier Distribution

| Tier | Files | Occurrences |
|:----:|------:|------------:|
| 2 — Simple (test files OR < 5 prod occurrences) | 513 | 1,415 |
| 3 — Medium (prod, 5–19 occurrences) | 49 | 372 |
| 4 — Complex (prod, ≥ 20 occurrences) | 1 | 22 |

## Tier Assignment Rules

| Condition | Tier |
|-----------|:----:|
| File is a test file (path matches `.test.` / `.spec.` / `/test/` / `/spec/` / `/__tests__/`) | 2 |
| Production file with **≥ 20** `any` occurrences | 4 |
| Production file with **5–19** `any` occurrences | 3 |
| Production file with **1–4** `any` occurrences | 2 |

Test files default to Tier 2 because the conversion is mechanical
(replace `as any` casts with the actual fixture type, usually already
imported from `@superset-ui/core` or the file under test). Production
files with high occurrence density (Tier 4) imply the `any` is
load-bearing across multiple call sites and the reviewer needs to make
type-system-wide decisions.

## Reproduction

```bash
cd superset-frontend
rg --no-messages -g '*.ts' -g '*.tsx' \
   -g '!node_modules' -g '!dist' -g '!build' -g '!coverage' \
   -c ': any\b|: any\[\]|<any>|as any\b' \
  | sort -t: -k2 -nr
```

## Full File List

Sorted by occurrence count (descending). `Test? = Y` indicates the
broad-definition test classification (path-based).

| # | File | Occurrences | Test? | Tier |
|--:|------|------------:|:-----:|:----:|
| 1 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformers.test.ts` | 31 | Y | 2 |
| 2 | `superset-frontend/plugins/plugin-chart-echarts/test/Heatmap/transformProps.test.ts` | 27 | Y | 2 |
| 3 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/transformProps.test.ts` | 25 | Y | 2 |
| 4 | `superset-frontend/src/utils/downloadAsImage.test.ts` | 23 | Y | 2 |
| 5 | `superset-frontend/src/explore/components/controls/MetricControl/MetricsControl.tsx` | 22 | N | 4 |
| 6 | `superset-frontend/plugins/plugin-chart-echarts/test/Gauge/transformProps.test.ts` | 22 | Y | 2 |
| 7 | `superset-frontend/src/dashboard/components/nativeFilters/selectors.test.ts` | 21 | Y | 2 |
| 8 | `superset-frontend/src/dashboard/components/SliceHeaderControls/SliceHeaderControls.test.tsx` | 21 | Y | 2 |
| 9 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Bar/transformProps.test.ts` | 21 | Y | 2 |
| 10 | `superset-frontend/src/features/roles/utils.test.ts` | 19 | Y | 2 |
| 11 | `superset-frontend/plugins/plugin-chart-echarts/test/MixedTimeseries/transformProps.test.ts` | 18 | Y | 2 |
| 12 | `superset-frontend/plugins/plugin-chart-ag-grid-table/test/utils/filterStateManager.test.ts` | 18 | Y | 2 |
| 13 | `superset-frontend/packages/superset-ui-core/src/chart/components/StatefulChart.test.tsx` | 16 | Y | 2 |
| 14 | `superset-frontend/src/features/reports/ReportModal/actions.test.ts` | 15 | Y | 2 |
| 15 | `superset-frontend/src/explore/actions/saveModalActions.test.ts` | 15 | Y | 2 |
| 16 | `superset-frontend/plugins/legacy-plugin-chart-world-map/test/WorldMap.test.ts` | 15 | Y | 2 |
| 17 | `superset-frontend/packages/superset-ui-core/src/components/Table/utils/InteractiveTableUtils.test.ts` | 15 | Y | 2 |
| 18 | `superset-frontend/src/extensions/ExtensionsStartup.test.tsx` | 14 | Y | 2 |
| 19 | `superset-frontend/src/core/sqlLab/index.ts` | 14 | N | 3 |
| 20 | `superset-frontend/src/components/ListView/utils.ts` | 14 | N | 3 |
| 21 | `superset-frontend/src/pages/UsersList/index.tsx` | 13 | N | 3 |
| 22 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Polygon/buildQuery.test.ts` | 13 | Y | 2 |
| 23 | `superset-frontend/plugins/plugin-chart-pivot-table/src/react-pivottable/utilities.ts` | 13 | N | 3 |
| 24 | `superset-frontend/src/hooks/apiResources/datasets.test.ts` | 12 | Y | 2 |
| 25 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Bar/controlPanel.test.ts` | 12 | Y | 2 |
| 26 | `superset-frontend/src/views/CRUD/utils.tsx` | 11 | N | 3 |
| 27 | `superset-frontend/src/theme/tests/ThemeController.test.ts` | 11 | Y | 2 |
| 28 | `superset-frontend/src/features/alerts/AlertReportModal.tsx` | 11 | N | 3 |
| 29 | `superset-frontend/src/dashboard/components/nativeFilters/selectors.ts` | 11 | N | 3 |
| 30 | `superset-frontend/packages/superset-ui-core/src/chart/components/Matrixify/MatrixifyGridRenderer.test.tsx` | 11 | Y | 2 |
| 31 | `superset-frontend/src/dashboard/util/dropOverflowsParent.test.ts` | 10 | Y | 2 |
| 32 | `superset-frontend/src/dashboard/components/dnd/DragDroppable.test.tsx` | 10 | Y | 2 |
| 33 | `superset-frontend/src/components/SQLEditorWithValidation/SQLEditorWithValidation.test.tsx` | 10 | Y | 2 |
| 34 | `superset-frontend/src/components/Datasource/components/CollectionTable/index.tsx` | 10 | N | 3 |
| 35 | `superset-frontend/src/SqlLab/actions/sqlLab.test.ts` | 10 | Y | 2 |
| 36 | `superset-frontend/packages/superset-ui-chart-controls/test/shared-controls/shouldMapStateToProps.test.tsx` | 10 | Y | 2 |
| 37 | `superset-frontend/src/pages/QueryHistoryList/index.tsx` | 9 | N | 3 |
| 38 | `superset-frontend/src/pages/ChartList/index.tsx` | 9 | N | 3 |
| 39 | `superset-frontend/src/pages/AlertReportList/index.tsx` | 9 | N | 3 |
| 40 | `superset-frontend/src/explore/components/controls/MatrixifyDimensionControl.tsx` | 9 | N | 3 |
| 41 | `superset-frontend/src/dashboard/components/PropertiesModal/PropertiesModal.test.tsx` | 9 | Y | 2 |
| 42 | `superset-frontend/plugins/preset-chart-deckgl/src/utilities/tooltipUtils.tsx` | 9 | N | 3 |
| 43 | `superset-frontend/plugins/plugin-chart-echarts/src/Timeseries/transformProps.ts` | 9 | N | 3 |
| 44 | `superset-frontend/src/pages/ThemeList/index.tsx` | 8 | N | 3 |
| 45 | `superset-frontend/src/pages/DatabaseList/index.tsx` | 8 | N | 3 |
| 46 | `superset-frontend/src/pages/ActionLog/index.tsx` | 8 | N | 3 |
| 47 | `superset-frontend/src/features/databases/types.ts` | 8 | N | 3 |
| 48 | `superset-frontend/src/explore/components/SaveModal.test.tsx` | 8 | Y | 2 |
| 49 | `superset-frontend/src/explore/components/ExploreViewContainer/index.tsx` | 8 | N | 3 |
| 50 | `superset-frontend/src/dashboard/components/gridComponents/Chart/Chart.test.tsx` | 8 | Y | 2 |
| 51 | `superset-frontend/src/components/ListView/ListView.tsx` | 8 | N | 3 |
| 52 | `superset-frontend/src/SqlLab/reducers/sqlLab.ts` | 8 | N | 3 |
| 53 | `superset-frontend/plugins/plugin-chart-echarts/test/Pie/transformProps.test.ts` | 8 | Y | 2 |
| 54 | `superset-frontend/packages/superset-ui-core/src/ui-overrides/types.ts` | 8 | N | 3 |
| 55 | `superset-frontend/packages/superset-core/src/theme/Theme.test.tsx` | 8 | Y | 2 |
| 56 | `superset-frontend/src/visualizations/TimeTable/config/controlPanel/controlPanel.test.ts` | 7 | Y | 2 |
| 57 | `superset-frontend/src/pages/UserRegistrations/index.tsx` | 7 | N | 3 |
| 58 | `superset-frontend/src/pages/DatasetList/index.tsx` | 7 | N | 3 |
| 59 | `superset-frontend/src/features/databases/DatabaseModal/index.tsx` | 7 | N | 3 |
| 60 | `superset-frontend/src/dashboard/util/charts/getFormDataWithExtraFilters.ts` | 7 | N | 3 |
| 61 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/transformUtils.test.ts` | 7 | Y | 2 |
| 62 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Contour/Contour.tsx` | 7 | N | 3 |
| 63 | `superset-frontend/plugins/preset-chart-deckgl/src/Multi/controlPanel.test.ts` | 7 | Y | 2 |
| 64 | `superset-frontend/plugins/plugin-chart-table/test/TableChart.test.tsx` | 7 | Y | 2 |
| 65 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/util/controlPanelUtil.tsx` | 7 | N | 3 |
| 66 | `superset-frontend/src/pages/SavedQueryList/index.tsx` | 6 | N | 3 |
| 67 | `superset-frontend/src/pages/GroupsList/index.tsx` | 6 | N | 3 |
| 68 | `superset-frontend/src/pages/DashboardList/index.tsx` | 6 | N | 3 |
| 69 | `superset-frontend/src/explore/controlUtils/standardizedFormData.ts` | 6 | N | 3 |
| 70 | `superset-frontend/src/explore/components/controls/ZoomConfigControl/types.ts` | 6 | N | 3 |
| 71 | `superset-frontend/src/explore/components/controls/DndColumnSelectControl/DndColumnMetricSelect.tsx` | 6 | N | 3 |
| 72 | `superset-frontend/src/embedded/utils.test.ts` | 6 | Y | 2 |
| 73 | `superset-frontend/src/dashboard/components/SliceHeaderControls/index.tsx` | 6 | N | 3 |
| 74 | `superset-frontend/src/dashboard/actions/dashboardState.test.ts` | 6 | Y | 2 |
| 75 | `superset-frontend/src/components/Datasource/types.ts` | 6 | N | 3 |
| 76 | `superset-frontend/plugins/preset-chart-deckgl/src/utilities/Shared_DeckGL.tsx` | 6 | N | 3 |
| 77 | `superset-frontend/plugins/plugin-chart-echarts/test/Gantt/transformProps.test.ts` | 6 | Y | 2 |
| 78 | `superset-frontend/packages/superset-ui-core/test/time-comparison/getTimeOffset.test.ts` | 6 | Y | 2 |
| 79 | `superset-frontend/packages/superset-ui-core/test/connection/SupersetClientClass.test.ts` | 6 | Y | 2 |
| 80 | `superset-frontend/packages/superset-ui-core/src/components/Table/Table.stories.tsx` | 6 | N | 3 |
| 81 | `superset-frontend/src/pages/RolesList/index.tsx` | 5 | N | 3 |
| 82 | `superset-frontend/src/pages/ExecutionLogList/index.tsx` | 5 | N | 3 |
| 83 | `superset-frontend/src/hooks/apiResources/apiResources.test.ts` | 5 | Y | 2 |
| 84 | `superset-frontend/src/features/datasets/DatasetLayout/index.tsx` | 5 | N | 3 |
| 85 | `superset-frontend/src/features/alerts/types.ts` | 5 | N | 3 |
| 86 | `superset-frontend/src/features/alerts/AlertReportModal.test.tsx` | 5 | Y | 2 |
| 87 | `superset-frontend/src/explore/components/controls/DndColumnSelectControl/DndMetricSelect.test.tsx` | 5 | Y | 2 |
| 88 | `superset-frontend/src/explore/components/SaveModal.tsx` | 5 | N | 3 |
| 89 | `superset-frontend/src/dashboard/util/activeAllDashboardFilters.ts` | 5 | N | 3 |
| 90 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/ColumnSelect.test.tsx` | 5 | Y | 2 |
| 91 | `superset-frontend/src/dashboard/components/SliceHeader/SliceHeader.test.tsx` | 5 | Y | 2 |
| 92 | `superset-frontend/src/components/Datasource/components/DatasourceEditor/components/DatasetUsageTab/DatasetUsageTab.test.tsx` | 5 | Y | 2 |
| 93 | `superset-frontend/src/SqlLab/reducers/sqlLab.test.ts` | 5 | Y | 2 |
| 94 | `superset-frontend/plugins/preset-chart-deckgl/src/utils.test.ts` | 5 | Y | 2 |
| 95 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Path/Path.tsx` | 5 | N | 3 |
| 96 | `superset-frontend/plugins/plugin-chart-table/src/TableChart.tsx` | 5 | N | 3 |
| 97 | `superset-frontend/plugins/plugin-chart-point-cluster-map/src/controlPanel.ts` | 5 | N | 3 |
| 98 | `superset-frontend/plugins/plugin-chart-ag-grid-table/test/utils/agGridFilterConverter.test.ts` | 5 | Y | 2 |
| 99 | `superset-frontend/packages/superset-ui-switchboard/src/switchboard.test.ts` | 5 | Y | 2 |
| 100 | `superset-frontend/packages/superset-ui-core/src/components/ThemedAgGridReact/setupAGGridModules.test.ts` | 5 | Y | 2 |
| 101 | `superset-frontend/packages/superset-ui-core/src/components/Table/VirtualTable.tsx` | 5 | N | 3 |
| 102 | `superset-frontend/packages/superset-ui-chart-controls/src/shared-controls/matrixifyControls.tsx` | 5 | N | 3 |
| 103 | `superset-frontend/packages/superset-core/src/translation/Translator.test.ts` | 5 | Y | 2 |
| 104 | `superset-frontend/src/visualizations/TimeTable/utils/sortUtils/sortUtils.ts` | 4 | N | 2 |
| 105 | `superset-frontend/src/views/routes.tsx` | 4 | N | 2 |
| 106 | `superset-frontend/src/utils/fetchOptions.ts` | 4 | N | 2 |
| 107 | `superset-frontend/src/pages/Tags/index.tsx` | 4 | N | 2 |
| 108 | `superset-frontend/src/pages/DashboardList/DashboardList.testHelpers.tsx` | 4 | N | 2 |
| 109 | `superset-frontend/src/pages/DashboardList/DashboardList.permissions.test.tsx` | 4 | Y | 2 |
| 110 | `superset-frontend/src/pages/ChartList/ChartList.permissions.test.tsx` | 4 | Y | 2 |
| 111 | `superset-frontend/src/pages/AlertReportList/AlertReportList.test.tsx` | 4 | Y | 2 |
| 112 | `superset-frontend/src/middleware/asyncEvent.ts` | 4 | N | 2 |
| 113 | `superset-frontend/src/features/home/types.ts` | 4 | N | 2 |
| 114 | `superset-frontend/src/features/databases/UploadDataModel/index.tsx` | 4 | N | 2 |
| 115 | `superset-frontend/src/features/databases/UploadDataModel/UploadDataModal.test.tsx` | 4 | Y | 2 |
| 116 | `superset-frontend/src/explore/store.ts` | 4 | N | 2 |
| 117 | `superset-frontend/src/explore/components/controls/MatrixifyDimensionControl.test.tsx` | 4 | Y | 2 |
| 118 | `superset-frontend/src/explore/components/DataTableControl/index.tsx` | 4 | N | 2 |
| 119 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/types.ts` | 4 | N | 2 |
| 120 | `superset-frontend/src/dashboard/components/gridComponents/Markdown/Markdown.test.tsx` | 4 | Y | 2 |
| 121 | `superset-frontend/src/dashboard/components/gridComponents/ChartHolder/ChartHolder.test.tsx` | 4 | Y | 2 |
| 122 | `superset-frontend/src/dashboard/components/dnd/dragDroppableConfig.ts` | 4 | N | 2 |
| 123 | `superset-frontend/src/core/commands/index.ts` | 4 | N | 2 |
| 124 | `superset-frontend/src/components/ListView/types.ts` | 4 | N | 2 |
| 125 | `superset-frontend/src/components/Datasource/FoldersEditor/treeUtils.test.ts` | 4 | Y | 2 |
| 126 | `superset-frontend/src/components/Datasource/ChangeDatasourceModal/index.tsx` | 4 | N | 2 |
| 127 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/spatialUtils.test.ts` | 4 | Y | 2 |
| 128 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/common.tsx` | 4 | N | 2 |
| 129 | `superset-frontend/plugins/plugin-chart-table/src/DataTable/DataTable.tsx` | 4 | N | 2 |
| 130 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Scatter/transformProps.test.ts` | 4 | Y | 2 |
| 131 | `superset-frontend/plugins/plugin-chart-echarts/src/Bubble/transformProps.ts` | 4 | N | 2 |
| 132 | `superset-frontend/plugins/plugin-chart-echarts/src/BigNumber/BigNumberPeriodOverPeriod/PopKPI.tsx` | 4 | N | 2 |
| 133 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/util/transformPropsUtil.ts` | 4 | N | 2 |
| 134 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/types.ts` | 4 | N | 2 |
| 135 | `superset-frontend/packages/superset-ui-core/src/query/types/Metric.ts` | 4 | N | 2 |
| 136 | `superset-frontend/packages/superset-ui-core/src/query/types/Column.ts` | 4 | N | 2 |
| 137 | `superset-frontend/packages/superset-ui-core/src/components/TableView/TableView.tsx` | 4 | N | 2 |
| 138 | `superset-frontend/packages/superset-ui-core/src/chart/components/StatefulChart.tsx` | 4 | N | 2 |
| 139 | `superset-frontend/packages/superset-ui-core/src/chart/components/Matrixify/MatrixifyGridCell.tsx` | 4 | N | 2 |
| 140 | `superset-frontend/packages/superset-ui-chart-controls/src/types.ts` | 4 | N | 2 |
| 141 | `superset-frontend/src/visualizations/TimeTable/types.ts` | 3 | N | 2 |
| 142 | `superset-frontend/src/views/CRUD/hooks.test.tsx` | 3 | Y | 2 |
| 143 | `superset-frontend/src/utils/localStorageHelpers.ts` | 3 | N | 2 |
| 144 | `superset-frontend/src/types/bootstrapTypes.ts` | 3 | N | 2 |
| 145 | `superset-frontend/src/pages/ChartList/ChartList.testHelpers.tsx` | 3 | N | 2 |
| 146 | `superset-frontend/src/pages/AnnotationLayerList/index.tsx` | 3 | N | 2 |
| 147 | `superset-frontend/src/hooks/useUnsavedChangesPrompt/useUnsavedChangesPrompt.test.tsx` | 3 | Y | 2 |
| 148 | `superset-frontend/src/features/rls/RowLevelSecurityModal.tsx` | 3 | N | 2 |
| 149 | `superset-frontend/src/features/datasets/AddDataset/DatasetPanel/types.ts` | 3 | N | 2 |
| 150 | `superset-frontend/src/explore/exploreUtils/shouldUseLegacyApi.test.ts` | 3 | Y | 2 |
| 151 | `superset-frontend/src/explore/controlUtils/getControlState.ts` | 3 | N | 2 |
| 152 | `superset-frontend/src/explore/components/controls/ZoomConfigControl/ZoomConfigsChart.tsx` | 3 | N | 2 |
| 153 | `superset-frontend/src/explore/components/controls/ContourControl/types.ts` | 3 | N | 2 |
| 154 | `superset-frontend/src/dashboard/reducers/nativeFilters.test.ts` | 3 | Y | 2 |
| 155 | `superset-frontend/src/dashboard/components/nativeFilters/utils.test.ts` | 3 | Y | 2 |
| 156 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/FilterControls/utils.ts` | 3 | N | 2 |
| 157 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/FilterControls/FilterControlShared.tsx` | 3 | N | 2 |
| 158 | `superset-frontend/src/dashboard/components/menu/WithPopoverMenu.tsx` | 3 | N | 2 |
| 159 | `superset-frontend/src/dashboard/components/gridComponents/Tab/Tab.test.tsx` | 3 | Y | 2 |
| 160 | `superset-frontend/src/dashboard/components/gridComponents/Column/Column.test.tsx` | 3 | Y | 2 |
| 161 | `superset-frontend/src/dashboard/components/SliceAdder.test.tsx` | 3 | Y | 2 |
| 162 | `superset-frontend/src/dashboard/components/PropertiesModal/sections/BasicInfoSection.test.tsx` | 3 | Y | 2 |
| 163 | `superset-frontend/src/dashboard/components/EmbeddedModal/EmbeddedModal.test.tsx` | 3 | Y | 2 |
| 164 | `superset-frontend/src/dashboard/components/ColorSchemeSelect.tsx` | 3 | N | 2 |
| 165 | `superset-frontend/src/components/ListView/CardCollection.tsx` | 3 | N | 2 |
| 166 | `superset-frontend/src/components/GridTable/HeaderMenu.test.tsx` | 3 | Y | 2 |
| 167 | `superset-frontend/src/components/GridTable/Header.test.tsx` | 3 | Y | 2 |
| 168 | `superset-frontend/src/components/Chart/ChartContextMenu/useContextMenu.tsx` | 3 | N | 2 |
| 169 | `superset-frontend/src/components/Chart/ChartContextMenu/ChartContextMenu.tsx` | 3 | N | 2 |
| 170 | `superset-frontend/src/SqlLab/components/EditorWrapper/useKeywords.ts` | 3 | N | 2 |
| 171 | `superset-frontend/spec/helpers/shim.tsx` | 3 | N | 2 |
| 172 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/common.test.ts` | 3 | Y | 2 |
| 173 | `superset-frontend/plugins/plugin-chart-point-cluster-map/src/transformProps.ts` | 3 | N | 2 |
| 174 | `superset-frontend/plugins/plugin-chart-handlebars/src/components/Handlebars/HandlebarsViewer.tsx` | 3 | N | 2 |
| 175 | `superset-frontend/plugins/plugin-chart-echarts/test/Radar/transformProps.test.ts` | 3 | Y | 2 |
| 176 | `superset-frontend/plugins/plugin-chart-echarts/test/Graph/transformProps.test.ts` | 3 | Y | 2 |
| 177 | `superset-frontend/plugins/plugin-chart-echarts/test/Funnel/transformProps.test.ts` | 3 | Y | 2 |
| 178 | `superset-frontend/plugins/plugin-chart-echarts/test/Bubble/transformProps.test.ts` | 3 | Y | 2 |
| 179 | `superset-frontend/plugins/plugin-chart-echarts/test/BigNumber/transformProps.test.ts` | 3 | Y | 2 |
| 180 | `superset-frontend/plugins/plugin-chart-echarts/src/utils/series.ts` | 3 | N | 2 |
| 181 | `superset-frontend/plugins/plugin-chart-echarts/src/utils/eventHandlers.ts` | 3 | N | 2 |
| 182 | `superset-frontend/plugins/plugin-chart-echarts/src/MixedTimeseries/transformProps.ts` | 3 | N | 2 |
| 183 | `superset-frontend/plugins/plugin-chart-echarts/src/BigNumber/BigNumberTotal/controlPanel.test.ts` | 3 | Y | 2 |
| 184 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/components/ChartLayer.tsx` | 3 | N | 2 |
| 185 | `superset-frontend/plugins/plugin-chart-ag-grid-table/test/utils/getInitialFilterModel.test.ts` | 3 | Y | 2 |
| 186 | `superset-frontend/packages/superset-ui-core/test/dynamic-plugins/shared-modules.test.ts` | 3 | Y | 2 |
| 187 | `superset-frontend/packages/superset-ui-core/test/color/LabelsColorMapSingleton.test.ts` | 3 | Y | 2 |
| 188 | `superset-frontend/packages/superset-ui-core/src/query/types/Dashboard.ts` | 3 | N | 2 |
| 189 | `superset-frontend/packages/superset-ui-core/src/components/SafeMarkdown/SafeMarkdown.tsx` | 3 | N | 2 |
| 190 | `superset-frontend/packages/superset-ui-core/src/components/Form/types.ts` | 3 | N | 2 |
| 191 | `superset-frontend/packages/superset-ui-core/src/chart/types/Base.ts` | 3 | N | 2 |
| 192 | `superset-frontend/packages/superset-ui-core/src/chart/components/Matrixify/MatrixifyGridRenderer.tsx` | 3 | N | 2 |
| 193 | `superset-frontend/packages/superset-ui-chart-controls/src/components/labelUtils.tsx` | 3 | N | 2 |
| 194 | `superset-frontend/packages/superset-core/src/commands/index.ts` | 3 | N | 2 |
| 195 | `superset-frontend/src/views/CRUD/hooks.ts` | 2 | N | 2 |
| 196 | `superset-frontend/src/utils/functionalRegistry.ts` | 2 | N | 2 |
| 197 | `superset-frontend/src/utils/cachedSupersetGet.test.ts` | 2 | Y | 2 |
| 198 | `superset-frontend/src/theme/utils/themeStructureValidation.test.ts` | 2 | Y | 2 |
| 199 | `superset-frontend/src/setup/setupApp.ts` | 2 | N | 2 |
| 200 | `superset-frontend/src/reduxUtils.ts` | 2 | N | 2 |
| 201 | `superset-frontend/src/pages/TaskList/index.tsx` | 2 | N | 2 |
| 202 | `superset-frontend/src/pages/RowLevelSecurityList/index.tsx` | 2 | N | 2 |
| 203 | `superset-frontend/src/pages/FileHandler/index.test.tsx` | 2 | Y | 2 |
| 204 | `superset-frontend/src/pages/DashboardList/DashboardList.test.tsx` | 2 | Y | 2 |
| 205 | `superset-frontend/src/pages/DashboardList/DashboardList.behavior.test.tsx` | 2 | Y | 2 |
| 206 | `superset-frontend/src/pages/CssTemplateList/index.tsx` | 2 | N | 2 |
| 207 | `superset-frontend/src/pages/ChartCreation/ChartCreation.test.tsx` | 2 | Y | 2 |
| 208 | `superset-frontend/src/pages/AnnotationList/index.tsx` | 2 | N | 2 |
| 209 | `superset-frontend/src/filters/components/TimeGrain/TimeGrainPreFilter.integration.test.tsx` | 2 | Y | 2 |
| 210 | `superset-frontend/src/filters/components/Select/types.ts` | 2 | N | 2 |
| 211 | `superset-frontend/src/features/roles/RoleListDuplicateModal.test.tsx` | 2 | Y | 2 |
| 212 | `superset-frontend/src/features/roles/RoleListAddModal.test.tsx` | 2 | Y | 2 |
| 213 | `superset-frontend/src/features/rls/types.ts` | 2 | N | 2 |
| 214 | `superset-frontend/src/features/home/RightMenu.tsx` | 2 | N | 2 |
| 215 | `superset-frontend/src/features/home/ActivityTable.tsx` | 2 | N | 2 |
| 216 | `superset-frontend/src/features/databases/DatabaseModal/index.test.tsx` | 2 | Y | 2 |
| 217 | `superset-frontend/src/features/databases/DatabaseModal/DatabaseConnectionForm/TableCatalog.tsx` | 2 | N | 2 |
| 218 | `superset-frontend/src/extensions/ExtensionsLoader.ts` | 2 | N | 2 |
| 219 | `superset-frontend/src/extensions/ExtensionsLoader.test.ts` | 2 | Y | 2 |
| 220 | `superset-frontend/src/explore/components/controls/TextAreaControl.tsx` | 2 | N | 2 |
| 221 | `superset-frontend/src/explore/components/controls/MetricControl/MetricDefinitionOption.tsx` | 2 | N | 2 |
| 222 | `superset-frontend/src/explore/components/controls/MatrixifyControl/utils/fetchTopNValues.ts` | 2 | N | 2 |
| 223 | `superset-frontend/src/explore/components/controls/LayerConfigsControl/LayerConfigsPopoverContent.tsx` | 2 | N | 2 |
| 224 | `superset-frontend/src/explore/components/controls/DndColumnSelectControl/DndMetricSelect.tsx` | 2 | N | 2 |
| 225 | `superset-frontend/src/explore/components/controls/DndColumnSelectControl/ColumnSelectPopoverTrigger.tsx` | 2 | N | 2 |
| 226 | `superset-frontend/src/explore/components/controls/DateFilterControl/components/DateFunctionTooltip.tsx` | 2 | N | 2 |
| 227 | `superset-frontend/src/explore/components/controls/DatasourceControl/DatasourceControl.test.tsx` | 2 | Y | 2 |
| 228 | `superset-frontend/src/explore/components/controls/ControlPopover/ControlPopover.test.tsx` | 2 | Y | 2 |
| 229 | `superset-frontend/src/explore/components/controls/ConditionalFormattingControl/FormattingPopoverContent.tsx` | 2 | N | 2 |
| 230 | `superset-frontend/src/explore/components/controls/ColorSchemeControl/ColorSchemeControl.test.tsx` | 2 | Y | 2 |
| 231 | `superset-frontend/src/explore/components/controls/CollectionControl/CollectionControl.test.tsx` | 2 | Y | 2 |
| 232 | `superset-frontend/src/explore/components/PropertiesModal/index.tsx` | 2 | N | 2 |
| 233 | `superset-frontend/src/explore/components/ExploreChartHeader/ExploreChartHeader.test.tsx` | 2 | Y | 2 |
| 234 | `superset-frontend/src/explore/components/DatasourcePanel/types.ts` | 2 | N | 2 |
| 235 | `superset-frontend/src/explore/components/ControlPanelsContainer.tsx` | 2 | N | 2 |
| 236 | `superset-frontend/src/explore/components/Control.tsx` | 2 | N | 2 |
| 237 | `superset-frontend/src/explore/actions/exploreActions.ts` | 2 | N | 2 |
| 238 | `superset-frontend/src/database/types.ts` | 2 | N | 2 |
| 239 | `superset-frontend/src/dashboard/util/useFilterFocusHighlightStyles.test.tsx` | 2 | Y | 2 |
| 240 | `superset-frontend/src/dashboard/util/buildFilterScopeTreeEntry.ts` | 2 | N | 2 |
| 241 | `superset-frontend/src/dashboard/reducers/dashboardLayout.test.ts` | 2 | Y | 2 |
| 242 | `superset-frontend/src/dashboard/containers/SliceAdder.tsx` | 2 | N | 2 |
| 243 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/utils.ts` | 2 | N | 2 |
| 244 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/utils.ts` | 2 | N | 2 |
| 245 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/FilterScope/ScopingTree.tsx` | 2 | N | 2 |
| 246 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/FilterScope/FilterScope.tsx` | 2 | N | 2 |
| 247 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/FilterControls/FilterControls.test.tsx` | 2 | Y | 2 |
| 248 | `superset-frontend/src/dashboard/components/menu/DownloadMenuItems/index.tsx` | 2 | N | 2 |
| 249 | `superset-frontend/src/dashboard/components/gridComponents/Header/Header.tsx` | 2 | N | 2 |
| 250 | `superset-frontend/src/dashboard/components/gridComponents/Header/Header.test.tsx` | 2 | Y | 2 |
| 251 | `superset-frontend/src/dashboard/components/PropertiesModal/sections/AccessSection.test.tsx` | 2 | Y | 2 |
| 252 | `superset-frontend/src/dashboard/components/FiltersBadge/FilterIndicator/FilterIndicator.test.tsx` | 2 | Y | 2 |
| 253 | `superset-frontend/src/dashboard/actions/sliceEntities.ts` | 2 | N | 2 |
| 254 | `superset-frontend/src/components/MessageToasts/withToasts.tsx` | 2 | N | 2 |
| 255 | `superset-frontend/src/components/GridTable/GridTable.test.tsx` | 2 | Y | 2 |
| 256 | `superset-frontend/src/components/Datasource/FoldersEditor/sensors.test.ts` | 2 | Y | 2 |
| 257 | `superset-frontend/src/components/Datasource/DatasourceModal/index.tsx` | 2 | N | 2 |
| 258 | `superset-frontend/src/components/Chart/chartActions.test.ts` | 2 | Y | 2 |
| 259 | `superset-frontend/src/components/Chart/MenuItemWithTruncation.tsx` | 2 | N | 2 |
| 260 | `superset-frontend/src/components/Chart/DrillBy/DrillBySubmenu.tsx` | 2 | N | 2 |
| 261 | `superset-frontend/src/SqlLab/components/TemplateParamsEditor/index.tsx` | 2 | N | 2 |
| 262 | `superset-frontend/src/SqlLab/components/ScheduleQueryButton/index.tsx` | 2 | N | 2 |
| 263 | `superset-frontend/src/SqlLab/components/SaveDatasetModal/index.tsx` | 2 | N | 2 |
| 264 | `superset-frontend/src/SqlLab/components/EditorWrapper/useKeywords.test.ts` | 2 | Y | 2 |
| 265 | `superset-frontend/spec/helpers/jsDomWithFetchAPI.ts` | 2 | N | 2 |
| 266 | `superset-frontend/plugins/preset-chart-deckgl/src/utilities/controlRegistry.tsx` | 2 | N | 2 |
| 267 | `superset-frontend/plugins/preset-chart-deckgl/src/utilities/HandlebarsRenderer.tsx` | 2 | N | 2 |
| 268 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Scatter/Scatter.tsx` | 2 | N | 2 |
| 269 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Polygon/Polygon.test.tsx` | 2 | Y | 2 |
| 270 | `superset-frontend/plugins/plugin-chart-table/src/transformProps.ts` | 2 | N | 2 |
| 271 | `superset-frontend/plugins/plugin-chart-table/src/controlPanel.tsx` | 2 | N | 2 |
| 272 | `superset-frontend/plugins/plugin-chart-table/src/buildQuery.ts` | 2 | N | 2 |
| 273 | `superset-frontend/plugins/plugin-chart-echarts/test/Waterfall/transformProps.test.ts` | 2 | Y | 2 |
| 274 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Step/controlPanel.test.ts` | 2 | Y | 2 |
| 275 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/SmoothLine/controlPanel.test.ts` | 2 | Y | 2 |
| 276 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Scatter/controlPanel.test.ts` | 2 | Y | 2 |
| 277 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Line/controlPanel.test.ts` | 2 | Y | 2 |
| 278 | `superset-frontend/plugins/plugin-chart-echarts/test/Timeseries/Area/controlPanel.test.ts` | 2 | Y | 2 |
| 279 | `superset-frontend/plugins/plugin-chart-echarts/src/utils/themeOverrides.ts` | 2 | N | 2 |
| 280 | `superset-frontend/plugins/plugin-chart-echarts/src/types.ts` | 2 | N | 2 |
| 281 | `superset-frontend/plugins/plugin-chart-echarts/src/controls.tsx` | 2 | N | 2 |
| 282 | `superset-frontend/plugins/plugin-chart-echarts/src/components/ExtraControls.tsx` | 2 | N | 2 |
| 283 | `superset-frontend/plugins/plugin-chart-echarts/src/components/Echart.tsx` | 2 | N | 2 |
| 284 | `superset-frontend/plugins/plugin-chart-echarts/src/Tree/transformProps.ts` | 2 | N | 2 |
| 285 | `superset-frontend/plugins/plugin-chart-echarts/src/Timeseries/transformers.ts` | 2 | N | 2 |
| 286 | `superset-frontend/plugins/plugin-chart-echarts/src/Sunburst/transformProps.ts` | 2 | N | 2 |
| 287 | `superset-frontend/plugins/plugin-chart-echarts/src/Graph/EchartsGraph.tsx` | 2 | N | 2 |
| 288 | `superset-frontend/plugins/plugin-chart-echarts/src/BigNumber/BigNumberTotal/transformProps.test.ts` | 2 | Y | 2 |
| 289 | `superset-frontend/plugins/plugin-chart-cartodiagram/types/external.d.ts` | 2 | N | 2 |
| 290 | `superset-frontend/plugins/plugin-chart-cartodiagram/test/util/transformPropsUtil.test.ts` | 2 | Y | 2 |
| 291 | `superset-frontend/plugins/plugin-chart-cartodiagram/test/util/controlPanelUtil.test.tsx` | 2 | Y | 2 |
| 292 | `superset-frontend/plugins/plugin-chart-cartodiagram/test/plugin/transformProps.test.ts` | 2 | Y | 2 |
| 293 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/components/OlChartMap.tsx` | 2 | N | 2 |
| 294 | `superset-frontend/plugins/plugin-chart-ag-grid-table/src/controlPanel.tsx` | 2 | N | 2 |
| 295 | `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/index.tsx` | 2 | N | 2 |
| 296 | `superset-frontend/packages/superset-ui-core/types/react-table-config.d.ts` | 2 | N | 2 |
| 297 | `superset-frontend/packages/superset-ui-core/test/time-comparison/getComparisonInfo.test.ts` | 2 | Y | 2 |
| 298 | `superset-frontend/packages/superset-ui-core/test/time-comparison/getComparisonFilters.test.ts` | 2 | Y | 2 |
| 299 | `superset-frontend/packages/superset-ui-core/src/utils/merge.ts` | 2 | N | 2 |
| 300 | `superset-frontend/packages/superset-ui-core/src/time-format/formatters/finestTemporalGrain.ts` | 2 | N | 2 |
| 301 | `superset-frontend/packages/superset-ui-core/src/time-comparison/getComparisonFilters.ts` | 2 | N | 2 |
| 302 | `superset-frontend/packages/superset-ui-core/src/query/types/QueryResponse.ts` | 2 | N | 2 |
| 303 | `superset-frontend/packages/superset-ui-core/src/query/getClientErrorObject.ts` | 2 | N | 2 |
| 304 | `superset-frontend/packages/superset-ui-core/src/components/TableCollection/index.tsx` | 2 | N | 2 |
| 305 | `superset-frontend/packages/superset-ui-core/src/components/TableCollection/TableCollection.test.tsx` | 2 | Y | 2 |
| 306 | `superset-frontend/packages/superset-ui-core/src/components/Table/utils/InteractiveTableUtils.ts` | 2 | N | 2 |
| 307 | `superset-frontend/packages/superset-ui-core/src/components/Select/types.ts` | 2 | N | 2 |
| 308 | `superset-frontend/packages/superset-ui-core/src/components/Select/Select.tsx` | 2 | N | 2 |
| 309 | `superset-frontend/packages/superset-ui-core/src/components/ModalTrigger/index.tsx` | 2 | N | 2 |
| 310 | `superset-frontend/packages/superset-ui-core/src/components/Menu/Menu.stories.tsx` | 2 | N | 2 |
| 311 | `superset-frontend/packages/superset-ui-core/src/components/List/List.stories.tsx` | 2 | N | 2 |
| 312 | `superset-frontend/packages/superset-ui-core/src/components/EditableTitle/index.tsx` | 2 | N | 2 |
| 313 | `superset-frontend/packages/superset-ui-core/src/chart/types/matrixify.ts` | 2 | N | 2 |
| 314 | `superset-frontend/packages/superset-ui-core/src/chart/types/matrixify.test.ts` | 2 | Y | 2 |
| 315 | `superset-frontend/packages/superset-ui-core/src/chart/types/TransformFunction.ts` | 2 | N | 2 |
| 316 | `superset-frontend/packages/superset-ui-core/src/chart/registries/ChartBuildQueryRegistrySingleton.ts` | 2 | N | 2 |
| 317 | `superset-frontend/packages/superset-ui-core/src/chart/models/ChartProps.ts` | 2 | N | 2 |
| 318 | `superset-frontend/packages/superset-ui-core/src/chart/components/SuperChart.tsx` | 2 | N | 2 |
| 319 | `superset-frontend/packages/superset-ui-core/src/chart/components/Matrixify/MatrixifyGridGenerator.ts` | 2 | N | 2 |
| 320 | `superset-frontend/packages/superset-ui-chart-controls/test/shared-controls/customControls.test.tsx` | 2 | Y | 2 |
| 321 | `superset-frontend/packages/superset-ui-chart-controls/src/shared-controls/sharedControls.tsx` | 2 | N | 2 |
| 322 | `superset-frontend/packages/superset-core/src/theme/utils/themeUtils.test.ts` | 2 | Y | 2 |
| 323 | `superset-frontend/packages/superset-core/src/theme/types.ts` | 2 | N | 2 |
| 324 | `superset-frontend/packages/superset-core/src/theme/Theme.tsx` | 2 | N | 2 |
| 325 | `superset-frontend/packages/superset-core/src/common/index.ts` | 2 | N | 2 |
| 326 | `superset-frontend/cypress-base/cypress/utils/vizPlugins.ts` | 2 | N | 2 |
| 327 | `superset-frontend/src/visualizations/TimeTable/utils/sparklineHelpers/sparklineHelpers.test.ts` | 1 | Y | 2 |
| 328 | `superset-frontend/src/visualizations/TimeTable/utils/sortUtils/sortUtils.test.ts` | 1 | Y | 2 |
| 329 | `superset-frontend/src/visualizations/TimeTable/components/SparklineCell/SparklineCell.tsx` | 1 | N | 2 |
| 330 | `superset-frontend/src/visualizations/TimeTable/components/LeftCell/mustache.d.ts` | 1 | N | 2 |
| 331 | `superset-frontend/src/views/CRUD/utils.test.tsx` | 1 | Y | 2 |
| 332 | `superset-frontend/src/utils/types.ts` | 1 | N | 2 |
| 333 | `superset-frontend/src/utils/safeStringify.ts` | 1 | N | 2 |
| 334 | `superset-frontend/src/utils/reducerUtils.ts` | 1 | N | 2 |
| 335 | `superset-frontend/src/utils/getControlsForVizType.ts` | 1 | N | 2 |
| 336 | `superset-frontend/src/utils/datasourceUtils.ts` | 1 | N | 2 |
| 337 | `superset-frontend/src/utils/cacheWrapper.ts` | 1 | N | 2 |
| 338 | `superset-frontend/src/types/dom-to-pdf.d.ts` | 1 | N | 2 |
| 339 | `superset-frontend/src/types/Database.ts` | 1 | N | 2 |
| 340 | `superset-frontend/src/pages/Login/index.tsx` | 1 | N | 2 |
| 341 | `superset-frontend/src/middleware/logger.test.ts` | 1 | Y | 2 |
| 342 | `superset-frontend/src/middleware/asyncEvent.test.ts` | 1 | Y | 2 |
| 343 | `superset-frontend/src/filters/components/Select/SelectFilterPlugin.tsx` | 1 | N | 2 |
| 344 | `superset-frontend/src/filters/components/Range/types.ts` | 1 | N | 2 |
| 345 | `superset-frontend/src/filters/components/Range/RangeFilterPlugin.test.tsx` | 1 | Y | 2 |
| 346 | `superset-frontend/src/features/users/UserListModal.tsx` | 1 | N | 2 |
| 347 | `superset-frontend/src/features/tags/TagModal.tsx` | 1 | N | 2 |
| 348 | `superset-frontend/src/features/tags/BulkTagModal.tsx` | 1 | N | 2 |
| 349 | `superset-frontend/src/features/roles/RoleListEditModal.test.tsx` | 1 | Y | 2 |
| 350 | `superset-frontend/src/features/reports/ReportModal/reducer.test.ts` | 1 | Y | 2 |
| 351 | `superset-frontend/src/features/reports/ReportModal/index.tsx` | 1 | N | 2 |
| 352 | `superset-frontend/src/features/reports/ReportModal/ReportModal.test.tsx` | 1 | Y | 2 |
| 353 | `superset-frontend/src/features/queries/hooks/useQueryPreviewState.ts` | 1 | N | 2 |
| 354 | `superset-frontend/src/features/home/SavedQueries.tsx` | 1 | N | 2 |
| 355 | `superset-frontend/src/features/home/Menu.tsx` | 1 | N | 2 |
| 356 | `superset-frontend/src/features/home/LanguagePicker.stories.tsx` | 1 | N | 2 |
| 357 | `superset-frontend/src/features/home/ChartTable.tsx` | 1 | N | 2 |
| 358 | `superset-frontend/src/features/home/ChartTable.test.tsx` | 1 | Y | 2 |
| 359 | `superset-frontend/src/features/home/ActivityTable.test.tsx` | 1 | Y | 2 |
| 360 | `superset-frontend/src/features/groups/utils.ts` | 1 | N | 2 |
| 361 | `superset-frontend/src/features/datasets/metadataBar/useDatasetMetadataBar.test.tsx` | 1 | Y | 2 |
| 362 | `superset-frontend/src/features/datasets/AddDataset/Header/Header.test.tsx` | 1 | Y | 2 |
| 363 | `superset-frontend/src/features/databases/UploadDataModel/StyledFormItemWithTip.tsx` | 1 | N | 2 |
| 364 | `superset-frontend/src/features/databases/DatabaseModal/DatabaseConnectionForm/index.tsx` | 1 | N | 2 |
| 365 | `superset-frontend/src/features/databases/DatabaseModal/DatabaseConnectionForm/OAuth2ClientField.tsx` | 1 | N | 2 |
| 366 | `superset-frontend/src/features/databases/DatabaseModal/DatabaseConnectionForm/EncryptedField.test.tsx` | 1 | Y | 2 |
| 367 | `superset-frontend/src/features/annotations/AnnotationModal.tsx` | 1 | N | 2 |
| 368 | `superset-frontend/src/features/allEntities/AllEntitiesTable.tsx` | 1 | N | 2 |
| 369 | `superset-frontend/src/extensions/ExtensionsList.tsx` | 1 | N | 2 |
| 370 | `superset-frontend/src/explore/store.test.tsx` | 1 | Y | 2 |
| 371 | `superset-frontend/src/explore/exploreUtils/getParsedExploreURLParams.test.ts` | 1 | Y | 2 |
| 372 | `superset-frontend/src/explore/controlUtils/getControlValuesCompatibleWithDatasource.ts` | 1 | N | 2 |
| 373 | `superset-frontend/src/explore/components/controls/withAsyncVerification.test.tsx` | 1 | Y | 2 |
| 374 | `superset-frontend/src/explore/components/controls/ZoomConfigControl/zoomUtil.ts` | 1 | N | 2 |
| 375 | `superset-frontend/src/explore/components/controls/VizTypeControl/VizTypeGallery.tsx` | 1 | N | 2 |
| 376 | `superset-frontend/src/explore/components/controls/ViewQuery.test.tsx` | 1 | Y | 2 |
| 377 | `superset-frontend/src/explore/components/controls/TimeRangeControl/index.tsx` | 1 | N | 2 |
| 378 | `superset-frontend/src/explore/components/controls/TextControl/index.tsx` | 1 | N | 2 |
| 379 | `superset-frontend/src/explore/components/controls/SelectControl.tsx` | 1 | N | 2 |
| 380 | `superset-frontend/src/explore/components/controls/SelectAsyncControl/SelectAsyncControl.test.tsx` | 1 | Y | 2 |
| 381 | `superset-frontend/src/explore/components/controls/MetricControl/columnType.ts` | 1 | N | 2 |
| 382 | `superset-frontend/src/explore/components/controls/MetricControl/MetricDefinitionValue.tsx` | 1 | N | 2 |
| 383 | `superset-frontend/src/explore/components/controls/MetricControl/AggregateOption.tsx` | 1 | N | 2 |
| 384 | `superset-frontend/src/explore/components/controls/MetricControl/AdhocMetricPopoverTrigger.tsx` | 1 | N | 2 |
| 385 | `superset-frontend/src/explore/components/controls/MetricControl/AdhocMetricOption.tsx` | 1 | N | 2 |
| 386 | `superset-frontend/src/explore/components/controls/MetricControl/AdhocMetricOption.test.tsx` | 1 | Y | 2 |
| 387 | `superset-frontend/src/explore/components/controls/FilterControl/columnType.ts` | 1 | N | 2 |
| 388 | `superset-frontend/src/explore/components/controls/FilterControl/AdhocFilterEditPopoverSqlTabContent/index.tsx` | 1 | N | 2 |
| 389 | `superset-frontend/src/explore/components/controls/DndColumnSelectControl/DndColumnMetricSelect.test.tsx` | 1 | Y | 2 |
| 390 | `superset-frontend/src/explore/components/controls/DndColumnSelectControl/ColumnSelectPopover.tsx` | 1 | N | 2 |
| 391 | `superset-frontend/src/explore/components/controls/DateFilterControl/tests/DateFilterLabel.test.tsx` | 1 | Y | 2 |
| 392 | `superset-frontend/src/explore/components/controls/DateFilterControl/components/CustomFrame.tsx` | 1 | N | 2 |
| 393 | `superset-frontend/src/explore/components/controls/DateFilterControl/components/CurrentCalendarFrame.tsx` | 1 | N | 2 |
| 394 | `superset-frontend/src/explore/components/controls/DateFilterControl/components/CommonFrame.tsx` | 1 | N | 2 |
| 395 | `superset-frontend/src/explore/components/controls/DateFilterControl/components/CalendarFrame.tsx` | 1 | N | 2 |
| 396 | `superset-frontend/src/explore/components/controls/ContourControl/ContourPopoverControl.tsx` | 1 | N | 2 |
| 397 | `superset-frontend/src/explore/components/controls/ConditionalFormattingControl/ConditionalFormattingControl.tsx` | 1 | N | 2 |
| 398 | `superset-frontend/src/explore/components/controls/CollectionControl/index.tsx` | 1 | N | 2 |
| 399 | `superset-frontend/src/explore/components/controls/AnnotationLayerControl/AnnotationLayer.test.tsx` | 1 | Y | 2 |
| 400 | `superset-frontend/src/explore/components/ExploreChartPanel/index.tsx` | 1 | N | 2 |
| 401 | `superset-frontend/src/explore/components/DatasourcePanel/DatasourcePanelDragOption/index.tsx` | 1 | N | 2 |
| 402 | `superset-frontend/src/explore/components/DataTableControl/useTableColumns.test.ts` | 1 | Y | 2 |
| 403 | `superset-frontend/src/database/reducers.ts` | 1 | N | 2 |
| 404 | `superset-frontend/src/dashboard/util/useFilterFocusHighlightStyles.ts` | 1 | N | 2 |
| 405 | `superset-frontend/src/dashboard/util/updateComponentParentsList.test.ts` | 1 | Y | 2 |
| 406 | `superset-frontend/src/dashboard/util/isDashboardEmpty.ts` | 1 | N | 2 |
| 407 | `superset-frontend/src/dashboard/util/getRelatedCharts.test.ts` | 1 | Y | 2 |
| 408 | `superset-frontend/src/dashboard/util/getDropPosition.test.ts` | 1 | Y | 2 |
| 409 | `superset-frontend/src/dashboard/types.ts` | 1 | N | 2 |
| 410 | `superset-frontend/src/dashboard/reducers/dashboardState.test.ts` | 1 | Y | 2 |
| 411 | `superset-frontend/src/dashboard/components/nativeFilters/utils.ts` | 1 | N | 2 |
| 412 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/NativeFiltersModal.test.tsx` | 1 | Y | 2 |
| 413 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/getControlItemsMap.test.tsx` | 1 | Y | 2 |
| 414 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/FilterScope/utils.test.ts` | 1 | Y | 2 |
| 415 | `superset-frontend/src/dashboard/components/nativeFilters/FiltersConfigModal/FilterConfigPane.test.tsx` | 1 | Y | 2 |
| 416 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/types.ts` | 1 | N | 2 |
| 417 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/Vertical.tsx` | 1 | N | 2 |
| 418 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/FiltersDropdownContent/FiltersDropdownContent.test.tsx` | 1 | Y | 2 |
| 419 | `superset-frontend/src/dashboard/components/nativeFilters/FilterBar/FilterControls/types.ts` | 1 | N | 2 |
| 420 | `superset-frontend/src/dashboard/components/nativeFilters/ConfigModal/BaseConfigModal.tsx` | 1 | N | 2 |
| 421 | `superset-frontend/src/dashboard/components/menu/ShareMenuItems/ShareMenuItems.test.tsx` | 1 | Y | 2 |
| 422 | `superset-frontend/src/dashboard/components/gridComponents/new/DraggableNewComponent.tsx` | 1 | N | 2 |
| 423 | `superset-frontend/src/dashboard/components/gridComponents/TabsRenderer/TabsRenderer.tsx` | 1 | N | 2 |
| 424 | `superset-frontend/src/dashboard/components/gridComponents/Row/Row.tsx` | 1 | N | 2 |
| 425 | `superset-frontend/src/dashboard/components/gridComponents/Row/Row.test.tsx` | 1 | Y | 2 |
| 426 | `superset-frontend/src/dashboard/components/gridComponents/ChartHolder/ChartHolder.tsx` | 1 | N | 2 |
| 427 | `superset-frontend/src/dashboard/components/dnd/handleScroll/index.ts` | 1 | N | 2 |
| 428 | `superset-frontend/src/dashboard/components/SliceHeaderControls/ViewResultsModalTrigger.tsx` | 1 | N | 2 |
| 429 | `superset-frontend/src/dashboard/components/SaveModal.tsx` | 1 | N | 2 |
| 430 | `superset-frontend/src/dashboard/components/PropertiesModal/sections/StylingSection.tsx` | 1 | N | 2 |
| 431 | `superset-frontend/src/dashboard/components/PropertiesModal/sections/StylingSection.test.tsx` | 1 | Y | 2 |
| 432 | `superset-frontend/src/dashboard/components/PropertiesModal/sections/AdvancedSection.tsx` | 1 | N | 2 |
| 433 | `superset-frontend/src/dashboard/components/PropertiesModal/index.tsx` | 1 | N | 2 |
| 434 | `superset-frontend/src/dashboard/components/DashboardBuilder/utils.ts` | 1 | N | 2 |
| 435 | `superset-frontend/src/dashboard/components/DashboardBuilder/DashboardContainer.tsx` | 1 | N | 2 |
| 436 | `superset-frontend/src/dashboard/components/AnchorLink/AnchorLink.stories.tsx` | 1 | N | 2 |
| 437 | `superset-frontend/src/core/utils.ts` | 1 | N | 2 |
| 438 | `superset-frontend/src/core/sqlLab/sqlLab.test.ts` | 1 | Y | 2 |
| 439 | `superset-frontend/src/core/models.ts` | 1 | N | 2 |
| 440 | `superset-frontend/src/components/TableSelector/index.tsx` | 1 | N | 2 |
| 441 | `superset-frontend/src/components/TableSelector/TableSelector.test.tsx` | 1 | Y | 2 |
| 442 | `superset-frontend/src/components/StreamingExportModal/useStreamingExport.ts` | 1 | N | 2 |
| 443 | `superset-frontend/src/components/MessageToasts/ToastContainer.tsx` | 1 | N | 2 |
| 444 | `superset-frontend/src/components/ListView/Filters/types.ts` | 1 | N | 2 |
| 445 | `superset-frontend/src/components/ListView/Filters/index.tsx` | 1 | N | 2 |
| 446 | `superset-frontend/src/components/GridTable/types.ts` | 1 | N | 2 |
| 447 | `superset-frontend/src/components/ErrorMessage/OAuth2RedirectMessage.test.tsx` | 1 | Y | 2 |
| 448 | `superset-frontend/src/components/Datasource/components/Fieldset/index.tsx` | 1 | N | 2 |
| 449 | `superset-frontend/src/components/Datasource/components/DatasourceEditor/tests/DatasourceEditor.test.utils.tsx` | 1 | Y | 2 |
| 450 | `superset-frontend/src/components/Datasource/components/DatasourceEditor/components/DashboardLinksExternal/DashboardLinksExternal.test.tsx` | 1 | Y | 2 |
| 451 | `superset-frontend/src/components/Datasource/FoldersEditor/treeUtils.ts` | 1 | N | 2 |
| 452 | `superset-frontend/src/components/Datasource/FoldersEditor/hooks/useAutoScroll.ts` | 1 | N | 2 |
| 453 | `superset-frontend/src/components/DatabaseSelector/types.ts` | 1 | N | 2 |
| 454 | `superset-frontend/src/components/CopyToClipboard/CopyToClipboard.stories.tsx` | 1 | N | 2 |
| 455 | `superset-frontend/src/components/Chart/DrillDetail/DrillDetailPane.tsx` | 1 | N | 2 |
| 456 | `superset-frontend/src/components/Chart/DrillBy/DrillByModal.tsx` | 1 | N | 2 |
| 457 | `superset-frontend/src/components/Chart/DrillBy/DrillByChart.tsx` | 1 | N | 2 |
| 458 | `superset-frontend/src/components/Chart/DrillBy/DrillByChart.test.tsx` | 1 | Y | 2 |
| 459 | `superset-frontend/src/components/Chart/ChartRenderer.tsx` | 1 | N | 2 |
| 460 | `superset-frontend/src/components/Chart/ChartContainer.tsx` | 1 | N | 2 |
| 461 | `superset-frontend/src/components/Chart/Chart.tsx` | 1 | N | 2 |
| 462 | `superset-frontend/src/components/AlteredSliceTag/utils/index.ts` | 1 | N | 2 |
| 463 | `superset-frontend/src/components/AlteredSliceTag/AlteredSliceTag.stories.tsx` | 1 | N | 2 |
| 464 | `superset-frontend/src/SqlLab/types.ts` | 1 | N | 2 |
| 465 | `superset-frontend/src/SqlLab/middlewares/persistSqlLabStateEnhancer.ts` | 1 | N | 2 |
| 466 | `superset-frontend/src/SqlLab/components/SqlEditorTopBar/useDatabaseSelector.test.ts` | 1 | Y | 2 |
| 467 | `superset-frontend/src/SqlLab/components/SqlEditor/index.tsx` | 1 | N | 2 |
| 468 | `superset-frontend/src/SqlLab/components/ResultSet/ResultSet.test.tsx` | 1 | Y | 2 |
| 469 | `superset-frontend/src/SqlLab/components/HighlightedSql/index.tsx` | 1 | N | 2 |
| 470 | `superset-frontend/src/SqlLab/components/ExploreCtasResultsButton/index.tsx` | 1 | N | 2 |
| 471 | `superset-frontend/src/SqlLab/components/ColumnElement/index.tsx` | 1 | N | 2 |
| 472 | `superset-frontend/spec/helpers/ProviderWrapper.tsx` | 1 | N | 2 |
| 473 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Path/Path.test.tsx` | 1 | Y | 2 |
| 474 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Heatmap/Heatmap.tsx` | 1 | N | 2 |
| 475 | `superset-frontend/plugins/preset-chart-deckgl/src/layers/Geojson/Geojson.tsx` | 1 | N | 2 |
| 476 | `superset-frontend/plugins/preset-chart-deckgl/src/Multi/Multi.tsx` | 1 | N | 2 |
| 477 | `superset-frontend/plugins/preset-chart-deckgl/src/Multi/Multi.test.tsx` | 1 | Y | 2 |
| 478 | `superset-frontend/plugins/preset-chart-deckgl/src/CategoricalDeckGLContainer.tsx` | 1 | N | 2 |
| 479 | `superset-frontend/plugins/plugin-chart-table/test/testHelpers.tsx` | 1 | Y | 2 |
| 480 | `superset-frontend/plugins/plugin-chart-table/test/buildQuery.test.ts` | 1 | Y | 2 |
| 481 | `superset-frontend/plugins/plugin-chart-table/src/index.ts` | 1 | N | 2 |
| 482 | `superset-frontend/plugins/plugin-chart-point-cluster-map/src/components/CanvasOverlay.tsx` | 1 | N | 2 |
| 483 | `superset-frontend/plugins/plugin-chart-pivot-table/types/external.d.ts` | 1 | N | 2 |
| 484 | `superset-frontend/plugins/plugin-chart-handlebars/types/external.d.ts` | 1 | N | 2 |
| 485 | `superset-frontend/plugins/plugin-chart-handlebars/src/plugin/controls/shared.ts` | 1 | N | 2 |
| 486 | `superset-frontend/plugins/plugin-chart-echarts/types/external.d.ts` | 1 | N | 2 |
| 487 | `superset-frontend/plugins/plugin-chart-echarts/src/utils/tooltip.ts` | 1 | N | 2 |
| 488 | `superset-frontend/plugins/plugin-chart-echarts/src/utils/forecast.ts` | 1 | N | 2 |
| 489 | `superset-frontend/plugins/plugin-chart-echarts/src/Waterfall/transformProps.ts` | 1 | N | 2 |
| 490 | `superset-frontend/plugins/plugin-chart-echarts/src/Treemap/transformProps.ts` | 1 | N | 2 |
| 491 | `superset-frontend/plugins/plugin-chart-echarts/src/Pie/transformProps.ts` | 1 | N | 2 |
| 492 | `superset-frontend/plugins/plugin-chart-echarts/src/Heatmap/transformProps.ts` | 1 | N | 2 |
| 493 | `superset-frontend/plugins/plugin-chart-echarts/src/Graph/transformProps.ts` | 1 | N | 2 |
| 494 | `superset-frontend/plugins/plugin-chart-echarts/src/Gantt/transformProps.ts` | 1 | N | 2 |
| 495 | `superset-frontend/plugins/plugin-chart-echarts/src/Funnel/transformProps.ts` | 1 | N | 2 |
| 496 | `superset-frontend/plugins/plugin-chart-echarts/src/BoxPlot/transformProps.ts` | 1 | N | 2 |
| 497 | `superset-frontend/plugins/plugin-chart-echarts/src/BigNumber/BigNumberWithTrendline/transformProps.test.ts` | 1 | Y | 2 |
| 498 | `superset-frontend/plugins/plugin-chart-echarts/src/BigNumber/BigNumberWithTrendline/buildQuery.ts` | 1 | N | 2 |
| 499 | `superset-frontend/plugins/plugin-chart-echarts/src/BigNumber/BigNumberPeriodOverPeriod/transformProps.ts` | 1 | N | 2 |
| 500 | `superset-frontend/plugins/plugin-chart-cartodiagram/test/testData.ts` | 1 | Y | 2 |
| 501 | `superset-frontend/plugins/plugin-chart-cartodiagram/test/plugin/buildQuery.test.ts` | 1 | Y | 2 |
| 502 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/plugin/buildQuery.ts` | 1 | N | 2 |
| 503 | `superset-frontend/plugins/plugin-chart-cartodiagram/src/components/ChartWrapper.tsx` | 1 | N | 2 |
| 504 | `superset-frontend/plugins/plugin-chart-ag-grid-table/src/AgGridTable/components/TimeComparisonVisibility.tsx` | 1 | N | 2 |
| 505 | `superset-frontend/plugins/legacy-plugin-chart-country-map/test/CountryMap.test.tsx` | 1 | Y | 2 |
| 506 | `superset-frontend/plugins/legacy-plugin-chart-chord/src/Chord.ts` | 1 | N | 2 |
| 507 | `superset-frontend/packages/superset-ui-core/test/utils/getSelectedText.test.ts` | 1 | Y | 2 |
| 508 | `superset-frontend/packages/superset-ui-core/test/time-comparison/parseDttmToDate.test.ts` | 1 | Y | 2 |
| 509 | `superset-frontend/packages/superset-ui-core/test/query/buildQueryObject.test.ts` | 1 | Y | 2 |
| 510 | `superset-frontend/packages/superset-ui-core/test/models/Registry.test.ts` | 1 | Y | 2 |
| 511 | `superset-frontend/packages/superset-ui-core/test/currency-format/utils.test.ts` | 1 | Y | 2 |
| 512 | `superset-frontend/packages/superset-ui-core/test/currency-format/CurrencyFormatter.test.ts` | 1 | Y | 2 |
| 513 | `superset-frontend/packages/superset-ui-core/test/components/Icons/AsyncIcon.integration.test.tsx` | 1 | Y | 2 |
| 514 | `superset-frontend/packages/superset-ui-core/src/utils/convertKeysToCamelCase.ts` | 1 | N | 2 |
| 515 | `superset-frontend/packages/superset-ui-core/src/types/react-syntax-highlighter.d.ts` | 1 | N | 2 |
| 516 | `superset-frontend/packages/superset-ui-core/src/time-comparison/getTimeOffset.ts` | 1 | N | 2 |
| 517 | `superset-frontend/packages/superset-ui-core/src/time-comparison/getComparisonInfo.ts` | 1 | N | 2 |
| 518 | `superset-frontend/packages/superset-ui-core/src/time-comparison/fetchTimeRange.ts` | 1 | N | 2 |
| 519 | `superset-frontend/packages/superset-ui-core/src/style/stories/Theme.stories.tsx` | 1 | N | 2 |
| 520 | `superset-frontend/packages/superset-ui-core/src/query/types/QueryFormData.ts` | 1 | N | 2 |
| 521 | `superset-frontend/packages/superset-ui-core/src/query/types/Query.ts` | 1 | N | 2 |
| 522 | `superset-frontend/packages/superset-ui-core/src/query/types/PostProcessing.ts` | 1 | N | 2 |
| 523 | `superset-frontend/packages/superset-ui-core/src/models/Plugin.ts` | 1 | N | 2 |
| 524 | `superset-frontend/packages/superset-ui-core/src/hooks/useTruncation/useChildElementTruncation.test.ts` | 1 | Y | 2 |
| 525 | `superset-frontend/packages/superset-ui-core/src/hooks/usePrevious/usePrevious.ts` | 1 | N | 2 |
| 526 | `superset-frontend/packages/superset-ui-core/src/connection/types.ts` | 1 | N | 2 |
| 527 | `superset-frontend/packages/superset-ui-core/src/connection/callApi/parseResponse.ts` | 1 | N | 2 |
| 528 | `superset-frontend/packages/superset-ui-core/src/components/Upload/Upload.stories.tsx` | 1 | N | 2 |
| 529 | `superset-frontend/packages/superset-ui-core/src/components/TooltipParagraph/index.tsx` | 1 | N | 2 |
| 530 | `superset-frontend/packages/superset-ui-core/src/components/Table/index.tsx` | 1 | N | 2 |
| 531 | `superset-frontend/packages/superset-ui-core/src/components/Table/cell-renderers/ActionCell/index.tsx` | 1 | N | 2 |
| 532 | `superset-frontend/packages/superset-ui-core/src/components/RefreshLabel/index.tsx` | 1 | N | 2 |
| 533 | `superset-frontend/packages/superset-ui-core/src/components/PopoverSection/PopoverSection.stories.tsx` | 1 | N | 2 |
| 534 | `superset-frontend/packages/superset-ui-core/src/components/PopoverDropdown/index.tsx` | 1 | N | 2 |
| 535 | `superset-frontend/packages/superset-ui-core/src/components/List/List.test.tsx` | 1 | Y | 2 |
| 536 | `superset-frontend/packages/superset-ui-core/src/components/Form/LabeledErrorBoundInput.stories.tsx` | 1 | N | 2 |
| 537 | `superset-frontend/packages/superset-ui-core/src/components/FaveStar/types.ts` | 1 | N | 2 |
| 538 | `superset-frontend/packages/superset-ui-core/src/components/FaveStar/FaveStar.test.tsx` | 1 | Y | 2 |
| 539 | `superset-frontend/packages/superset-ui-core/src/components/DatePicker/DatePicker.stories.tsx` | 1 | N | 2 |
| 540 | `superset-frontend/packages/superset-ui-core/src/components/CronPicker/CronPicker.test.tsx` | 1 | Y | 2 |
| 541 | `superset-frontend/packages/superset-ui-core/src/components/ConfirmStatusChange/types.ts` | 1 | N | 2 |
| 542 | `superset-frontend/packages/superset-ui-core/src/components/ConfirmStatusChange/index.tsx` | 1 | N | 2 |
| 543 | `superset-frontend/packages/superset-ui-core/src/components/CodeSyntaxHighlighter/index.tsx` | 1 | N | 2 |
| 544 | `superset-frontend/packages/superset-ui-core/src/components/CodeSyntaxHighlighter/index.test.tsx` | 1 | Y | 2 |
| 545 | `superset-frontend/packages/superset-ui-core/src/components/AsyncEsmComponent/types.ts` | 1 | N | 2 |
| 546 | `superset-frontend/packages/superset-ui-core/src/components/AsyncAceEditor/useJsonValidation.ts` | 1 | N | 2 |
| 547 | `superset-frontend/packages/superset-ui-core/src/chart/registries/ChartTransformPropsRegistrySingleton.ts` | 1 | N | 2 |
| 548 | `superset-frontend/packages/superset-ui-core/src/chart/models/ChartPlugin.ts` | 1 | N | 2 |
| 549 | `superset-frontend/packages/superset-ui-core/src/chart/models/ChartControlPanel.ts` | 1 | N | 2 |
| 550 | `superset-frontend/packages/superset-ui-core/src/chart/components/createLoadableRenderer.ts` | 1 | N | 2 |
| 551 | `superset-frontend/packages/superset-ui-core/src/chart/components/Matrixify/MatrixifyGridCell.test.tsx` | 1 | Y | 2 |
| 552 | `superset-frontend/packages/superset-ui-chart-controls/test/utils/getTemporalColumns.test.ts` | 1 | Y | 2 |
| 553 | `superset-frontend/packages/superset-ui-chart-controls/src/shared-controls/mixins.tsx` | 1 | N | 2 |
| 554 | `superset-frontend/packages/superset-ui-chart-controls/src/shared-controls/matrixifyControls.test.ts` | 1 | Y | 2 |
| 555 | `superset-frontend/packages/superset-ui-chart-controls/src/shared-controls/components/types.ts` | 1 | N | 2 |
| 556 | `superset-frontend/packages/superset-ui-chart-controls/src/operators/types.ts` | 1 | N | 2 |
| 557 | `superset-frontend/packages/superset-ui-chart-controls/src/components/Select.tsx` | 1 | N | 2 |
| 558 | `superset-frontend/packages/superset-ui-chart-controls/src/components/MetricOption.tsx` | 1 | N | 2 |
| 559 | `superset-frontend/packages/superset-ui-chart-controls/src/components/ColumnTypeLabel/type-icons/svgType.d.ts` | 1 | N | 2 |
| 560 | `superset-frontend/packages/superset-ui-chart-controls/src/components/ColumnOption.tsx` | 1 | N | 2 |
| 561 | `superset-frontend/packages/superset-core/src/theme/utils/utils.test.ts` | 1 | Y | 2 |
| 562 | `superset-frontend/packages/generator-superset/generators/plugin-chart/templates/types/external.d.ts` | 1 | N | 2 |
| 563 | `superset-frontend/cypress-base/cypress/utils/index.ts` | 1 | N | 2 |
