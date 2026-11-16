# Buddy 全栈 Web 工作台

React + RaccoonX 中台 UI，FastAPI + SQLite 独立后端，版本冲突检查和持久化卷。
源码包包含前后端、锁文件、构建、测试、Dockerfile 与 Compose。不是只有界面或 Skill。

## 本地启动

1. Node 24：`npm ci && npm run build`。
2. Python 3.12：创建并激活虚拟环境，`pip install -r backend/requirements.txt`。
3. 设置 `BUDDY_ACCESS_TOKEN` 为至少 32 位随机口令，`npm start`。
4. 打开 http://127.0.0.1:8000，用该应用口令登录。不要复用 PB 账号密码或模型 Key。
5. SQLite 数据默认在 `data/app.sqlite3`；备份此目录，升级不要删除它。

容器运行：设置同一环境变量后 `docker compose up --build -d`。默认仅监听本机，不直接公开互联网。对外使用 HTTPS 入口和访问控制。`docker compose down` 保留数据；不要使用 `down -v`，它会删除数据卷。

## 分层

- `src/Module.jsx`、`src/pack/`：选中的完整业务模块与本轮增量。
- `ui-kit/xbuddy/`：固定版本 RaccoonX UI；保留小浣熊、顶栏、彩色侧栏与组件。
- `src/state.js`：三种明确模式。平台内预览经 PB 存储桥接；独立后端运行通过 `/api/data` 保存；纯静态演示才使用 localStorage。
- `backend/app.py`：应用自有 API、访问口令、HttpOnly 会话、跨域写保护、SQLite 和 revision 乐观锁。
- `RESOURCE_GUIDE.md`：已装配能力、数据合同、真实边界与扩展位置。

单个部署是一个私有工作区，不冒称企业多角色业务权限。没有包含 PB 的生产数据、密钥或账号；不访问原 SalesBuddy/PB 服务。并发修改冲突返回 409，不静默覆盖。容器可替换，持久化数据卷独立保留。

## 验收

`npm test` 检查业务与 UI；安装开发测试依赖 `pip install httpx` 后 `npm run test:backend` 检查鉴权、跨域写保护、持久化、冲突、重启恢复和独立实例隔离。平台还运行独立浏览器与产物检查。下载完成不等于已部署。
