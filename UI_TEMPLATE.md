# xBuddy UI 1.0.0

RaccoonX 企业蓝完整界面模板，属于 Web 工作台脚手架的展示层。选择 `style: xbuddy` 后装配真实组件与品牌素材，不调用模型重新描摹。

- `ui-kit/xbuddy`：固定版本的 UI 包，228px 侧栏、48px 顶栏、22px 渐变模块图标、选中态、折叠交互、小浣熊素材、页面标题、卡片、对话框、表单和状态组件。
- `src/Module.jsx`、`src/pack/*`：加速包业务逻辑，通过 navigation / children 等接口接入。无平台 API、登录、账号数据或部署入口。
- `src/business.css`：已在模板样式之后加载，用于业务专属布局；无需遍历或修改冻结样式。
- `src/ui/*`：薄适配层。默认保留原版外观；变更业务时不要重写 UI 包。
- 手机端折叠侧栏为抽屉；空状态、加载、错误、表单和保存反馈也是模板组成。
- 原始来源、提交和文件哈希见 template.json；保留上游 LICENSE。模板仅用于已授权的内部产品，不把上游品牌素材另行宣布为公共开源素材。

验收应使用相同视口、合成业务数据，对比外壳与基础组件截图，并检查品牌素材、侧栏尺寸、彩色图标、选中条、折叠/展开、键盘和手机布局。业务内容不同不代表外壳应该不同。截图文件保存在任务产物，模型看图能力另行核验。

## 业务组件入口

统一从 `src/ui/components` 导入，它转出 **`ui-kit/xbuddy/components.jsx` 文件**，不是旁边的 `components/` 目录。无需逐层搜索内部实现。接口：

- PageHead({title, desc, actions})、Card({title, note, actions, children, className})
- Metric({label, value, note, icon, tone})、Tag({children, tone})
- Tabs({items: [[id,label,count]], value, onChange})
- Progress({label, value, total})、Bars({data: [{label,value,color}]})
- EmptyState({title, description, action})、Modal({title, children, onClose, footer})、Icon({name,size})

卡片、弹窗等由适配器映射到原版 UI；只有 Icon/Metric/Bars 转出 business-widgets.jsx。先用现有组件完成业务，不要把查找内部类名当成开发前置条件。
