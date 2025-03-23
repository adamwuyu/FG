#!/bin/bash

# 插件API测试脚本
# 用途：测试系统插件模板和插件组API

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

# 测试系统插件模板接口 (类型2 - 本地Cookie认证接口)
test_system_plugin_templates() {
  local cookies=$1
  local token=$2
  local endpoint="/api/core/app/plugin/getSystemPluginTemplates"
  
  echo -e "${YELLOW}测试系统插件模板接口: $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  echo -e "${BLUE}使用Token: ${token}${NC}"
  
  # 尝试使用不同方式发送请求 - 同时尝试使用多种认证方式
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    -H "token: ${token}" \
    -b "$cookies" \
    --cookie-jar "$cookies" \
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

# 测试插件组接口 (类型1 - ProAPI接口)
test_plugin_groups() {
  local token=$1
  local endpoint="/api/proApi/core/app/plugin/getPluginGroups"
  
  echo -e "${YELLOW}测试插件组接口: $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${LOCAL_URL}${endpoint}${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
  else
    echo -e "${RED}状态码: $status_code - 失败${NC}"
    # 检查响应是否为HTML (包含<!DOCTYPE html>标记)
    if [[ "$body" == *"<!DOCTYPE html>"* ]]; then
      echo "错误响应: [HTML页面] - 返回了HTML页面而不是API响应"
    else
      echo "错误响应: $body"
    fi
  fi
  
  echo "---------------------------------"
}

# 测试直接访问ProAPI的插件接口
test_direct_proapi_plugin() {
  local token=$1
  local endpoint="/api/core/app/plugin/getPluginGroups"
  
  echo -e "${YELLOW}测试直接访问ProAPI的插件接口: $endpoint${NC}"
  echo -e "${BLUE}请求URL: ${PROAPI_URL}${endpoint}${NC}"
  
  # 发送请求
  response=$(curl -s -w "\n%{http_code}" "${PROAPI_URL}${endpoint}" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json")
  
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

# 检查JWT令牌是否已获取
check_jwt_token() {
  local token=$1
  if [ -z "$token" ]; then
    echo -e "${RED}JWT令牌未获取或为空${NC}"
    return 1
  else
    echo -e "${GREEN}JWT令牌已获取: $(echo $token | cut -c 1-15)...${NC}"
    return 0
  fi
}

# 主函数：运行所有测试
main() {
  echo -e "${GREEN}===== 插件接口测试 =====${NC}"
  echo "本地服务URL: $LOCAL_URL"
  echo "ProAPI服务URL: $PROAPI_URL"
  echo "用户名: $USERNAME"
  echo "密码: $PASSWORD"
  echo "---------------------------------"
  
  # 测试ProAPI服务可达性
  echo -e "${YELLOW}测试 ProAPI 服务是否可达${NC}"
  echo -e "${BLUE}ProAPI URL: $PROAPI_URL${NC}"
  
  proapi_response=$(curl -s -w "\n%{http_code}" "$PROAPI_URL/" || echo "连接失败\n000")
  
  proapi_status=$(echo "$proapi_response" | tail -n1)
  proapi_body=$(echo "$proapi_response" | sed '$d')
  
  if [ "$proapi_status" -ge 200 ] && [ "$proapi_status" -lt 300 ]; then
    echo -e "${GREEN}ProAPI 服务可达 - 状态码: $proapi_status${NC}"
  else
    echo -e "${RED}ProAPI 服务不可达 - 状态码: $proapi_status${NC}"
    echo "响应: $proapi_body"
    echo "请确保 ProAPI 服务正在运行..."
  fi
  
  echo "---------------------------------"
  
  # 登录并获取JWT令牌
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
    
    check_jwt_token "$token"
    token_valid=$?
    
    # 获取Cookie文件内容
    cookie_content=$(cat "$TEMP_FILE")
    echo -e "${BLUE}Cookie内容: ${NC}"
    echo "$cookie_content"
    
    # 测试系统插件模板接口 (类型2 - 需要Cookie认证)
    test_system_plugin_templates "$TEMP_FILE" "$token"
    
    # 如果令牌有效则测试插件组接口 (类型1 - 需要JWT认证)
    if [ $token_valid -eq 0 ]; then
      test_plugin_groups "$token"
      
      # 测试直接访问ProAPI
      test_direct_proapi_plugin "$token"
    fi
  else
    echo -e "${RED}登录失败 - 状态码: $login_status${NC}"
    echo "错误响应: $login_body"
  fi
  
  echo -e "${GREEN}测试完成!${NC}"
}

# 执行主函数
main
