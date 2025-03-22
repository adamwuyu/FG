#!/bin/bash

# ProAPI服务安装和配置脚本
# 用途：确保ProAPI服务正确配置和启动

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查端口占用
check_port() {
  local port=$1
  if lsof -i:$port > /dev/null 2>&1; then
    echo -e "${RED}端口 $port 已被占用，请关闭占用该端口的进程后再试${NC}"
    return 1
  fi
  return 0
}

# 检查环境变量
check_env() {
  # 检查 .env 文件
  if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env 文件不存在，将创建新的文件${NC}"
    touch .env
  fi
  
  # 检查 PRO_URL 环境变量
  if ! grep -q "PRO_URL=" .env; then
    echo -e "${YELLOW}添加 PRO_URL 环境变量${NC}"
    echo "PRO_URL=http://localhost:3002" >> .env
  else
    # 更新 PRO_URL 环境变量格式
    sed -i '' 's|PRO_URL=.*|PRO_URL=http://localhost:3002|g' .env
  fi
  
  echo -e "${GREEN}环境变量检查完成${NC}"
}

# 启动服务
start_services() {
  echo -e "${GREEN}启动服务...${NC}"
  
  # 检查本地服务端口
  check_port 3000
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  # 检查ProAPI端口
  check_port 3002
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  # 使用 pnpm 启动服务
  echo -e "${YELLOW}启动本地服务...${NC}"
  pnpm run dev:main &
  
  # 等待本地服务启动
  echo -e "${YELLOW}等待本地服务启动...${NC}"
  sleep 5
  
  # 启动 ProAPI 服务
  echo -e "${YELLOW}启动 ProAPI 服务...${NC}"
  pnpm run dev:pro &
  
  echo -e "${GREEN}服务启动完成${NC}"
}

# 测试服务可用性
test_services() {
  echo -e "${YELLOW}测试本地服务可用性...${NC}"
  
  # 等待服务完全启动
  sleep 10
  
  # 测试本地服务
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}本地服务运行正常${NC}"
  else
    echo -e "${RED}本地服务可能未正常运行${NC}"
  fi
  
  # 测试ProAPI服务
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}ProAPI服务运行正常${NC}"
  else
    echo -e "${RED}ProAPI服务可能未正常运行${NC}"
  fi
}

# 停止服务
stop_services() {
  echo -e "${YELLOW}停止服务...${NC}"
  
  # 查找并停止相关进程
  pkill -f "pnpm run dev:main" || true
  pkill -f "pnpm run dev:pro" || true
  
  echo -e "${GREEN}服务已停止${NC}"
}

# 显示使用帮助
show_help() {
  echo -e "${GREEN}ProAPI服务安装和配置脚本${NC}"
  echo -e "用法: ./setup_proapi.sh [选项]"
  echo -e "选项:"
  echo -e "  start    启动服务"
  echo -e "  stop     停止服务"
  echo -e "  restart  重启服务"
  echo -e "  test     测试服务"
  echo -e "  env      检查环境变量"
  echo -e "  help     显示帮助信息"
}

# 主函数
main() {
  case "$1" in
    start)
      check_env
      start_services
      test_services
      ;;
    stop)
      stop_services
      ;;
    restart)
      stop_services
      sleep 2
      check_env
      start_services
      test_services
      ;;
    test)
      test_services
      ;;
    env)
      check_env
      ;;
    help|*)
      show_help
      ;;
  esac
}

# 执行主函数
main "$@" 