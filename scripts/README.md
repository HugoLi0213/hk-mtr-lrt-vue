# 🛠️ HKMTRVUE Scripts

This folder contains all automation scripts for building, testing, and deploying the HKMTRVUE application.

---

## 📱 Android Build Scripts

### `build-apk.cmd` ⭐ **Primary Build Script**
Complete automated build pipeline for Android APK.

**What it does:**
1. Builds Vue.js application (`npm run build`)
2. Syncs to Capacitor (`npx cap sync`)
3. Builds Android APK (`gradlew assembleDebug`)
4. Verifies APK creation
5. Shows APK location and details

**Usage:**
```bash
cd scripts
build-apk.cmd
```

**Output:**
- APK at: `android/app/build/outputs/apk/debug/app-debug.apk`
- Build time: ~2-5 minutes (first build), ~30-60 seconds (subsequent builds)

---

### `check-apk-status.cmd` 📊 **Build Status Checker**
Quick status check for APK build without rebuilding.

**What it does:**
1. Checks if APK exists
2. Shows file details (size, date)
3. Displays installation instructions

**Usage:**
```bash
cd scripts
check-apk-status.cmd
```

**Use when:**
- Verifying a build completed successfully
- Finding the APK file location
- Checking APK file size and date

---

## 🧪 Testing Scripts

### `run-all-tests.cmd` ✅ **Test Suite Runner**
Runs comprehensive test suite for the application.

**What it does:**
1. Runs unit tests
2. Runs integration tests
3. Generates test reports

**Usage:**
```bash
cd scripts
run-all-tests.cmd
```

**Output:**
- Test results in console
- Coverage reports (if configured)

---

### `validate-implementation.cmd` 🔍 **Code Validation**
Validates implementation against project requirements.

**What it does:**
1. Checks code structure
2. Validates TypeScript types
3. Verifies configuration files
4. Tests build process

**Usage:**
```bash
cd scripts
validate-implementation.cmd
```

**Use for:**
- Pre-commit validation
- CI/CD pipeline checks
- Code review preparation

---

## 🚀 Deployment Scripts

### `deploy.cmd` (Windows) 📦
Deploys the application to production environment.

**What it does:**
1. Builds production version
2. Runs deployment checks
3. Deploys to hosting service (e.g., Vercel)

**Usage:**
```bash
cd scripts
deploy.cmd
```

**Requirements:**
- Production credentials configured
- Build verification passed
- All tests passing

---

### `deploy-test.sh` (macOS/Linux) 🐧
Unix/Linux version of deployment script for testing environments.

**What it does:**
1. Builds test version
2. Deploys to staging/test environment
3. Runs smoke tests

**Usage:**
```bash
cd scripts
chmod +x deploy-test.sh
./deploy-test.sh
```

**Use for:**
- Staging deployments
- Integration testing
- Pre-production verification

---

## 📋 Quick Reference

### Common Workflows

#### **Build Android APK**
```bash
cd scripts
build-apk.cmd
```

#### **Check Build Status**
```bash
cd scripts
check-apk-status.cmd
```

#### **Run Tests Before Commit**
```bash
cd scripts
validate-implementation.cmd
run-all-tests.cmd
```

#### **Complete Release Process**
```bash
cd scripts
validate-implementation.cmd     # 1. Validate code
run-all-tests.cmd              # 2. Run tests
build-apk.cmd                  # 3. Build APK
deploy.cmd                     # 4. Deploy web version
```

---

## 🔧 Script Maintenance

### Adding New Scripts
1. Create script in this folder
2. Add documentation to this README
3. Update `.gitignore` if needed (exclude output files)
4. Test thoroughly before committing

### Script Naming Convention
- Use kebab-case: `my-script.cmd`
- Descriptive names: `build-apk.cmd` not `build.cmd`
- Platform suffix if needed: `.cmd` (Windows), `.sh` (Unix/Linux)

### Best Practices
- ✅ Include error handling
- ✅ Provide clear output messages
- ✅ Show progress indicators
- ✅ Verify prerequisites
- ✅ Exit with proper codes (0 = success, 1 = error)

---

## 🐛 Troubleshooting

### `build-apk.cmd` fails
**Problem:** Android SDK not found
**Solution:** 
1. Install Android Studio
2. Set `ANDROID_HOME` environment variable
3. Or create `android/local.properties` with SDK path

**Problem:** Gradle build fails
**Solution:**
1. Check Java version (need JDK 17+)
2. Clear Gradle cache: `cd android && gradlew clean`
3. Check network connection (Gradle downloads dependencies)

### `deploy.cmd` fails
**Problem:** Deployment credentials not configured
**Solution:**
1. Check Vercel CLI is installed: `vercel --version`
2. Login: `vercel login`
3. Link project: `vercel link`

### Scripts not executing
**Problem:** Permission denied
**Solution:**
- Windows: Run as Administrator
- macOS/Linux: `chmod +x script-name.sh`

---

## 📊 Script Details

| Script | Platform | Purpose | Duration | Prerequisites |
|--------|----------|---------|----------|---------------|
| `build-apk.cmd` | Windows | Build Android APK | 2-5 min | Android SDK, Gradle |
| `check-apk-status.cmd` | Windows | Check build status | <1 sec | None |
| `run-all-tests.cmd` | Windows | Run test suite | 1-2 min | Node.js |
| `validate-implementation.cmd` | Windows | Validate code | 30 sec | Node.js |
| `deploy.cmd` | Windows | Deploy production | 2-3 min | Vercel CLI |
| `deploy-test.sh` | Unix/Linux | Deploy staging | 2-3 min | Vercel CLI |

---

## 🔗 Related Documentation

- [Android APK Build Guide](../docs/ANDROID_APK_BUILD_GUIDE.md) - Detailed build instructions
- [APK Installation Guide](../docs/APK_INSTALLATION_GUIDE.md) - How to install APK
- [Deployment Complete](../docs/DEPLOYMENT_COMPLETE.md) - Deployment checklist

---

## 📝 Version History

- **v1.0.0** (Oct 3, 2025) - Initial script collection
  - Added Android build scripts
  - Added testing scripts
  - Added deployment scripts
  - Created documentation

---

## 💡 Tips

### Speed Up Builds
1. **Cache Dependencies:** Don't delete `node_modules` unnecessarily
2. **Incremental Builds:** Only run full build when needed
3. **Gradle Daemon:** Keep Gradle daemon running (default behavior)

### Automate Common Tasks
```bash
# Create alias in your shell profile
alias build-apk="cd /path/to/hkmtrvue-1/scripts && build-apk.cmd"
alias check-apk="cd /path/to/hkmtrvue-1/scripts && check-apk-status.cmd"
```

### CI/CD Integration
These scripts can be used in CI/CD pipelines:
```yaml
# GitHub Actions example
- name: Build APK
  run: |
    cd scripts
    ./build-apk.cmd
```

---

**Need help?** Check the [main documentation](../docs/README.md) or open an issue on GitHub.

🛠️ **Happy Building!** 🚀
