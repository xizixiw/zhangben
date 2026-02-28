#!/bin/bash

# 本地账本打包脚本
# 根据当前操作系统自动选择打包目标

echo "=== 本地账本打包脚本 ==="

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 构建前端
echo "正在构建前端..."
npm run build:vite

# 获取操作系统
OS=$(uname -s)

case "$OS" in
    Linux*)
        echo "检测到 Linux 系统，生成 Linux 安装包..."
        npx electron-builder --linux
        ;;
    Darwin*)
        echo "检测到 macOS 系统，生成 macOS 安装包..."
        npx electron-builder --mac
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "检测到 Windows 系统，生成 Windows 安装包..."
        npx electron-builder --win
        ;;
    *)
        echo "未知操作系统: $OS"
        exit 1
        ;;
esac

echo "打包完成！"
echo "安装包位于 release/ 目录"
