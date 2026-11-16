# 工程规则

实现用户本轮需求，保留已有业务和存储结构兼容性。可编辑 backend/business.py、src/、tests/ 和 DEVELOPMENT.md。
先看 project.json、DESIGN.md、源码树和当前错误，按需搜索读取；不要重写未受影响的整个应用。
React、ReactDOM、esbuild、jsdom 已由环境锁定。在开发助手中用 verify_app 完成构建、两套测试和浏览器检查，review_app 查看实际页面，再 finish_development 保存交接。首次使用现成加速器可先 verify_app 检查已经可用的部分；修复或补齐确实缺少的需求，不重复运行未变化的测试。导出后本地手工运行命令：node scripts/build.cjs 构建，node --test tests/*.test.cjs /opt/checks/workbench.test.cjs 验收。
不要修改 scripts/、package.json、project.json、fixtures 或运行环境。没有外网，不安装依赖。
必须实现交互和数据保存；操作按钮不可只改文案。保留中文 label、语义导航和响应式布局。
仅已选业务加速包的互操作约定：保留已有主集合 deliveries（交付类）或 plans（计划类）及记录的 id/title。导航 button 的 data-buddy-nav 与集合名一致，显示文案可以按业务调整。主表单新增标题使用 data-buddy-field="new-title"，提交按钮使用 data-buddy-action="add-item"；旧版“新增事项名称 / 添加事项”仍兼容。这些是自动化验收定位钩子，不是限制业务内容或界面设计。
当 accelerator 为 null 时，从空业务入口自主实现确认的需求；不要求任何 deliveries/plans 集合或固定字段。导出 initialData、navigation 与默认 Module，导航至少一个真实业务页面，保留 data-buddy-nav 标识。移除 data-buddy-unimplemented 占位，编写 tests/requirements.test.cjs，覆盖本次业务关键路径、无效操作和刷新保存；禁止伪造已完成的验收。
失败先看真实错误和源码，再修复；不得删除断言或伪造输出。最终说明变更及已验证和未验证的范围。

界面使用 src/ui 的完整组件和 src/pack 的业务交互，不要简化为配色示例。finish_development 包含真实 Chromium 桌面/手机检查，失败详情在 dist/visual/report.json，截图在 dist/visual/。可编辑名称存在 input.value 中，不在 textContent 里；优先使用 data-buddy-record / data-buddy-field 定位。初次组装满足需求可以直接验收，不必制造源码改动；后续迭代必须保留现有工程与数据。

当 `project.json.style` 为 `xbuddy`，请读 `UI_TEMPLATE.md`。`ui-kit/xbuddy` 是固定版本的原版 UI 包；业务改动使用 `src/Module.jsx` / `src/pack`，保留原版小浣熊、顶栏、分组侧栏、渐变图标及选中状态。已有 `src/ui` 负责组件适配，不需要重做外壳。浏览器只能访问本任务 http://127.0.0.1:4173/ 的构建产物。

xBuddy 业务专属样式写入已加载的 src/business.css；不要修改冻结 UI 包，亦无需反复检索生成的 Tailwind CSS。

开发助手的标准收尾：verify_app → review_app → finish_development。review_app 复用官方浏览器，一次返回桌面/手机页面，避免逐步操作后每次都请求模型。只有发现具体缺陷或未覆盖的关键场景，才使用单独浏览器工具。交接说明通过 finish_development 的 summary 参数保存，不必单独读写 DEVELOPMENT.md；本环境没有 Git 仓库。

独立运行包含 FastAPI + SQLite 后端。backend/app.py、鉴权和持久化测试不可改；确有新业务 API 或服务端校验需求时扩展 backend/business.py。不要重写登录/存储；不要连接原 PB 或 SalesBuddy 服务。RESOURCE_GUIDE.md 是已选资源能力和扩展位置的清单。
