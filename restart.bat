@echo off
chcp 65001
title [UC]正在重启云崽
cd ..
cd ..
set /a halfTime=%1 / 2
IF EXIST app.js (
  echo [UC]即将执行启动，等待%1秒……
  for /L %%i in (1,1,%1) do (
    timeout /t 1 /nobreak > NUL
    echo [UC]%%i
    IF %%i == %halfTime% (
      echo [UC]关闭原云崽实例
    )
  )
  timeout /t 1 /nobreak > NUL
  echo [UC]启动新云崽实例
  node app
)
