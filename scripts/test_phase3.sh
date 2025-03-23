#!/bin/bash

# FastGPT API认证机制修复实施计划 - 第三阶段验收测试
# 用途：综合验证第三阶段的所有修改（前端认证流程优化）

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 配置
TEST_RESULTS_DIR="test_results"
TEST_RESULT_FILE="${TEST_RESULTS_DIR}/phase3_acceptance_$(date +%Y%m%d_%H%M%S).log"
LOCAL_URL="http://localhost:3000"
PROAPI_URL="http://localhost:3002"

# 测试用户凭据
USERNAME="root"
PASSWORD="IloveGPT!"

# 临时文件
TEMP_FILE=$(mktemp)
trap 'rm -f $TEMP_FILE' EXIT

# 确保测试结果目录存在
mkdir -p $TEST_RESULTS_DIR

# 记录日志并显示在屏幕上
log() {
  local level=$1
  local message=$2
  local color=$NC
  
  case $level in
    "INFO") color=$BLUE ;;
    "SUCCESS") color=$GREEN ;;
    "ERROR") color=$RED ;;
    "WARNING") color=$YELLOW ;;
    "HEADER") color=$PURPLE ;;
  esac
  
  echo -e "${color}[$level] $message${NC}" | tee -a $TEST_RESULT_FILE
}

# 测试运行状态变量
TEST_LOGIN_STORAGE_PASSED=false
TEST_INTERCEPTOR_PASSED=false
TEST_TOKEN_EXPIRE_PASSED=false
TEST_EXPIRY_SIMULATION_PASSED=false
TEST_CONCURRENT_REQUESTS_PASSED=false

# 运行测试并检查结果
run_test() {
  local test_func=$1
  local test_name=$2
  local result_var=$3
  
  log "HEADER" "===== 执行测试：$test_name ====="
  
  # 运行测试函数
  $test_func
  local exit_status=$?
  
  if [ $exit_status -eq 0 ]; then
    log "SUCCESS" "测试 '$test_name' 成功完成"
    eval "$result_var=true"
    return 0
  else
    log "ERROR" "测试 '$test_name' 失败，退出状态：$exit_status"
    eval "$result_var=false"
    return 1
  fi
}

# 获取页面并检查其中的JavaScript代码
fetch_and_check_js() {
  local url=$1
  local search_pattern=$2
  local description=$3
  
  log "INFO" "检查 $description: $url"
  
  # 获取页面并检查是否包含特定JavaScript代码
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "$search_pattern"; then
    log "SUCCESS" "发现 $description 代码"
    return 0
  else
    log "ERROR" "未找到 $description 代码"
    return 1
  fi
}

# 测试1：JWT令牌的localStorage存储
test_jwt_local_storage() {
  log "INFO" "测试JWT令牌的localStorage存储机制..."
  
  # 1. 检查登录处理函数是否正确实现JWT存储
  fetch_and_check_js "${LOCAL_URL}/login" "localStorage.setItem('jwt_token'" "JWT存储逻辑"
  if [ $? -ne 0 ]; then return 1; fi
  
  # 2. 实际测试登录过程
  log "INFO" "执行登录测试..."
  
  # 使用curl进行登录请求
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  # 检查登录是否成功
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    log "SUCCESS" "登录成功 - 状态码: $login_status"
    
    # 从登录响应中提取JWT令牌
    token=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
      log "ERROR" "未从登录响应中提取到JWT令牌"
      return 1
    else
      log "SUCCESS" "成功提取JWT令牌: $(echo $token | cut -c 1-15)..."
      return 0
    fi
  else
    log "ERROR" "登录失败 - 状态码: $login_status"
    log "ERROR" "错误响应: $login_body"
    return 1
  fi
}

# 测试2：请求拦截器
test_request_interceptor() {
  log "INFO" "测试请求拦截器是否正确为proApi请求添加Authorization头..."
  
  # 1. 检查请求拦截器代码是否正确实现
  fetch_and_check_js "${LOCAL_URL}" "config.url.includes('proApi')" "proApi请求检测"
  if [ $? -ne 0 ]; then return 1; fi
  
  fetch_and_check_js "${LOCAL_URL}" "headers\\['Authorization'\\] = \`Bearer \${token}\`" "Authorization头添加"
  if [ $? -ne 0 ]; then return 1; fi
  
  # 2. 实际测试proApi请求
  log "INFO" "执行proApi请求测试..."
  
  # 首先登录获取令牌
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    # 从登录响应中提取JWT令牌
    token=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
      log "ERROR" "未能从登录响应中提取到JWT令牌"
      return 1
    fi
    
    # 测试使用该令牌进行proApi请求
    proapi_endpoint="/api/proApi/support/user/team/list"
    
    log "INFO" "测试proApi请求: $proapi_endpoint"
    
    # 发送请求并检查是否成功
    response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${proapi_endpoint}" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
      log "SUCCESS" "proApi请求成功 - 状态码: $status_code"
      return 0
    else
      log "ERROR" "proApi请求失败 - 状态码: $status_code"
      log "ERROR" "错误响应: $body"
      return 1
    fi
  else
    log "ERROR" "登录失败，无法测试proApi请求"
    return 1
  fi
}

