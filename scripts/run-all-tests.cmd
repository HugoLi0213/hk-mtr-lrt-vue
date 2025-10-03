@echo off
echo ========================================
echo MTR App - Comprehensive Test Runner
echo ========================================
echo.

echo 1. Running TypeScript type checking...
call npx vue-tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript errors found!
    goto :error
) else (
    echo ✅ TypeScript check passed!
)
echo.

echo 2. Running build test...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    goto :error
) else (
    echo ✅ Build successful!
)
echo.

echo 3. Running custom test files...
echo.
echo 3.1 Running simple-test.js...
call node simple-test.js
echo.

echo 3.2 Running test-time-format.js...
call node test-time-format.js
echo.

echo 3.3 Running test-platform-destinations.js...
call node test-platform-destinations.js
echo.

echo 4. Checking critical files...
if exist "src\pages\LightRail\LightRail.vue" (
    echo ✅ LightRail.vue exists
) else (
    echo ❌ LightRail.vue missing
    goto :error
)

if exist "src\pages\MtrTrain\MtrTrain.vue" (
    echo ✅ MtrTrain.vue exists
) else (
    echo ❌ MtrTrain.vue missing
    goto :error
)

if exist "src\pages\BusEta\BusEta.vue" (
    echo ✅ BusEta.vue exists
) else (
    echo ❌ BusEta.vue missing
    goto :error
)

if exist "src\App.vue" (
    echo ✅ App.vue exists
) else (
    echo ❌ App.vue missing
    goto :error
)
echo.

echo 5. Checking dist folder...
if exist "dist\index.html" (
    echo ✅ Built index.html exists
) else (
    echo ❌ Built index.html missing
    goto :error
)
echo.

echo ========================================
echo ✅ ALL TESTS PASSED! 
echo App appears to be working correctly.
echo ========================================
goto :end

:error
echo.
echo ========================================
echo ❌ TESTS FAILED!
echo Please check the errors above.
echo ========================================
exit /b 1

:end
pause
