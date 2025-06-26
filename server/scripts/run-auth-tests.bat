@echo off
setlocal enabledelayedexpansion

REM Authentication Test Runner Script for Windows
REM This script helps run the comprehensive authentication tests with proper setup

REM Configuration
set SERVER_URL=http://localhost:3001
set API_URL=http://localhost:3001/api
set DB_NAME=barber-demo

echo 🚀 BarberHub Authentication Test Runner
echo ==================================

REM Function to check if server is running
:check_server
echo Checking if server is running...
curl -s "%SERVER_URL%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Server is running on %SERVER_URL%
    goto :eof
) else (
    echo ✗ Server is not running on %SERVER_URL%
    echo Please start the server with: npm run dev
    exit /b 1
)

REM Function to check if MongoDB is running
:check_mongodb
echo Checking MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/%DB_NAME%').then(() => { console.log('MongoDB connected'); process.exit(0); }).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running
    goto :eof
) else (
    echo ✗ MongoDB is not running
    echo Please start MongoDB and try again
    exit /b 1
)

REM Function to seed database
:seed_database
echo Seeding database with test data...
npm run seed >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Database seeded successfully
    goto :eof
) else (
    echo ✗ Failed to seed database
    exit /b 1
)

REM Function to run tests
:run_tests
echo Running authentication tests...
echo ==================================
npm run test:auth
if %errorlevel% equ 0 (
    echo ✓ All tests completed successfully
    goto :eof
) else (
    echo ✗ Some tests failed
    exit /b 1
)

REM Function to show help
:show_help
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -h, --help     Show this help message
echo   -s, --server   Only check server status
echo   -d, --db       Only check database status
echo   -t, --test     Only run tests (assumes setup is complete)
echo   -f, --full     Full setup and test run (default)
echo.
echo Examples:
echo   %0              # Full setup and test
echo   %0 --server     # Check server only
echo   %0 --test       # Run tests only
goto :eof

REM Parse command line arguments
if "%1"=="-h" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="-s" goto check_server
if "%1"=="--server" goto check_server
if "%1"=="-d" goto check_mongodb
if "%1"=="--db" goto check_mongodb
if "%1"=="-t" goto run_tests
if "%1"=="--test" goto run_tests
if "%1"=="-f" goto full_setup
if "%1"=="--full" goto full_setup
if "%1"=="" goto full_setup

echo Unknown option: %1
goto show_help

REM Main execution flow
:full_setup
echo Starting full authentication test setup...

REM Check prerequisites
call :check_server
if %errorlevel% neq 0 exit /b 1

call :check_mongodb
if %errorlevel% neq 0 exit /b 1

REM Seed database
call :seed_database
if %errorlevel% neq 0 exit /b 1

REM Run tests
call :run_tests
if %errorlevel% neq 0 exit /b 1

echo 🎉 All authentication tests completed successfully!
echo Check the output above for detailed results. 