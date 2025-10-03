@echo off
echo ========================================
echo   HKMTRVUE Complete Build Script
echo ========================================
echo.

echo [Step 1/4] Building Vue.js application...
call npm run build
if errorlevel 1 (
    echo ❌ Vue build failed!
    pause
    exit /b 1
)
echo ✅ Vue build completed!
echo.

echo [Step 2/4] Syncing to Capacitor...
call npx cap sync
if errorlevel 1 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)
echo ✅ Capacitor sync completed!
echo.

echo [Step 3/4] Building Android APK...
echo This may take several minutes on first build...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    cd ..
    echo ❌ Android build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Android build completed!
echo.

echo [Step 4/4] Verifying APK...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK successfully created!
    echo.
    echo ========================================
    echo   ✅ BUILD COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo APK Location:
    echo %CD%\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    dir "android\app\build\outputs\apk\debug\app-debug.apk"
    echo.
    echo Next steps:
    echo 1. Copy APK to your Android phone
    echo 2. Enable "Install from Unknown Sources"
    echo 3. Tap the APK to install
    echo.
) else (
    echo ❌ APK not found!
)

pause
