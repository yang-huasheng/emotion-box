@echo off
chcp 65001 >nul
echo ========================================
echo      📋 项目完整性检查
echo ========================================
echo.

set "ERROR_COUNT=0"
set "CHECK_COUNT=0"

echo [1/6] 检查 index.html...
if exist "index.html" (
    echo   ✅ index.html 存在
) else (
    echo   ❌ index.html 缺失
    set /a ERROR_COUNT+=1
)
set /a CHECK_COUNT+=1

echo.
echo [2/6] 检查 css 文件夹...
if exist "css\" (
    echo   ✅ css 文件夹存在
    set /a CHECK_COUNT+=1
    
    echo   检查 css 文件...
    if exist "css\base.css" (echo     ✅ base.css) else (echo     ❌ base.css 缺失 & set /a ERROR_COUNT+=1)
    if exist "css\components.css" (echo     ✅ components.css) else (echo     ❌ components.css 缺失 & set /a ERROR_COUNT+=1)
    if exist "css\layouts.css" (echo     ✅ layouts.css) else (echo     ❌ layouts.css 缺失 & set /a ERROR_COUNT+=1)
) else (
    echo   ❌ css 文件夹缺失
    set /a ERROR_COUNT+=1
)

echo.
echo [3/6] 检查 js 文件夹...
if exist "js\" (
    echo   ✅ js 文件夹存在
    set /a CHECK_COUNT+=1
    
    echo   检查 js 文件...
    if exist "js\app.js" (echo     ✅ app.js) else (echo     ❌ app.js 缺失 & set /a ERROR_COUNT+=1)
    if exist "js\modules\" (echo     ✅ modules 文件夹) else (echo     ❌ modules 文件夹缺失 & set /a ERROR_COUNT+=1)
    if exist "js\utils\" (echo     ✅ utils 文件夹) else (echo     ❌ utils 文件夹缺失 & set /a ERROR_COUNT+=1)
    if exist "js\data\" (echo     ✅ data 文件夹) else (echo     ❌ data 文件夹缺失 & set /a ERROR_COUNT+=1)
) else (
    echo   ❌ js 文件夹缺失
    set /a ERROR_COUNT+=1
)

echo.
echo [4/6] 检查主要模块文件...
if exist "js\modules\test.js" (echo     ✅ test.js (测试模块)) else (echo     ❌ test.js 缺失 & set /a ERROR_COUNT+=1)
if exist "js\modules\settings.js" (echo     ✅ settings.js (设置模块)) else (echo     ❌ settings.js 缺失 & set /a ERROR_COUNT+=1)
if exist "js\modules\diary.js" (echo     ✅ diary.js (日记模块)) else (echo     ❌ diary.js 缺失 & set /a ERROR_COUNT+=1)
set /a CHECK_COUNT+=3

echo.
echo [5/6] 检查数据文件...
if exist "js\data\emotions.js" (echo     ✅ emotions.js) else (echo     ❌ emotions.js 缺失 & set /a ERROR_COUNT+=1)
set /a CHECK_COUNT+=1

echo.
echo [6/6] 检查工具函数...
if exist "js\utils\storage.js" (echo     ✅ storage.js) else (echo     ❌ storage.js 缺失 & set /a ERROR_COUNT+=1)
if exist "js\utils\helpers.js" (echo     ✅ helpers.js) else (echo     ❌ helpers.js 缺失 & set /a ERROR_COUNT+=1)
set /a CHECK_COUNT+=2

echo.
echo ========================================
echo      📊 检查结果
echo ========================================
echo.

if %ERROR_COUNT% equ 0 (
    echo   ✅ 所有文件完整！项目可以正常部署
    echo.
    echo   🚀 接下来你可以：
    echo      1. 双击 启动服务器.bat 本地运行
    echo      2. 上传到 GitHub Pages / Vercel / Netlify
    echo      3. 查看 部署与分享指南.md 了解更多
    echo.
) else (
    echo   ❌ 发现 %ERROR_COUNT% 个问题，请检查文件完整性
    echo.
)

echo ========================================
echo.
pause
