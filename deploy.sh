#!/usr/bin/env bash
# 前端更新部署：拉最新代码 → 本地构建镜像 → 重启容器（与后端 deploy.sh 同策略，不走镜像仓库）
# 用法：在服务器上、blog_f 仓库根目录执行 ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 拉取最新代码"
git pull

echo "==> 构建镜像（限制只用 0 号核：2C2G 机器全核编译会打满 CPU，SSH 都会卡死）"
# 镜像名与 compose 默认命名（项目目录名-服务名）一致，up -d 会直接复用，不会二次构建
docker build --cpuset-cpus=0 -t blog_f-web:latest ./web

echo "==> 启动"
docker compose up -d

echo "==> 健康检查"
sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:8080/; then
    echo "==> 完成：http://<服务器IP>:8080"
else
    echo "!! 首页不可访问，查看日志：docker compose logs web" >&2
    exit 1
fi
