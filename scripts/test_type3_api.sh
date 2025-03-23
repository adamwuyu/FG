#!/bin/bash

# 类型3接口测试脚本
# 用途：测试不含proApi但需调用proApi的接口（类型3接口）

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置基础URL
LOCAL_URL="http://localhost:3000"
PROAPI_URL="http://localhost:3002"

# 定义登录凭证
USERNAME="root"
PASSWORD="IloveGPT!"

# 临时文件
TEMP_FILE=$(mktemp)
trap 'rm -f $TEMP_FILE' EXIT

# 测试函数：测试未读消息统计接口
test_count_unread_msgs() {
  local cookies=$1
  local token=$2
  local endpoint="/api/support/user/inform/countUnread"
  
  echo -e "${YELLOW}测试类型3接口 (内部调用proApi): $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  
  # 发送请求，提供Cookie认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -H "Content-Type: application/json" \
    -b "$cookies")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应内容: $body"
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试函数：测试系统插件模板接口
test_system_plugin_templates() {
  local cookies=$1
  local token=$2
  local endpoint="/api/core/app/plugin/getSystemPluginTemplates"
  
  echo -e "${YELLOW}测试类型3接口 (内部调用proApi): $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  
  # 发送请求，提供Cookie认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -b "$cookies" \
    -d '{"parentId":null}')
  
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

# 测试函数：测试获取应用列表接口
test_app_list() {
  local cookies=$1
  local token=$2
  local endpoint="/api/core/app/list"
  
  echo -e "${YELLOW}测试类型3接口 (内部调用proApi): $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  
  # 发送请求，提供Cookie认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -b "$cookies" \
    -d '{}')
  
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

# 测试函数：测试用户钱包使用情况统计
test_wallet_usage_statistics() {
  local cookies=$1
  local token=$2
  local endpoint="/api/support/wallet/usage/statistics"
  
  echo -e "${YELLOW}测试类型3接口 (内部调用proApi): $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  
  # 获取当前月份的第一天和最后一天
  local first_day=$(date -j -f "%Y-%m-%d" "$(date +%Y-%m)-01" +%s)
  local last_day=$(date -j -f "%Y-%m-%d" "$(date -d "$(date +%Y-%m-01) + 1 month - 1 day" +%Y-%m-%d)" +%s 2>/dev/null || date -j -v+1m -v-1d -f "%Y-%m-%d" "$(date +%Y-%m)-01" +%s)
  
  # 发送请求，提供Cookie认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -b "$cookies" \
    -d "{\"start\":$first_day,\"end\":$last_day}")
  
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

# 测试函数：测试团队接口
test_team_list() {
  local cookies=$1
  local token=$2
  local endpoint="/api/support/user/team/info"
  
  echo -e "${YELLOW}测试类型3接口 (内部调用proApi): $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  
  # 发送请求，提供Cookie认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -H "Content-Type: application/json" \
    -b "$cookies")
  
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

# 测试所有接口时同时携带Cookie和Token
test_with_cookie_and_token() {
  local cookies=$1
  local token=$2
  local endpoint="/api/support/user/inform/countUnread"
  
  echo -e "${YELLOW}测试同时携带Cookie和Token: $endpoint${NC}"
  
  # 发送请求，同时提供Cookie和Token认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -b "$cookies")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应内容: $body"
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 主函数：运行所有测试
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
    
    # 从登录响应中提取JWT令牌
    token=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
      echo -e "${RED}JWT令牌未获取或为空${NC}"
    else
      echo -e "${GREEN}JWT令牌已获取: $(echo $token | cut -c 1-15)...${NC}"
    fi
    
    # 获取Cookie文件内容
    cookie_content=$(cat "$TEMP_FILE")
    echo -e "${BLUE}Cookie内容: ${NC}"
    echo "$cookie_content"
    
    # 测试各类型3接口
    test_count_unread_msgs "$TEMP_FILE" "$token"
    test_system_plugin_templates "$TEMP_FILE" "$token"
    test_app_list "$TEMP_FILE" "$token"
    test_wallet_usage_statistics "$TEMP_FILE" "$token"
    test_team_list "$TEMP_FILE" "$token"
    
    # 测试同时使用Cookie和Token
    test_with_cookie_and_token "$TEMP_FILE" "$token"
  else
    echo -e "${RED}登录失败 - 状态码: $login_status${NC}"
    echo "错误响应: $login_body"
  fi
  
  echo -e "${GREEN}测试完成!${NC}"
}

# 执行主函数
main
