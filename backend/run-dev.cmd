@echo off
REM Starts StockPilot backend with the H2 in-memory database (no PostgreSQL needed).
cd /d "%~dp0"
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
