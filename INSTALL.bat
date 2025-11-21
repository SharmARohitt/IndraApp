@echo off
REM INDRA Mobile - Windows Installation Script

echo ========================================
echo INDRA Mobile - Installation Script
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js version...
node -v >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js version:
node -v
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

REM Install Expo CLI
echo Checking Expo CLI...
where expo >nul 2>&1
if errorlevel 1 (
    echo Installing Expo CLI globally...
    call npm install -g expo-cli
)
echo Expo CLI ready
echo.

REM Install EAS CLI
echo Checking EAS CLI...
where eas >nul 2>&1
if errorlevel 1 (
    echo Installing EAS CLI globally...
    call npm install -g eas-cli
)
echo EAS CLI ready
echo.

REM Create .env file
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    
    REM Try to detect IP
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
        set IP=%%a
        goto :found_ip
    )
    :found_ip
    set IP=%IP: =%
    
    echo .env file created with IP: %IP%
    echo Please verify the IP address in .env file
) else (
    echo .env file already exists
)
echo.

REM Create assets directory
if not exist assets (
    echo Creating assets directory...
    mkdir assets
)
echo.

echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the mock backend server:
echo    node server.js
echo.
echo 2. In a new terminal, start Expo:
echo    npm start
echo.
echo 3. Scan QR code with Expo Go app
echo.
echo Demo credentials:
echo   Email: worker@indra.com
echo   Password: password123
echo.
pause
