# 项目文件结构生成指南

本项目提供了两个脚本用于生成项目的文件结构，分别适用于不同的操作系统环境。

## 脚本文件

1. `生成文件结构.sh` - 适用于macOS、Linux以及Windows的Git Bash/WSL环境
2. `生成文件结构.bat` - 适用于Windows命令提示符(CMD)或PowerShell

## 使用方法

### 在macOS或Linux上

1. 确保已安装`tree`命令：
   - macOS: `brew install tree`
   - Linux: `sudo apt-get install tree` 或 `sudo yum install tree`

2. 给脚本添加执行权限：
   ```bash
   chmod +x 生成文件结构.sh
   ```

3. 运行脚本：
   ```bash
   ./生成文件结构.sh
   ```

### 在Windows上

**方法1：使用批处理文件**
1. 在文件资源管理器中双击`生成文件结构.bat`文件
2. 或在命令提示符(CMD)中运行：
   ```cmd
   生成文件结构.bat
   ```

**方法2：使用Git Bash**
1. 在Git Bash中运行：
   ```bash
   ./生成文件结构.sh
   ```

**方法3：使用WSL (Windows Subsystem for Linux)**
1. 在WSL终端中运行：
   ```bash
   bash ./生成文件结构.sh
   ```

## 文件覆盖保护

两个脚本都添加了文件覆盖保护功能：

1. 在生成每个文件之前，脚本会检查该文件是否已存在
2. 如果文件已存在，脚本会提示用户并询问是否覆盖
3. 用户可以选择覆盖(y)或跳过(n)该文件的生成
4. 这样可以避免意外覆盖已有的文件结构记录

## 生成的文件

脚本执行后将生成以下文件：

1. `tree-root.txt` - 项目根目录的文件结构（限制为3层深度）
2. `tree-projects-app.txt` - projects/app目录的完整文件结构
3. `tree-app-src.txt` - projects/app/src目录的文件结构（忽略了与二次开发关系不大的文件）
4. `tree-projects-sandbox.txt` - projects/sandbox目录的文件结构
5. `tree-playwright.txt` - playwright目录的文件结构

## 忽略规则

脚本会忽略以下类型的文件和目录：

- 依赖和构建目录：`node_modules`, `dist`, `build`, `.git`, `coverage`, `.cache`等
- 配置文件：`tsconfig*`, `package.json`, `*.conf`, `.eslintrc.js`等
- 文档文件：`README.md`, `*.md`
- 图片文件：`*.jpg`, `*.jpeg`, `*.png`, `*.gif`, `*.svg`, `*.ico`, `*.webp`
- 样式文件：`*.scss`, `*.css`
- 脚本文件：`*.js`, `*.py`
- 其他与二次开发关系不大的文件和目录

## 自定义

如果需要修改忽略规则，可以编辑脚本文件中的`tree`命令参数：

- 在`-I`参数后面的引号中添加或删除需要忽略的文件或目录模式
- 多个模式之间使用`|`分隔

例如：
```bash
tree -I "node_modules|dist|build|.git|your_custom_pattern"
``` 