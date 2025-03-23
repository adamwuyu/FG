#!/bin/bash

# FastGPT API认证机制修复实施计划 - 第二阶段验收测试
# 用途：综合验证第二阶段的所有修改

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 配置
TEST_RESULTS_DIR="test_results"
TEST_RESULT_FILE="${TEST_RESULTS_DIR}/phase2_acceptance_$(date +%Y%m%d_%H%M%S).log"

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
TEST_LOGIN_PASSED=false
TEST_COOKIE_AUTH_PASSED=false
TEST_TYPE3_PASSED=false

# 运行测试并检查结果
run_test() {
  local test_script=$1
  local test_name=$2
  local result_var=$3
  
  log "HEADER" "===== 执行测试：$test_name ====="
  log "INFO" "运行测试脚本：$test_script"
  
  # 运行测试脚本并捕获其输出和退出状态
  $test_script | tee -a $TEST_RESULT_FILE
  local exit_status=${PIPESTATUS[0]}
  
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

# 打印测试摘要
print_summary() {
  log "HEADER" "===== 第二阶段验收测试摘要 ====="
  
  if $TEST_LOGIN_PASSED; then
    log "SUCCESS" "登录和JWT令牌测试：通过"
  else
    log "ERROR" "登录和JWT令牌测试：失败"
  fi
  
  if $TEST_COOKIE_AUTH_PASSED; then
    log "SUCCESS" "Cookie认证测试：通过"
  else
    log "ERROR" "Cookie认证测试：失败"
  fi
  
  if $TEST_TYPE3_PASSED; then
    log "SUCCESS" "类型3接口测试：通过"
  else
    log "ERROR" "类型3接口测试：失败"
  fi
  
  # 计算总体结果
  if $TEST_LOGIN_PASSED && $TEST_COOKIE_AUTH_PASSED && $TEST_TYPE3_PASSED; then
    log "SUCCESS" "总体测试结果：通过"
    log "INFO" "第二阶段验收测试全部通过！"
    return 0
  else
    log "ERROR" "总体测试结果：失败"
    log "INFO" "第二阶段验收测试未通过，请查看详细日志：$TEST_RESULT_FILE"
    return 1
  fi
}

# 主测试流程
main() {
  log "HEADER" "===== 开始第二阶段验收测试 ====="
  log "INFO" "测试时间：$(date)"
  log "INFO" "测试结果将保存在：$TEST_RESULT_FILE"
  
  # 运行登录测试
  run_test "./scripts/test_login.sh" "登录和JWT令牌测试" "TEST_LOGIN_PASSED"
  
  # 运行Cookie认证测试
  run_test "./scripts/test_cookie_auth.sh" "Cookie认证测试" "TEST_COOKIE_AUTH_PASSED"
  
  # 运行类型3接口测试
  run_test "./scripts/test_type3_api.sh" "类型3接口测试" "TEST_TYPE3_PASSED"
  
  # 打印测试摘要
  print_summary
  exit $?
}

# 执行主测试流程
main
