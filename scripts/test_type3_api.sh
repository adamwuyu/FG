#!/bin/bash

# 类型3接口测试脚本
# 用途：测试不含proApi但需调用proApi服务的接口

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试配置
LOCAL_URL="http://localhost:3000"
PROAPI_URL="http://localhost:3002"
USERNAME="root"
PASSWORD="IloveGPT!"
TEMP_FILE="/tmp/cookies.txt"
MAX_ERROR_LENGTH=200  # 错误消息最大长度限制

# 清理临时文件
cleanup() {
  rm -f "$TEMP_FILE"
}

# 确保脚本结束时清理临时文件
trap cleanup EXIT

# 处理错误响应
format_error_response() {
  local body="$1"
  # 检查是否含有HTML标签
  if echo "$body" | grep -q "<html"; then
    echo "[HTML响应] - 响应包含HTML代码，可能是服务端错误页面。"
  else
    # 限制错误消息长度
    echo "$body" | cut -c 1-$MAX_ERROR_LENGTH
    if [ ${#body} -gt $MAX_ERROR_LENGTH ]; then
      echo "...(已截断剩余内容)"
    fi
  fi
}

# 测试未读消息接口
test_unread_messages() {
  echo -e "${YELLOW}测试未读消息接口 /api/support/user/inform/countUnread${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/inform/countUnread" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -b "$TEMP_FILE")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 测试系统插件模板接口
test_system_plugin_templates() {
  echo -e "${YELLOW}测试系统插件模板接口 /api/core/app/plugin/getSystemPluginTemplates${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/core/app/plugin/getSystemPluginTemplates" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -b "$TEMP_FILE" \
    -d "{}")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 测试应用列表接口
test_app_list() {
  echo -e "${YELLOW}测试应用列表接口 /api/core/app/list${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/core/app/list" \
    -X POST \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -b "$TEMP_FILE" \
    -d "{}")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 测试钱包使用统计
test_wallet_usage() {
  echo -e "${YELLOW}测试钱包使用统计接口 /api/support/wallet/usage/statistics${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/support/wallet/usage/statistics" \
    -X POST \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -b "$TEMP_FILE" \
    -d "{}")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 测试团队信息接口
test_team_info() {
  echo -e "${YELLOW}测试团队信息接口 /api/support/user/team/info${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/team/info" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -b "$TEMP_FILE")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 测试无Cookie访问
test_no_cookie_access() {
  echo -e "${YELLOW}测试无Cookie访问（应失败）: /api/support/user/inform/countUnread${NC}"
  
  # 发送请求（仅带JWT令牌，不带Cookie）
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/inform/countUnread" \
    -H "Authorization: Bearer $JWT_TOKEN")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态（期望失败，接受401、403或500状态码）
  if [ "$status_code" -eq 401 ] || [ "$status_code" -eq 403 ] || [ "$status_code" -eq 500 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功失败（符合预期）${NC}"
    echo "错误响应: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 未按预期失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 测试无令牌访问
test_no_token_access() {
  echo -e "${YELLOW}测试无JWT令牌访问（应降级到仅Cookie验证）: /api/support/user/inform/countUnread${NC}"
  
  # 发送请求（仅带Cookie，不带JWT令牌）
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/inform/countUnread" \
    -b "$TEMP_FILE")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功（降级到本地实现）${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo -n "错误响应: "
    format_error_response "$body"
  fi
  
  echo "---------------------------------"
}

# 主函数
main() {
  echo -e "${GREEN}===== 类型3接口测试 =====${NC}"
  echo "本地服务URL: $LOCAL_URL"
  echo "ProAPI服务URL: $PROAPI_URL"
  echo "用户名: $USERNAME"
  echo "密码: $PASSWORD"
  echo "---------------------------------"
  
  # 测试ProAPI服务可达性
  echo -e "${YELLOW}测试 ProAPI 服务是否可达${NC}"
  proapi_response=$(curl -s -w "\n%{http_code}" "$PROAPI_URL/" || echo "连接失败\n000")
  proapi_status=$(echo "$proapi_response" | tail -n1)
  
  if [ "$proapi_status" -ge 200 ] && [ "$proapi_status" -lt 300 ]; then
    echo -e "${GREEN}ProAPI 服务可达 - 状态码: $proapi_status${NC}"
  else
    echo -e "${RED}ProAPI 服务不可达 - 状态码: $proapi_status${NC}"
    echo "请确保 ProAPI 服务正在运行..."
  fi
  
  echo "---------------------------------"
  
  # 登录并获取JWT令牌和Cookie
  echo -e "${YELLOW}开始登录测试...${NC}"
  
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    echo -e "${GREEN}登录成功 - 状态码: $login_status${NC}"
    
    # 从响应中提取JWT令牌
    JWT_TOKEN=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    
    if [ -n "$JWT_TOKEN" ]; then
      echo -e "${GREEN}成功获取JWT令牌${NC}"
      
      # 测试基本功能（带Cookie和JWT令牌）
      test_unread_messages
      test_system_plugin_templates
      test_app_list
      test_wallet_usage
      test_team_info
      
      # 测试认证场景
      test_no_cookie_access
      test_no_token_access
    else
      echo -e "${RED}未能从登录响应中获取JWT令牌${NC}"
      echo -n "响应内容: "
      format_error_response "$login_body"
    fi
  else
    echo -e "${RED}登录失败 - 状态码: $login_status${NC}"
    echo -n "错误响应: "
    format_error_response "$login_body"
  fi
  
  echo -e "${GREEN}===== 测试完成 =====${NC}"
}

# 执行主函数
main
