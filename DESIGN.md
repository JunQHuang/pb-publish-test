# ProjectBuddy 完整界面脚手架

来源是用户提供的 ProjectBuddy v1.1 前端源码。TEMPLATE_SOURCE.json 记录压缩包与原文件 SHA-256。src/ui/reference.css 保留完整原始 bd-* 组件样式；workspace.css 组合完整侧栏、顶栏、页面头部、卡片、页签、表格、弹窗、图表、空态和移动端布局。不是仅颜色字号。

## 组件边界

- src/ui/WorkspaceShell.jsx：工作空间框架、导航、收起状态、面包屑、保存反馈。
- src/ui/components.jsx：PageHead、Metric、Card、Tag、Tabs、Progress、Bars、EmptyState、Modal 与本地 SVG Icon。无网络依赖。
- src/pack/：业务加速包。项目交付包含 Overview 和 RecordList，负责统计、风险、验收/里程碑 CRUD、筛选、日期、弹窗和 CSV 导出。
- src/state.js：现有项目隔离数据协议，必须保留；初始数据为空，不把展示用假记录当用户业务数据。

完整参考风格：浅灰画布、白色分层卡片、蓝色主操作、克制的辅助文字、明确的图标、细分的状态标签；表格、详情输入、空态应同样完整。所有可见操作必须有真实行为。无需模仿原平台身份认证、租户或 API；只复用呈现和交互模式。

## 验收

先完成实际需求，再 finish_development。业务与独立测试均须通过；浏览器会在 1440px / 390px 视口实渲染和截图，检查异常、页面溢出、导航、创建及持久化。表格允许在自己的滚动容器内横向滚动，页面本身不允许横向溢出。机器布局检查不能证明美观程度，截图用于人工设计复核。

初次组装已经满足需求时可以直接验收，不要为了产生 diff 重写组件。后续迭代保留现有代码和数据，只更改本轮要求。新增交互使用稳定的 data-buddy-record（记录 id）及 data-buddy-field（title/owner/due/status）钩子；测试应读输入框 value，不假定文本节点、标签文案或具体 CSS 类名。
