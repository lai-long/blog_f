#!/usr/bin/env bash
# 本地构建部署（推荐）：在笔记本上构建镜像 → 传到服务器加载 → 重启容器。
# 2C2G 服务器上跑 npm build 容易 OOM 卡死，构建活放在本机干。
#
# 用法（在本机、blog_f 仓库根目录）：
#   ./deploy-local.sh
# 可用环境变量覆盖：SERVER=user@host REMOTE_DIR=~/myblog/blog_f
set -euo pipefail
cd "$(dirname "$0")"

SERVER="${SERVER:-root@101.201.119.1}"
REMOTE_DIR="${REMOTE_DIR:-~/myblog/blog_f}"
IMAGE="blog_f-web:latest" # 与 docker compose 默认镜像名（项目-服务）一致，up -d 会直接用它

echo "==> 本地构建镜像 $IMAGE"
docker build -t "$IMAGE" ./web

echo "==> 传输镜像到 $SERVER 并加载"
docker save "$IMAGE" | gzip | ssh "$SERVER" "gunzip | docker load"

echo "==> 服务器上重建容器"
# git pull 失败（GitHub 网络抖动）不影响本次部署：镜像里已包含最新代码
ssh "$SERVER" "docker network create blog-net 2>/dev/null; cd $REMOTE_DIR && { git pull || echo '!! git pull 失败，跳过（不影响部署）'; } && docker compose up -d"

echo "==> 健康检查"
sleep 2
if ssh "$SERVER" "curl -fsS -o /dev/null http://127.0.0.1:8080/"; then
    echo "==> 完成：http://101.201.119.1 （或 https://herelai.top）"
else
    echo "!! 首页不可访问，到服务器上看日志：docker compose logs web" >&2
    exit 1
fi