# 测试3：令牌过期处理
test_token_expiry() {
  log "INFO" "测试令牌过期处理机制..."
  
  # 1. 检查令牌过期检测代码是否正确实现
  fetch_and_check_js "${LOCAL_URL}" "isTokenExpiringSoon" "令牌过期检测函数"
  if [ $? -ne 0 ]; then return 1; fi
  
  fetch_and_check_js "${LOCAL_URL}" "refreshToken" "令牌刷新函数"
  if [ $? -ne 0 ]; then return 1; fi
  
  # 2. 检查令牌刷新队列管理是否实现
  fetch_and_check_js "${LOCAL_URL}" "failedQueue" "令牌刷新队列"
  if [ $? -ne 0 ]; then return 1; fi
  
  # 3. 测试令牌刷新接口
  log "INFO" "测试令牌刷新接口..."
  
  # 首先登录获取令牌
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    # 测试令牌刷新接口
    refresh_endpoint="/api/proApi/support/user/account/refreshToken"
    
    log "INFO" "测试令牌刷新接口: $refresh_endpoint"
    
    # 使用Cookie发送请求
    response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${refresh_endpoint}" \
      -b "$TEMP_FILE" \
      -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
      log "SUCCESS" "令牌刷新成功 - 状态码: $status_code"
      
      # 从响应中提取新令牌
      new_token=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      
      if [ -n "$new_token" ]; then
        log "SUCCESS" "成功获取新令牌: $(echo $new_token | cut -c 1-15)..."
        return 0
      else
        log "ERROR" "未从刷新响应中提取到新令牌"
        return 1
      fi
    else
      log "ERROR" "令牌刷新失败 - 状态码: $status_code"
      log "ERROR" "错误响应: $body"
      return 1
    fi
  else
    log "ERROR" "登录失败，无法测试令牌刷新"
    return 1
  fi
}

# 测试4：模拟令牌过期场景
test_token_expiry_simulation() {
  log "INFO" "模拟令牌过期场景测试..."
  
  # 1. 首先登录获取令牌
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    # 从登录响应中提取JWT令牌
    token=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
      log "ERROR" "未能从登录响应中提取到JWT令牌"
      return 1
    fi
    
    # 2. 创建一个已过期的令牌（通过修改有效期）
    # 这里我们使用一个固定的过期令牌进行模拟
    expired_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJ0ZWFtSWQiOiJ0ZWFtMSIsInRtYklkIjoibWVtYmVyMSIsImlzUm9vdCI6ZmFsc2UsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAxMDAwfQ.8HKCFhvesP-RjLOoeGJQ-5Zj4_G73xR24xiyCjE4Mew"
    
    # 3. 使用过期令牌发送请求
    proapi_endpoint="/api/proApi/support/user/team/list"
    
    log "INFO" "使用过期令牌测试proApi请求: $proapi_endpoint"
    
    # 模拟前端行为：将过期令牌存储到localStorage
    log "INFO" "模拟前端将过期令牌存储到localStorage"
    
    # 发送请求并检查是否失败
    response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${proapi_endpoint}" \
      -H "Authorization: Bearer $expired_token" \
      -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # 预期接收401错误，表示令牌已过期
    if [ "$status_code" -eq 401 ]; then
      log "SUCCESS" "成功检测到令牌过期 - 状态码: $status_code"
      
      # 检查错误消息是否包含令牌过期相关信息
      if echo "$body" | grep -q "过期\|expired\|token"; then
        log "SUCCESS" "错误消息正确指示令牌过期"
      else
        log "WARNING" "错误消息未明确指示令牌过期: $body"
      fi
      
      # 4. 测试自动刷新机制
      # 实际前端代码中，此时应自动调用refreshToken
      # 这里我们手动模拟这个过程
      
      log "INFO" "模拟前端自动刷新令牌..."
      
      refresh_endpoint="/api/proApi/support/user/account/refreshToken"
      
      # 使用Cookie发送刷新请求
      refresh_response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${refresh_endpoint}" \
        -b "$TEMP_FILE" \
        -H "Content-Type: application/json")
      
      refresh_status=$(echo "$refresh_response" | tail -n1)
      refresh_body=$(echo "$refresh_response" | sed '$d')
      
      if [ "$refresh_status" -ge 200 ] && [ "$refresh_status" -lt 300 ]; then
        log "SUCCESS" "令牌刷新成功 - 状态码: $refresh_status"
        
        # 从响应中提取新令牌
        new_token=$(echo "$refresh_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$new_token" ]; then
          log "SUCCESS" "成功获取新令牌: $(echo $new_token | cut -c 1-15)..."
          
          # 5. 使用新令牌重试原请求
          log "INFO" "使用新令牌重试原始请求..."
          
          retry_response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${proapi_endpoint}" \
            -H "Authorization: Bearer $new_token" \
            -H "Content-Type: application/json")
          
          retry_status=$(echo "$retry_response" | tail -n1)
          retry_body=$(echo "$retry_response" | sed '$d')
          
          if [ "$retry_status" -ge 200 ] && [ "$retry_status" -lt 300 ]; then
            log "SUCCESS" "使用新令牌重试请求成功 - 状态码: $retry_status"
            return 0
          else
            log "ERROR" "使用新令牌重试请求失败 - 状态码: $retry_status"
            log "ERROR" "错误响应: $retry_body"
            return 1
          fi
        else
          log "ERROR" "未从刷新响应中提取到新令牌"
          return 1
        fi
      else
        log "ERROR" "令牌刷新失败 - 状态码: $refresh_status"
        log "ERROR" "错误响应: $refresh_body"
        return 1
      fi
    else
      log "ERROR" "使用过期令牌请求未返回预期的401错误 - 状态码: $status_code"
      log "ERROR" "响应: $body"
      return 1
    fi
  else
    log "ERROR" "登录失败，无法进行令牌过期测试"
    return 1
  fi
}

