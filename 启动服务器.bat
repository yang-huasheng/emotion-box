@echo off
chcp 65001 >nul
echo ========================================
echo           🌿 情绪盒子 🌿
echo ========================================
echo.
echo 🚀 正在启动服务器...
echo.
echo 🌐 访问地址: http://localhost:8080
echo 💡 如果端口被占用，可以修改为其他端口（如8081）
echo ❤️ 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8080

if errorlevel 1 (
    echo.
    echo ❌ 启动失败！请检查是否已安装 Python
    echo.
    echo 💡 下载 Python: https://www.python.org/downloads/
    echo.
    pause
)
