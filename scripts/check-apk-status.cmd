@echo off
echo ========================================
echo   HKMTRVUE APK Build Status Checker
echo ========================================
echo.

echo [1/3] Checking if APK exists...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK FOUND!
    echo.
    echo [2/3] APK Details:
    dir "android\app\build\outputs\apk\debug\app-debug.apk"
    echo.
    echo [3/3] File Location:
    echo %CD%\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo ========================================
    echo   ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo You can now:
    echo 1. Copy APK to your phone and install
    echo 2. Use ADB: adb install android\app\build\outputs\apk\debug\app-debug.apk
    echo 3. Share the APK file with others
) else (
    echo ⏳ APK not found yet. Build may still be in progress.
    echo.
    echo Checking build directory status...
    if exist "android\app\build" (
        echo ✅ Build directory exists
    ) else (
        echo ❌ Build directory not found
    )
    echo.
    echo ========================================
    echo   ⏳ BUILD IN PROGRESS
    echo ========================================
    echo.
    echo Please wait for the Gradle build to complete.
    echo First-time builds can take 5-10 minutes.
)

echo.
pause
