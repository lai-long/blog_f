#!/usr/bin/env bash
# 服务器初始化（Ubuntu/Debian，2C2G 小内存机器）：装 Docker + Docker Compose 插件 + 配 swap
# 用法：sudo bash init-server.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "请用 root 或 sudo 运行" >&2
    exit 1
fi

echo "==> 安装 Docker"
if ! command -v docker >/dev/null; then
    apt-get update
    apt-get install -y docker.io
    systemctl enable --now docker
else
    echo "    已安装，跳过"
fi

echo "==> 安装 Docker Compose 插件（docker compose 子命令）"
if docker compose version >/dev/null 2>&1; then
    echo "    已可用，跳过"
else
    # Debian/Ubuntu 包名不同，逐个尝试；都没有就装官方二进制
    if apt-get install -y docker-compose-v2 2>/dev/null; then
        :
    elif apt-get install -y docker-compose-plugin 2>/dev/null; then
        :
    else
        echo "    软件源没有 compose 包，下载官方二进制"
        mkdir -p /usr/local/lib/docker/cli-plugins
        curl -fSL --retry 3 -o /usr/local/lib/docker/cli-plugins/docker-compose \
            https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64
        chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi
    docker compose version
fi

echo "==> 配置 2G swap（npm run build 内存峰值常超 1.5GB，2C2G 机器必须配）"
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "    swap 已开启："
    free -h | grep -i swap
else
    echo "    /swapfile 已存在，跳过"
fi

echo "==> 完成。接下来：git clone 后端和本仓库，按各自 DEPLOY.md 部署"
