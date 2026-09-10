# AGENTS.md

本文件供 AI 编码代理阅读，描述 `blog_f`（个人博客系统前端）的项目结构、技术栈与开发约定。

## 项目概述

个人博客系统的前端仓库，当前处于**脚手架初始阶段**。

- 仓库根目录只有一个真实的代码目录 `web/`（Vite + React + TypeScript 单页应用）。
- `web/src/` 目前仍是 `npm create vite` 生成的默认模板（`App.tsx` 是官方演示页），**尚未开始业务开发**：没有路由、状态管理、API 封装等代码，Tailwind / Zustand / React Router 等依赖也还未安装。
- 仓库唯一的实质文档是根目录的 **`博客系统设计文档-前端.md`（v2.1，2026-09-10）**，它定义了全部计划中的架构、API 契约与实施路径，是业务开发时的权威设计依据。设计文档中描述的模块（`src/api/`、`src/stores/`、`src/router/` 等）**尚不存在**，不要假设它们已实现。
- 后端为独立仓库（Go，go-zero，接口见后端 `.api` 文件），本仓库不含后端代码。
- 分期策略：一期只有"游客 + 管理员"两种身份；注册/登录用户体系为二期。一期无标签（tag）功能，资源命名为 **article**（不是 post）。

## 技术栈

### 当前已安装（`web/package.json`）

- React 19 + TypeScript ~6.0 + Vite 8（`@vitejs/plugin-react`）
- ESLint 10（flat config：`@eslint/js` + `typescript-eslint` + `react-hooks` + `react-refresh`）

### 设计文档规划的选型（实施时按此引入）

| 层 | 选型 |
|---|---|
| 路由 | React Router v6 |
| 状态管理 | Zustand（服务端数据不进全局 store，由组件内 useFetch 管理） |
| UI 样式 | Tailwind CSS（深浅双主题） |
| Markdown | react-markdown + remark-gfm + highlight.js（**禁用原始 HTML**，防 XSS） |
| HTTP | fetch 封装（`src/api/client.ts`，二期可换 TanStack Query） |

注意：设计文档第 1 页写的"React 18"已过时，实际安装的是 React 19。

## 构建与测试命令

所有命令在 `web/` 目录下执行：

```bash
npm install        # 安装依赖（已有 package-lock.json，勿换包管理器）
npm run dev        # Vite 开发服务器（HMR）
npm run build      # 先 tsc -b 类型检查，再 vite build 到 dist/
npm run lint       # ESLint 检查
npm run preview    # 预览构建产物
```

- **没有测试框架**（无 Vitest/Jest/Playwright），不要擅自新建测试基础设施；验证方式是"能跑、能肉眼验证"（设计文档第 9 章的验收标准）。
- 提交代码前须通过 `npm run build`（含类型检查）和 `npm run lint`。

## 代码组织（设计文档规划的目标结构）

```
web/src/
├── api/          # API 封装，每个文件对应后端一个 group（client.ts 统一解包）
├── components/   # 通用组件（Loading/Empty/ErrorState、ArticleCard、MarkdownRenderer…）
├── hooks/        # useFetch / useDebounce / useAuth / useTitle
├── pages/        # site/（前台）、auth/、admin/（后台）、user/（二期）
├── stores/       # Zustand stores（useAuthStore、useThemeStore）
├── router/       # 路由配置与守卫
└── types/        # TS 类型，与后端 .api 的 type 逐字段对应
```

一期实施路径见设计文档第 9 章（阶段 A 地基 → B 前台 → C 认证与后台 → D 收尾上线），按步骤顺序推进，每步验收后再进下一步。

## 与后端的契约要点（必须遵守）

- 统一响应包装 `{ code, message, data }`，**HTTP 状态码恒为 200**，业务成败看 `code`（0 成功；40101 登录失败；40103 token 无效/过期 → 清空登录态跳 `/login?redirect=`）。
- 接口前缀 `/v1`（无 `/api` 前缀）；管理接口走 `Authorization: Bearer <accessToken>`。
- JSON 字段全部驼峰（`publishedAt`、`coverUrl` 等），时间戳为 RFC3339 带时区。
- 一期登录响应 `refreshToken` 为空串，**无刷新机制**；accessToken 只存内存，刷新页面即回到游客态（已知取舍）。
- 评论：后端返回扁平列表，前端按 `parentId` 组树；游客可发表（可选昵称），发表后进待审核，公开列表只含已通过评论。
- 开发环境用 Vite dev server proxy 把 `/v1` 代理到 `http://localhost:8812`（需在 `vite.config.ts` 中配置，目前未配）。

## 代码风格约定

- TypeScript 严格检查：`noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`、`verbatimModuleSyntax`（类型导入须用 `import type`）。
- JSX 用 `react-jsx` 转换，函数组件 + Hooks；ESLint 启用 react-hooks 与 react-refresh 规则。
- 所有数据页面必须覆盖 loading / empty / error 三态（复用三态组件）。
- 后台路由用 `React.lazy` 懒加载，游客不下载后台代码包。
- 文档与注释使用中文。

## 安全注意事项

- Markdown 渲染禁用原始 HTML；评论纯文本转义展示（防 XSS）。
- accessToken 只存内存，**不落 localStorage**。
- 密钥与配置不入库；`.env` 类文件已在忽略之列，不要提交。

## 构建与部署（规划）

- 全 Docker 化：多阶段构建（node 阶段 `npm run build` → Nginx 托管产物），无独立 Node 运行时。`Dockerfile` 尚未编写（阶段 D3 任务）。
- SPA history 模式，Nginx 需配 `try_files $uri /index.html`。
- 部署不走镜像仓库：服务器 `git pull` 后本地 `docker compose up -d --build`；注意 `npm run build` 内存峰值常超 1.5GB，2C2G 服务器需先配 swap。
