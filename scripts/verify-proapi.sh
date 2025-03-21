#!/bin/bash

# ProAPI接口验证脚本
# 用途：验证类型1接口的JWT令牌传递和请求转发

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 获取JWT令牌
read -p "请输入JWT令牌: " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}错误: 令牌不能为空${NC}"
  exit 1
fi

# 设置应用ID
APP_ID="67b131b0d9d41c2d4f2b5d7d"

# 设置基础URL
BASE_URL="http://localhost:3000"

# 定义要测试的接口
declare -a ENDPOINTS=(
  "/api/proApi/support/user/team/list"
  "/api/proApi/core/app/plugin/getSystemPlugins"
  "/api/proApi/support/user/inform/getSystemMsgModal"
)

# 请求头
HEADERS=(
  -H "Authorization: Bearer $JWT_TOKEN"
  -H "Content-Type: application/json"
)

# 测试GET请求
test_get() {
  local endpoint=$1
  
  echo -e "${YELLOW}测试GET请求: $endpoint${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}" "${HEADERS[@]}")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试GET请求带参数
test_get_with_params() {
  local endpoint=$1
  local params=$2
  
  echo -e "${YELLOW}测试GET请求: $endpoint?$params${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}?${params}" "${HEADERS[@]}")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试POST请求
test_post() {
  local endpoint=$1
  local data=$2
  
  echo -e "${YELLOW}测试POST请求: $endpoint${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${endpoint}" "${HEADERS[@]}" -d "$data")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试所有GET接口
run_get_tests() {
  echo -e "${YELLOW}开始测试GET接口...${NC}"
  
  for endpoint in "${ENDPOINTS[@]}"; do
    test_get "$endpoint"
  done
  
  # 测试需要应用ID参数的协作者列表
  test_get_with_params "/api/proApi/core/app/collaborator/list" "appId=${APP_ID}"
}

# 运行所有测试
main() {
  echo -e "${GREEN}===== ProAPI接口验证脚本 =====${NC}"
  echo "基础URL: $BASE_URL"
  echo -e "使用JWT令牌: ${YELLOW}$(echo $JWT_TOKEN | cut -c 1-10)...${NC}"
  echo -e "应用ID: ${YELLOW}${APP_ID}${NC}"
  echo "---------------------------------"
  
  run_get_tests
  
  echo -e "${GREEN}测试完成!${NC}"
}

# 执行主函数
main 