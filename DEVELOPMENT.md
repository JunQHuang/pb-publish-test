# Engineering handoff

已在现有 delivery-buddy 上完成最小增量，保留 xbuddy UI、原有业务与存储。

修改范围：src/pack/RecordList.jsx；新增 tests/delivery-overdue.test.cjs。未修改 backend、fixture 或原有测试，未重建工程或重置数据。

交付验收筛选区新增默认关闭的“仅看逾期”按钮，复用现有按钮样式并通过 aria-pressed 表示启用状态。按用户本地 getFullYear/getMonth/getDate 组成 YYYY-MM-DD，筛选 status !== "done"、due 非空且早于本地今天的记录；不使用 UTC 日期转换。与现有名称/负责人关键词和状态筛选取交集，关闭只撤销逾期条件。里程碑无新增控件，概览继续接收全量数据；字段、状态枚举、记录与保存机制不变。

新增固定本地时间回归覆盖 UTC+8/UTC-8 与 UTC 不同日的跨年边界、昨天/今天/明天/无日期和四种状态的矩阵、名称及负责人组合筛选、完成状态空结果、关闭恢复、无效新增不写数据、全量统计不变、所有记录与存储不变、刷新保留记录且开关默认关闭。

验收：verify_app 成功；前端/平台测试 12 通过、1 跳过、0 失败，后端 3 通过。Chromium 1440/390 检查通过，无溢出或运行错误。review_app 已检查桌面和手机实际页面，并额外目视复核交付验收筛选栏及手机按钮启用样式：排列正常、移动端自然换行、无观察到的遮挡问题。

## Host verification receipt

Build and business/platform tests exited 0.
Workspace SHA-256: `934a14c78c53ddf8b938c2e04de1163f1ff0432cd5338bb5580fc7533b0146cf`
Final platform artifact validation remains independent.
