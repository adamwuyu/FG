#!/bin/bash
# 生成项目文件结构脚本 (兼容macOS和Windows的Git Bash/WSL)

# 保存当前目录
CURRENT_DIR=$(pwd)

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "检测到macOS系统"
  # 确保已安装tree命令
  if ! command -v tree &> /dev/null; then
    echo "未找到tree命令，请先安装: brew install tree"
    exit 1
  fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "检测到Linux系统"
  # 确保已安装tree命令
  if ! command -v tree &> /dev/null; then
    echo "未找到tree命令，请先安装: sudo apt-get install tree 或 sudo yum install tree"
    exit 1
  fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  echo "检测到Windows的Git Bash或Cygwin环境"
else
  echo "未知操作系统，尝试使用通用命令"
fi

# 检查文件是否存在并询问是否覆盖的函数
check_file_exists() {
  local file_path="$1"
  if [ -f "$file_path" ]; then
    echo "警告: 文件 $file_path 已存在"
    read -p "是否覆盖? (y/n): " answer
    if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
      echo "跳过生成 $file_path"
      return 1
    fi
  fi
  return 0
}

# 在项目根目录下执行，并保存为tree-root.txt
echo "正在检查项目根目录结构文件..."
if check_file_exists "tree-root.txt"; then
  echo "正在生成项目根目录结构..."
  tree -L 3 -I "node_modules|dist|build|.git|coverage|.cache|.github|.vscode|logs|tmp|temp|test|test-results|__mocks__|patches-v4" > tree-root.txt
fi

# 检查projects/app目录是否存在
if [ -d "projects/app" ]; then
  # 切换到projects/app目录
  echo "正在检查projects/app目录结构文件..."
  if check_file_exists "$CURRENT_DIR/tree-projects-app.txt"; then
    echo "正在生成projects/app目录结构..."
    cd projects/app
    tree -I "node_modules|dist|build|.git|coverage|.cache|.github|.vscode|logs|tmp|temp|test|test-results|__mocks__|*.test.ts|*.spec.ts|e2e-spec.ts|tsconfig*|package.json|*.conf|.eslintrc.js|nest-cli.json|Dockerfile|.dockerignore|requirements.txt|.gitignore|postinstall.sh|run.sh|pip.conf|*.jpg|*.jpeg|*.png|*.gif|*.svg|*.ico|*.webp|*.scss|*.css|styles|scripts|zhlint|*.mvn|*.model|*.yaml|*.json|*.proto|example|test-request.js|WorkflowComponents|*.js|*.py|python|*.patch|monaco-editor*|basic-languages|browser|codicons|vs|playwright*|tests*|test.mp3|patches-v4|chrome_extension|public" > "$CURRENT_DIR/tree-projects-app.txt"
  
    # 检查src目录是否存在
    if [ -d "src" ]; then
      # 切换到src目录
      echo "正在检查projects/app/src目录结构文件..."
      if check_file_exists "$CURRENT_DIR/tree-app-src.txt"; then
        echo "正在生成projects/app/src目录结构..."
        cd src
        tree -I "node_modules|dist|build|.git|coverage|.cache|.github|.vscode|logs|tmp|temp|test|test-results|__mocks__|*.test.ts|*.spec.ts|e2e-spec.ts|tsconfig*|package.json|*.conf|.eslintrc.js|nest-cli.json|Dockerfile|.dockerignore|requirements.txt|.gitignore|postinstall.sh|run.sh|pip.conf|*.jpg|*.jpeg|*.png|*.gif|*.svg|*.ico|*.webp|*.scss|*.css|styles|scripts|zhlint|*.mvn|*.model|*.yaml|*.json|*.proto|example|test-request.js|WorkflowComponents|*.js|*.py|python|*.patch|monaco-editor*|basic-languages|browser|codicons|vs|playwright*|tests*|test.mp3|patches-v4|chrome_extension|public|icons|components|Modal|*Modal.tsx|*Form.tsx|plugins|admin|pageComponents|account|bill|usage|context|constants.ts|utils.ts" > "$CURRENT_DIR/tree-app-src.txt"
      fi
      # 返回到projects/app目录
      cd ..
    else
      echo "警告: projects/app/src 目录不存在"
    fi
  fi
  
  # 返回到项目根目录
  cd "$CURRENT_DIR"
else
  echo "警告: projects/app 目录不存在"
fi

# 检查projects/sandbox目录是否存在
if [ -d "projects/sandbox" ]; then
  # 切换到projects/sandbox目录
  echo "正在检查projects/sandbox目录结构文件..."
  if check_file_exists "$CURRENT_DIR/tree-projects-sandbox.txt"; then
    echo "正在生成projects/sandbox目录结构..."
    cd projects/sandbox
    tree -I "node_modules|dist|build|.git|coverage|.cache|.github|.vscode|logs|tmp|temp|test|test-results|__mocks__|*.test.ts|*.spec.ts|e2e-spec.ts|tsconfig*|package.json|*.conf|.eslintrc.js|nest-cli.json|Dockerfile|.dockerignore|requirements.txt|.gitignore|postinstall.sh|run.sh|pip.conf|*.jpg|*.jpeg|*.png|*.gif|*.svg|*.ico|*.webp|*.scss|*.css|styles|scripts|zhlint|*.mvn|*.model|*.yaml|*.json|*.proto|example|test-request.js|WorkflowComponents|*.js|*.py|python|*.patch|monaco-editor*|basic-languages|browser|codicons|vs|playwright*|tests*|test.mp3|patches-v4|chrome_extension|public" > "$CURRENT_DIR/tree-projects-sandbox.txt"
  fi
  # 返回到项目根目录
  cd "$CURRENT_DIR"
else
  echo "警告: projects/sandbox 目录不存在"
fi

# 检查playwright目录是否存在
if [ -d "playwright" ]; then
  # 切换到playwright目录
  echo "正在检查playwright目录结构文件..."
  if check_file_exists "$CURRENT_DIR/tree-playwright.txt"; then
    echo "正在生成playwright目录结构..."
    cd playwright
    tree -I "node_modules|dist|build|.git|coverage|.cache|.github|.vscode|logs|tmp|temp|test|test-results|__mocks__|*.test.ts|*.spec.ts|e2e-spec.ts|tsconfig*|package.json|*.conf|.eslintrc.js|nest-cli.json|Dockerfile|.dockerignore|requirements.txt|.gitignore|postinstall.sh|run.sh|pip.conf|*.jpg|*.jpeg|*.png|*.gif|*.svg|*.ico|*.webp|*.scss|*.css|styles|scripts|zhlint|*.mvn|*.model|*.yaml|*.json|*.proto|example|test-request.js|WorkflowComponents|*.js|*.py|python|*.patch|monaco-editor*|basic-languages|browser|codicons|vs|tests*|test.mp3|patches-v4|chrome_extension|public" > "$CURRENT_DIR/tree-playwright.txt"
  fi
  # 返回到项目根目录
  cd "$CURRENT_DIR"
else
  echo "警告: playwright 目录不存在"
fi

echo "文件结构生成完成！"
echo "生成的文件: tree-root.txt, tree-projects-app.txt, tree-app-src.txt, tree-projects-sandbox.txt, tree-playwright.txt"

# 如果是在Windows环境中运行，添加暂停
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  read -p "按任意键继续..." key
fi 