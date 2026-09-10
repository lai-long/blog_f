# AGENTS.md

本文件供 AI 编码代理阅读，描述 `blog_f`（个人博客系统前端）的项目结构、技术栈与开发约定。

## 项目概述

个人博客系统的前端仓库，**一期已完成**（设计文档第 9 章的阶段 A~D 全部落地）。

- 仓库根目录的 `web/` 是 Vite + React + TypeScript 单页应用，前台（首页/详情/归档/搜索/关于）与后台（仪表盘/文章/写作/评论/设置）均已实现。
- 权威设计依据是根目录的 **`博客系统设计文档-前端.md`（v2.1）**；实施过程中对后端的契约做过两处增补（`ArticleDetail` 补 `summary`、`AdminComment` 补 `articleSlug`），见 git 历史。
- 后端为独立仓库（Go，go-zero，接口见后端 `.api` 文件），本仓库不含后端代码。
- 分期策略：一期只有"游客 + 管理员"两种身份；注册/登录用户体系为二期。一期无标签（tag）功能，资源命名为 **article**（不是 post）。

## 技术栈

- React 19 + TypeScript ~6.0 + Vite 8（`@vitejs/plugin-react`）
- Tailwind CSS 4（`@tailwindcss/vite` 插件；`dark:` 变体已改为跟随 `<html>.dark` class，支持手动切换）
- React Router（路由 + 嵌套布局 + 守卫）、Zustand（`useAuthStore` 内存 token、`useThemeStore` 主题持久化）
- react-markdown + remark-gfm + rehype-slug + highlight.js（**禁用原始 HTML**，防 XSS；hljs 只注册常用语言控制包体积）
- HTTP：`src/api/client.ts` fetch 封装（统一解包 `{code,message,data}`，40103 自动跳登录）
- ESLint 10（flat config）+ typescript-eslint + react-hooks + react-refresh

## 构建与测试命令

所有命令在 `web/` 目录下执行：

```bash
npm install        # 安装依赖（已有 package-lock.json，勿换包管理器）
npm run dev        # Vite 开发服务器（HMR，/v1 代理到 localhost:8812）
npm run build      # 先 tsc -b 类型检查，再 vite build 到 dist/
npm run lint       # ESLint 检查
npm run preview    # 预览构建产物
```

- **没有测试框架**（无 Vitest/Jest/Playwright），不要擅自新建测试基础设施；验证方式是"能跑、能肉眼验证"。
- 提交代码前须通过 `npm run build`（含类型检查）和 `npm run lint`。

## 代码组织

```
web/src/
├── api/          # client.ts（统一解包/40103/上传）+ article/interact/auth/admin 各 group
├── components/   # 通用组件：Loading/Empty/ErrorState、ArticleCard、Pagination、
│                 # MarkdownRenderer、Toc、Comment*、SiteLayout、AdminLayout
├── hooks/        # useFetch（path 为 null 表示不发请求）/ useDebounce / useTitle / useMeta
├── pages/        # site/（前台 5 页）、auth/（登录）、admin/（后台 5 页）
├── stores/       # useAuthStore（token 只存内存）、useThemeStore（主题存 localStorage）
├── router/       # index.tsx（前台套 SiteLayout；/admin/* 套 AuthGuard+AdminLayout 且 lazy）+ AuthGuard
├── types/        # TS 类型，与后端 .api 的 type 逐字段对应
└── utils/        # toc（extractToc）、comment（buildCommentTree）
```

## 与后端的契约要点（必须遵守）

- 统一响应包装 `{ code, message, data }`，**HTTP 状态码恒为 200**，业务成败看 `code`（0 成功；40101 登录失败；40103 token 无效/过期 → client.ts 清空登录态跳 `/login?redirect=`）。
- 接口前缀 `/v1`（无 `/api` 前缀）；管理接口走 `Authorization: Bearer <accessToken>`。
- JSON 字段全部驼峰（`publishedAt`、`coverUrl` 等），时间戳为 RFC3339 带时区。
- 一期登录响应 `refreshToken` 为空串，**无刷新机制**；accessToken 只存内存，刷新页面即回到游客态（已知取舍）。
- 评论：后端返回扁平列表，前端按 `parentId` 组树（`utils/comment.ts`）；游客可发表（可选昵称），发表后进待审核，公开列表只含已通过评论。
- 开发环境 Vite proxy 把 `/v1` 代理到 `http://localhost:8812`；生产由 Nginx 反代。

## 代码风格约定

- TypeScript 严格检查：`noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`（禁用参数属性等需生成代码的语法）、`verbatimModuleSyntax`（类型导入须用 `import type`）。
- JSX 用 `react-jsx` 转换，函数组件 + Hooks；ESLint 启用 react-hooks（含 set-state-in-effect）与 react-refresh（组件文件不导出非组件，工具函数放 `utils/`）规则。
- 所有数据页面必须覆盖 loading / empty / error 三态（复用三态组件）。
- 后台路由用 `React.lazy` 懒加载，游客不下载后台代码包。
- 文档与注释使用中文。

## 安全注意事项

- Markdown 渲染禁用原始 HTML；评论纯文本转义展示（防 XSS）。
- accessToken 只存内存，**不落 localStorage**。
- 密钥与配置不入库；`.env` 类文件已在忽略之列，不要提交。

## 构建与部署

- 全 Docker 化：`web/Dockerfile` 多阶段构建（node 阶段 `npm run build` → nginx:alpine 托管产物），无独立 Node 运行时。
- `web/nginx.conf`：SPA `try_files $uri /index.html` 兜底、`/v1/` 反代后端、`/assets/` 永久缓存、gzip。
- 部署不走镜像仓库：服务器 `git pull` 后 `./deploy.sh`（构建+重启+健康检查）；新服务器先 `sudo bash init-server.sh`（装 Docker/Compose、配 2G swap——`npm run build` 内存峰值常超 1.5GB，2C2G 必须配）。详见根目录 `DEPLOY.md`。
- 已知后端待办：`GET /v1/rss`、`GET /v1/sitemap.xml` 未实现（前端页脚入口已留）。
