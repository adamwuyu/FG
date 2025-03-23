#!/bin/bash

# 登录测试脚本
# 用途：测试用户登录、JWT令牌获取和不同类型接口的访问

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

# 测试类型1接口：ProAPI接口
test_type1_api() {
  local token=$1
  local endpoint="/api/proApi/support/user/team/list"
  
  echo -e "${YELLOW}测试类型1接口 (ProAPI): $endpoint${NC}"
  
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
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试类型2接口：本地Cookie认证接口
test_type2_api() {
  local cookies=$1
  local endpoint="/api/core/app/list"
  
  echo -e "${YELLOW}测试类型2接口 (Cookie认证): $endpoint${NC}"
  
  # 发送请求
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

# 测试协作者列表接口
test_collaborator_api() {
  local token=$1
  local appId="646638c81d4a9aba3d239e84"  # 使用一个测试应用ID，实际使用时可以替换
  local endpoint="/api/proApi/core/app/collaborator/list?appId=${appId}"
  
  echo -e "${YELLOW}测试协作者列表接口: $endpoint${NC}"
  
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
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试系统插件接口
test_system_plugins_api() {
  local token=$1
  local endpoint="/api/proApi/core/app/plugin/getSystemPlugins"
  
  echo -e "${YELLOW}测试系统插件接口: $endpoint${NC}"
  
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
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试系统消息模态框接口
test_system_msg_modal_api() {
  local token=$1
  local endpoint="/api/proApi/support/user/inform/getSystemMsgModal"
  
  echo -e "${YELLOW}测试系统消息模态框接口: $endpoint${NC}"
  
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
    echo "错误响应: $body"
  fi
  
  echo "---------------------------------"
}

# 测试类型3接口：调用proApi的本地接口
test_type3_api() {
  local cookies=$1
  local token=$2
  local endpoint="/api/proApi/support/user/inform/countUnread"
  
  echo -e "${YELLOW}测试类型3接口 (调用proApi): $LOCAL_URL$endpoint${NC}"
  
  # 发送请求（包含Cookie和JWT令牌）
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
    -H "Authorization: Bearer $token" \
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
    # 检查响应是否为HTML (包含<!DOCTYPE html>标记)
    if [[ "$body" == *"<!DOCTYPE html>"* ]]; then
      echo "错误响应: [HTML页面] - 返回了HTML页面而不是API响应"
    else
      echo "错误响应: $body"
    fi
  fi
  
  echo "---------------------------------"
}

# 测试直接访问ProAPI接口
test_direct_proapi() {
  local token=$1
  local endpoint="/api/support/user/auth/refreshToken"
  
  echo -e "${YELLOW}测试直接访问ProAPI接口: $PROAPI_URL$endpoint${NC}"

  # 发送请求 - 使用POST方法并提供用户名密码
  response=$(curl -s -w "\n%{http_code}" "${PROAPI_URL}${endpoint}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  # 提取状态码和响应体
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # 打印响应状态
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}状态码: $status_code - 成功${NC}"
    echo "响应简要内容: $(echo $body | cut -c 1-100)..."
    
    # 提取新的JWT令牌
    new_token=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$new_token" ]; then
      echo -e "${GREEN}成功刷新JWT令牌: $(echo $new_token | cut -c 1-15)...${NC}"
    fi
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

# 测试直接调用 getJwtToken 接口
test_get_jwt_token_api() {
  echo -e "${YELLOW}测试 getJwtToken 接口${NC} url: $LOCAL_URL/api/support/user/account/loginByPassword"
  
  # 先登录获取Cookie
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    echo -e "${GREEN}登录成功，获取Cookie成功${NC}"
  else
    echo -e "${RED}登录失败: $login_status${NC}"
    echo "错误响应: $login_body"
    return 1
  fi
  
  # 使用Cookie直接调用getJwtToken
  response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/proApi/support/user/auth/login" \
    -X POST \
    -H "Content-Type: application/json" \
    -b "$TEMP_FILE" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  echo -e "${BLUE}请求URL: ${LOCAL_URL}/api/proApi/support/user/auth/login${NC}"
  
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

# 测试 ProAPI 是否可达（测试环境配置）
test_proapi_reachable() {
  echo -e "${YELLOW}测试 ProAPI 服务是否可达${NC}"
  echo -e "${BLUE}ProAPI URL: $PROAPI_URL${NC}"
  
  # 直接访问根路径，应该返回欢迎信息
  response=$(curl -s -w "\n%{http_code}" "$PROAPI_URL/" || echo "连接失败\n000")
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo -e "${GREEN}ProAPI 服务可达 - 状态码: $status_code${NC}"
    echo "响应: $body"
    return 0
  else
    echo -e "${RED}ProAPI 服务不可达 - 状态码: $status_code${NC}"
    echo "响应: $body"
    return 1
  fi
}

# 主函数：运行所有测试
main() {
  echo -e "${GREEN}===== 登录和JWT令牌测试 =====${NC}"
  echo "本地服务URL: $LOCAL_URL"
  echo "ProAPI服务URL: $PROAPI_URL"
  echo "用户名: $USERNAME"
  echo "密码: $PASSWORD"
  echo "---------------------------------"
  
  # 测试ProAPI服务可达性
  test_proapi_reachable
  
  # 测试直接调用ProAPI的登录接口
  test_proapi_get_jwt_token
  
  # 测试本地getJwtToken接口
  test_get_jwt_token_api
  
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
    
    # 如果令牌有效则测试各种接口
    if [ $token_valid -eq 0 ]; then
      # 测试类型1接口
      test_type1_api "$token"
      
      # 测试类型2接口
      test_type2_api "$TEMP_FILE"
      
      # 测试协作者列表接口
      test_collaborator_api "$token"
      
      # 测试系统插件接口
      test_system_plugins_api "$token"
      
      # 测试系统消息模态框接口
      test_system_msg_modal_api "$token"
      
      # 测试类型3接口
      test_type3_api "$TEMP_FILE" "$token"
      
      # 测试直接访问ProAPI
      test_direct_proapi "$token"
    fi
  else
    echo -e "${RED}登录失败 - 状态码: $login_status${NC}"
    echo "错误响应: $login_body"
  fi
  
  echo -e "${GREEN}测试完成!${NC}"
}

# 执行主函数
main 