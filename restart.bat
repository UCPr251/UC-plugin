@echo off
chcp 65001
cd ..
cd ..
IF EXIST app.js (
  echo [UC]即将执行启动，等待%1秒……
  for /L %%i in (1,1,%1) do (
    timeout /t 1 /nobreak > NUL
    echo [UC]%%i
  )
  timeout /t 1 /nobreak > NUL
  echo [UC]开始启动云崽
  node app
) ELSE (
  echo 错误的执行路径，启动已取消
)