# 测试5：并发请求测试
test_concurrent_requests() {
  log "INFO" "测试并发请求和令牌刷新队列..."
  
  # 登录获取令牌
  login_response=$(curl -s -c "$TEMP_FILE" -w "\n%{http_code}" "${LOCAL_URL}/api/support/user/account/loginByPassword" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  login_status=$(echo "$login_response" | tail -n1)
  login_body=$(echo "$login_response" | sed '$d')
  
  if [ "$login_status" -ge 200 ] && [ "$login_status" -lt 300 ]; then
    # 从登录响应中提取JWT令牌
    token=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
      log "ERROR" "未能从登录响应中提取到JWT令牌"
      return 1
    fi
    
    # 使用过期令牌模拟并发请求
    expired_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJ0ZWFtSWQiOiJ0ZWFtMSIsInRtYklkIjoibWVtYmVyMSIsImlzUm9vdCI6ZmFsc2UsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAxMDAwfQ.8HKCFhvesP-RjLOoeGJQ-5Zj4_G73xR24xiyCjE4Mew"
    
    # 定义测试端点
    endpoints=(
      "/api/proApi/support/user/team/list"
      "/api/proApi/core/app/plugin/getSystemPlugins"
      "/api/proApi/support/user/inform/getSystemMsgModal"
    )
    
    log "INFO" "同时发送3个并发请求，模拟多个组件同时使用过期令牌..."
    
    # 创建临时文件存储并发请求结果
    TEMP_FILES=()
    for i in {1..3}; do
      TEMP_FILES[$i]=$(mktemp)
    done
    
    # 并发发送请求
    for i in {0..2}; do
      (
        curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoints[$i]}" \
          -H "Authorization: Bearer $expired_token" \
          -H "Content-Type: application/json" > ${TEMP_FILES[$i+1]} &
      )
    done
    
    # 等待所有请求完成
    wait
    
    # 检查并发请求结果
    success_count=0
    failure_count=0
    
    for i in {1..3}; do
      status_code=$(tail -n1 ${TEMP_FILES[$i]})
      body=$(sed '$d' ${TEMP_FILES[$i]})
      
      log "INFO" "请求 $i 结果 - 状态码: $status_code"
      
      # 401状态码意味着令牌过期被正确检测
      if [ "$status_code" -eq 401 ]; then
        success_count=$((success_count + 1))
      else
        failure_count=$((failure_count + 1))
      fi
      
      # 清理临时文件
      rm -f ${TEMP_FILES[$i]}
    done
    
    log "INFO" "并发请求结果: $success_count 成功检测令牌过期, $failure_count 未正确检测"
    
    if [ $success_count -eq 3 ]; then
      log "SUCCESS" "所有并发请求都正确检测到令牌过期"
      
      # 模拟一次令牌刷新，然后重试所有请求
      log "INFO" "模拟单次令牌刷新后重试所有请求..."
      
      # 刷新令牌
      refresh_response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}/api/proApi/support/user/account/refreshToken" \
        -b "$TEMP_FILE" \
        -H "Content-Type: application/json")
      
      refresh_status=$(echo "$refresh_response" | tail -n1)
      refresh_body=$(echo "$refresh_response" | sed '$d')
      
      if [ "$refresh_status" -ge 200 ] && [ "$refresh_status" -lt 300 ]; then
        # 从响应中提取新令牌
        new_token=$(echo "$refresh_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$new_token" ]; then
          log "SUCCESS" "成功获取新令牌进行重试: $(echo $new_token | cut -c 1-15)..."
          
          # 使用新令牌重试所有请求
          retry_success=0
          
          for endpoint in "${endpoints[@]}"; do
            retry_response=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${endpoint}" \
              -H "Authorization: Bearer $new_token" \
              -H "Content-Type: application/json")
            
            retry_status=$(echo "$retry_response" | tail -n1)
            
            if [ "$retry_status" -ge 200 ] && [ "$retry_status" -lt 300 ]; then
              retry_success=$((retry_success + 1))
            fi
          done
          
          if [ $retry_success -eq 3 ]; then
            log "SUCCESS" "所有请求使用新令牌重试成功"
            return 0
          else
            log "ERROR" "部分请求使用新令牌重试失败: $retry_success/3 成功"
            return 1
          fi
        else
          log "ERROR" "未从刷新响应中提取到新令牌"
          return 1
        fi
      else
        log "ERROR" "令牌刷新失败 - 状态码: $refresh_status"
        return 1
      fi
    else
      log "ERROR" "并非所有并发请求都正确检测到令牌过期: $success_count/3"
      return 1
    fi
  else
    log "ERROR" "登录失败，无法进行并发请求测试"
    return 1
  fi
}

