#!/bin/bash

# 需求文档生成工具启动脚本

echo "🚀 启动需求文档生成工具..."

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否已安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 启动后端服务
echo "📡 启动后端服务..."
cd backend

# 检查后端依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

# 启动后端
echo "🔥 后端服务启动中... (http://localhost:3000)"
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
echo "🎨 启动前端服务..."
cd ../frontend

# 检查前端依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动前端
echo "✨ 前端服务启动中... (http://localhost:8080)"
npm run dev &
FRONTEND_PID=$!

echo "🎉 服务启动完成！"
echo "📍 后端API: http://localhost:3000"
echo "🌐 前端应用: http://localhost:8080"
echo "🔍 健康检查: http://localhost:3000/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait