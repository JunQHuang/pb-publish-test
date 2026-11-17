# Engineering handoff

已完成最小增量：仅交付验收列表增加默认关闭、带可访问名称的“仅看逾期”开关。RecordList 使用组件本地状态，按浏览器本地年月日生成 YYYY-MM-DD，筛选 status != done、有 due 且 due < 本地今天的记录；与现有名称/负责人关键词及状态条件取交集，关闭仅移除逾期条件，沿用原空状态。里程碑不展示该开关，概览继续使用全量数据，业务字段、记录、持久化和原有功能未修改。变更文件：src/pack/RecordList.jsx、src/business.css、tests/delivery-overdue.test.cjs。新增参数化测试覆盖四状态及昨天/今天/明天/无日期、本地日期领先和落后 UTC（含跨年）、组合筛选与 done 空结果、关闭恢复、全量概览不变、存储不变和刷新完整性。verify_app 构建通过，13 项测试通过、1 项不适用跳过，后端 3 项通过，Chromium 1440/390 检查通过无问题。已通过 review_app 及手机收起导航后的实际截图复核：桌面排列、手机换行与默认关闭显示正常。

## Host verification receipt

Build and business/platform tests exited 0.
Workspace SHA-256: `59f81d0e6ff716626e434ec11c335a27476db725415f826e4bcf3a08eb7f40ea`
Final platform artifact validation remains independent.
