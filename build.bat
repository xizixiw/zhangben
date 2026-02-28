@echo off
REM 本地账本 Windows 打包脚本

echo === 本地账本打包脚本 ===

REM 检查依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
)

REM 构建前端
echo 正在构建前端...
npm run build:vite

REM 打包 Windows 安装程序
echo 正在打包 Windows 安装程序...
npx electron-builder --win

echo 打包完成！
echo 安装包位于 release/ 目录

pause
