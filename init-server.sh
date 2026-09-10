#!/usr/bin/env bash
# 服务器初始化（Ubuntu/Debian，2C2G 小内存机器）：装 Docker + 配 swap
# 用法：sudo bash init-server.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "请用 root 或 sudo 运行" >&2
    exit 1
fi

echo "==> 安装 Docker"
if ! command -v docker >/dev/null; then
    apt-get update
    apt-get install -y docker.io docker-compose-v2
    systemctl enable --now docker
else
    echo "    已安装，跳过"
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
