@echo off
REM 生成项目文件结构脚本

REM 保存当前目录
set CURRENT_DIR=%cd%

REM 检查文件是否存在并询问是否覆盖的函数
:CheckFileExists
set file_path=%~1
if exist "%file_path%" (
  echo 警告: 文件 %file_path% 已存在
  set /p answer=是否覆盖? (y/n): 
  if /i not "%answer%"=="y" (
    echo 跳过生成 %file_path%
    exit /b 1
  )
)
exit /b 0

REM 在项目根目录下执行，并保存为tree-root.txt
echo 正在检查项目根目录结构文件...
call :CheckFileExists "tree-root.txt"
if not errorlevel 1 (
  echo 正在生成项目根目录结构...
  tree /F /A /L 3 > tree-root.txt
)

REM 检查projects/app目录是否存在
if exist "projects\app" (
  REM 切换到projects/app目录
  echo 正在检查projects/app目录结构文件...
  call :CheckFileExists "%CURRENT_DIR%\tree-projects-app.txt"
  if not errorlevel 1 (
    echo 正在生成projects/app目录结构...
    cd projects\app
    tree /F /A > %CURRENT_DIR%\tree-projects-app.txt
  
    REM 检查src目录是否存在
    if exist "src" (
      REM 切换到src目录
      echo 正在检查projects/app/src目录结构文件...
      call :CheckFileExists "%CURRENT_DIR%\tree-app-src.txt"
      if not errorlevel 1 (
        echo 正在生成projects/app/src目录结构...
        cd src
        tree /F /A > %CURRENT_DIR%\tree-app-src.txt
      )
      REM 返回到projects/app目录
      cd ..
    ) else (
      echo 警告: projects/app/src 目录不存在
    )
  )
  
  REM 返回到项目根目录
  cd %CURRENT_DIR%
) else (
  echo 警告: projects/app 目录不存在
)

REM 检查projects/sandbox目录是否存在
if exist "projects\sandbox" (
  REM 切换到projects/sandbox目录
  echo 正在检查projects/sandbox目录结构文件...
  call :CheckFileExists "%CURRENT_DIR%\tree-projects-sandbox.txt"
  if not errorlevel 1 (
    echo 正在生成projects/sandbox目录结构...
    cd projects\sandbox
    tree /F /A > %CURRENT_DIR%\tree-projects-sandbox.txt
  )
  REM 返回到项目根目录
  cd %CURRENT_DIR%
) else (
  echo 警告: projects/sandbox 目录不存在
)

REM 检查playwright目录是否存在
if exist "playwright" (
  REM 切换到playwright目录
  echo 正在检查playwright目录结构文件...
  call :CheckFileExists "%CURRENT_DIR%\tree-playwright.txt"
  if not errorlevel 1 (
    echo 正在生成playwright目录结构...
    cd playwright
    tree /F /A > %CURRENT_DIR%\tree-playwright.txt
  )
  REM 返回到项目根目录
  cd %CURRENT_DIR%
) else (
  echo 警告: playwright 目录不存在
)

echo 文件结构生成完成！
echo 生成的文件: tree-root.txt, tree-projects-app.txt, tree-app-src.txt, tree-projects-sandbox.txt, tree-playwright.txt
pause