# 打印测试摘要
print_summary() {
  log "HEADER" "===== 第三阶段验收测试摘要 ====="
  
  if $TEST_LOGIN_STORAGE_PASSED; then
    log "SUCCESS" "前端登录和JWT令牌存储测试：通过"
  else
    log "ERROR" "前端登录和JWT令牌存储测试：失败"
  fi
  
  if $TEST_INTERCEPTOR_PASSED; then
    log "SUCCESS" "请求拦截器测试：通过"
  else
    log "ERROR" "请求拦截器测试：失败"
  fi
  
  if $TEST_TOKEN_EXPIRE_PASSED; then
    log "SUCCESS" "令牌过期处理测试：通过"
  else
    log "ERROR" "令牌过期处理测试：失败"
  fi
  
  if $TEST_EXPIRY_SIMULATION_PASSED; then
    log "SUCCESS" "令牌过期模拟测试：通过"
  else
    log "ERROR" "令牌过期模拟测试：失败"
  fi
  
  if $TEST_CONCURRENT_REQUESTS_PASSED; then
    log "SUCCESS" "并发请求测试：通过"
  else
    log "ERROR" "并发请求测试：失败"
  fi
  
  # 计算总体结果
  if $TEST_LOGIN_STORAGE_PASSED && $TEST_INTERCEPTOR_PASSED && $TEST_TOKEN_EXPIRE_PASSED && \
     $TEST_EXPIRY_SIMULATION_PASSED && $TEST_CONCURRENT_REQUESTS_PASSED; then
    log "SUCCESS" "总体测试结果：通过"
    log "INFO" "第三阶段验收测试全部通过！"
    return 0
  else
    log "ERROR" "总体测试结果：失败"
    log "INFO" "第三阶段验收测试未通过，请查看详细日志：$TEST_RESULT_FILE"
    return 1
  fi
}

# 主测试流程
main() {
  log "HEADER" "===== 开始第三阶段验收测试：前端认证流程优化 ====="
  log "INFO" "测试时间：$(date)"
  log "INFO" "测试结果将保存在：$TEST_RESULT_FILE"
  log "INFO" "本地服务URL: $LOCAL_URL"
  log "INFO" "ProAPI服务URL: $PROAPI_URL"
  
  # 1. 测试JWT令牌的localStorage存储
  run_test "test_jwt_local_storage" "前端登录和JWT令牌存储" "TEST_LOGIN_STORAGE_PASSED"
  
  # 2. 测试请求拦截器
  run_test "test_request_interceptor" "请求拦截器" "TEST_INTERCEPTOR_PASSED"
  
  # 3. 测试令牌过期处理
  run_test "test_token_expiry" "令牌过期处理" "TEST_TOKEN_EXPIRE_PASSED"
  
  # 4. 模拟令牌过期场景
  run_test "test_token_expiry_simulation" "令牌过期模拟测试" "TEST_EXPIRY_SIMULATION_PASSED"
  
  # 5. 测试并发请求
  run_test "test_concurrent_requests" "并发请求测试" "TEST_CONCURRENT_REQUESTS_PASSED"
  
  # 打印测试摘要
  print_summary
  exit $?
}

# 执行主测试流程
main 