# 前端部署文档

个人博客前端（Vite + React SPA），Docker 多阶段构建，Nginx 托管产物并反代后端 API。

## 架构

```
浏览器 → Nginx（web 容器，80 端口）
          ├── /v1/*   → 反向代理到后端（宿主机 8812）
          ├── /assets/* → 静态资源，永久缓存（文件名带内容哈希）
          └── 其余     → try_files 回退 index.html（SPA history 模式）
```

## 首次部署

```bash
# 1. 初始化服务器（装 Docker、配 2G swap；2C2G 机器必做，否则构建会 OOM）
sudo bash init-server.sh

# 2. 克隆代码（后端也要部署，见后端仓库 DEPLOY.md）
git clone <本仓库地址> blog_f && cd blog_f

# 3. 构建启动
docker compose up -d --build

# 4. 验证
curl http://127.0.0.1:8080/                    # 首页 200
curl http://127.0.0.1:8080/v1/site/config      # 经 nginx 代理到后端，返回 JSON
```

## 日常更新

```bash
./deploy.sh    # git pull → 重新构建 → 重启 → 健康检查
```

## 配置说明

- **后端地址**：`web/nginx.conf` 里 `proxy_pass http://host.docker.internal:8812`。
  前后端同机部署不用改；分离部署改成后端地址即可。
- **端口**：`docker-compose.yml` 里 `8080:80`，按需改左侧端口。
- 前端无环境变量、无密钥，所有配置都在这两个文件里。

## 常见问题

- **构建 OOM（Killed / exit 137）**：内存不够，确认 swap 已配（`free -h` 应有 2G Swap）。
- **页面 404**：确认 nginx.conf 的 `try_files $uri /index.html` 生效（自定义镜像要记得 COPY nginx.conf）。
- **API 502**：后端没启动或不在 8812 端口；`docker compose logs web` 看代理错误。
- **改密码/管理员初始化**：见后端仓库 DEPLOY.md。

## 已知待办（后端侧）

- `GET /v1/rss`、`GET /v1/sitemap.xml` 后端尚未实现（前端页脚入口已留，当前 404）。
