#!/bin/bash

# Cookie认证测试脚本
# 用途：测试类型2接口是否正确使用Cookie进行身份验证

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置基础URL
LOCAL_URL="http://localhost:3000"

# 定义登录凭证
USERNAME="root"
PASSWORD="IloveGPT!"

# 临时文件
TEMP_FILE=$(mktemp)
trap 'rm -f $TEMP_FILE' EXIT

# 测试类型2接口：应用列表接口
test_app_list_api() {
  local cookies=$1
  local endpoint="/api/core/app/list"
  
  echo -e "${YELLOW}测试类型2接口 (Cookie认证): $endpoint${NC}"
  
  # 发送请求 - 仅使用Cookie认证
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

# 测试类型2接口：数据集列表接口
test_dataset_list_api() {
  local cookies=$1
  local endpoint="/api/core/dataset/list"
  
  echo -e "${YELLOW}测试类型2接口 (Cookie认证): $endpoint${NC}"
  
  # 发送请求 - 仅使用Cookie认证
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -b "$cookies" \
    -d '{"pageNum":1,"pageSize":20}')
  
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

# 测试类型2接口：系统初始化数据
test_system_init_data_api() {
  local cookies=$1
  local endpoint="/api/common/system/getInitData"
  
  echo -e "${YELLOW}测试类型2接口 (Cookie认证): $endpoint${NC}"
  
  # 发送请求 - 仅使用Cookie认证
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

# 测试类型2接口：获取插件模板
test_system_plugin_templates_api() {
  local cookies=$1
  local endpoint="/api/core/app/plugin/getSystemPluginTemplates"
  
  echo -e "${YELLOW}测试类型2接口 (Cookie认证): $endpoint${NC}"
  
  # 发送请求 - 仅使用Cookie认证
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

# 测试类型2接口：获取应用详情接口
test_app_detail_api() {
  local cookies=$1
  local appId=$2
  local endpoint="/api/core/app/detail?appId=${appId}"
  
  echo -e "${YELLOW}测试类型2接口 (Cookie认证): $endpoint${NC}"
  
  # 发送请求 - 仅使用Cookie认证
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

# 测试无Cookie访问的情况
test_no_cookie_access() {
  local endpoint="/api/core/app/list"
  
  echo -e "${YELLOW}测试无Cookie访问 (预期失败): $endpoint${NC}"
  
  # 发送请求 - 不提供Cookie
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{}')
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态 - 这里应该失败
  if [ "$status_code" -ge 400 ] && [ "$status_code" -lt 500 ]; then
    echo -e "${GREEN}状态码: $status_code - 预期的授权失败${NC}"
    echo "错误响应: $body"
  else
    echo -e "${RED}状态码: $status_code - 意外的响应${NC}"
    echo "响应内容: $body"
  fi
  
  echo "---------------------------------"
}

# 主函数：运行所有测试
main() {
  echo -e "${GREEN}===== 类型2接口 Cookie认证测试 =====${NC}"
  echo "本地服务URL: $LOCAL_URL"
  echo "用户名: $USERNAME"
  echo "密码: $PASSWORD"
  echo "---------------------------------"
  
  # 首先测试无Cookie访问
  test_no_cookie_access
  
  # 登录获取Cookie
  echo -e "${YELLOW}开始登录测试...${NC}"
  
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    echo -e "${GREEN}登录成功 - 状态码: $login_status${NC}"
    
    # 获取Cookie文件内容
    cookie_content=$(cat "$TEMP_FILE")
    echo -e "${BLUE}Cookie内容: ${NC}"
    echo "$cookie_content"
    
    # 测试应用列表API，获取第一个应用的ID用于后续测试
    echo -e "${YELLOW}获取应用列表以获取应用ID...${NC}"
    app_list_response=$(curl -s "${LOCAL_URL}/api/core/app/list" \
      -X POST \
      -H "Content-Type: application/json" \
      -b "$TEMP_FILE" \
      -d '{}')
    
    # 从应用列表中提取第一个应用的ID
    first_app_id=$(echo "$app_list_response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ ! -z "$first_app_id" ]; then
      echo -e "${GREEN}获取到应用ID: $first_app_id${NC}"
      
      # 测试各类型2接口
      test_app_list_api "$TEMP_FILE"
      test_dataset_list_api "$TEMP_FILE"
      test_system_init_data_api "$TEMP_FILE"
      test_system_plugin_templates_api "$TEMP_FILE"
      test_app_detail_api "$TEMP_FILE" "$first_app_id"
    else
      echo -e "${RED}未能获取到有效的应用ID${NC}"
      
      # 仍然测试不需要应用ID的接口
      test_app_list_api "$TEMP_FILE"
      test_dataset_list_api "$TEMP_FILE"
      test_system_init_data_api "$TEMP_FILE"
      test_system_plugin_templates_api "$TEMP_FILE"
    fi
  else
    echo -e "${RED}登录失败 - 状态码: $login_status${NC}"
    echo "错误响应: $login_body"
  fi
  
  echo -e "${GREEN}测试完成!${NC}"
}

# 执行主函数
main 