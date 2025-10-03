# 📱 HKMTRVUE Android APK 構建指南

## ✅ **第一階段完成！Capacitor 已設置完成**

**狀態：** ✅ **Android 平台已成功添加**

---

## 🎯 **已完成的步驟：**

### ✅ Phase 1: 安裝 Capacitor
```bash
npm install @capacitor/core @capacitor/cli --save
```
**結果：** ✅ 已安裝

### ✅ Phase 2: 初始化 Capacitor
```bash
npx cap init
```
**配置：**
- **App Name:** HKMTRVUE
- **Package ID:** com.hkmtrvue.app
- **Web Dir:** dist

**結果：** ✅ `capacitor.config.ts` 已創建

### ✅ Phase 3: 安裝 Android 平台
```bash
npm install @capacitor/android --save
```
**結果：** ✅ 已安裝

### ✅ Phase 4: 構建 Vue 應用
```bash
npm run build
```
**結果：** ✅ 構建成功 (1.09s)
- **產出：** dist/index.html, CSS, JS
- **大小：** 109.43 kB (41.23 kB gzipped)

### ✅ Phase 5: 添加 Android 平台
```bash
npx cap add android
```
**結果：** ✅ Android 項目已創建在 `android/` 目錄

### ✅ Phase 6: 同步項目
```bash
npx cap sync
```
**結果：** ✅ Web 資源已複製到 Android 項目

---

## 📁 **項目結構：**

```
hkmtrvue-1/
├── android/                    <- ✅ 新建：Android 項目
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── assets/
│   │   │       │   └── public/  <- Vue 構建文件
│   │   │       ├── java/
│   │   │       └── res/         <- 圖標、啟動畫面
│   │   └── build.gradle
│   ├── gradle/
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.ts         <- ✅ 新建：Capacitor 配置
├── dist/                       <- ✅ Vue 構建產出
├── src/                        <- Vue 源代碼
└── package.json
```

---

## 🚀 **下一步：構建 APK**

### **方法 1: 使用 Android Studio（推薦）** ⭐

#### **步驟 1: 安裝 Android Studio**
下載並安裝：https://developer.android.com/studio

#### **步驟 2: 打開項目**
```bash
npx cap open android
```
這會在 Android Studio 中打開 `android/` 項目。

#### **步驟 3: 構建 APK**
在 Android Studio 中：
1. 點擊 **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. 等待構建完成（2-5分鐘）
3. 點擊通知中的 **locate** 找到 APK 文件

**APK 位置：**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### **方法 2: 命令行構建（需要 Android SDK）**

#### **前置要求：**
1. **安裝 Java JDK 17+**
   - 下載：https://adoptium.net/
   - 設置 `JAVA_HOME` 環境變量

2. **安裝 Android SDK**
   - 通過 Android Studio 安裝
   - 或使用 `sdkmanager` 命令行工具

3. **配置環境變量**
   ```bash
   ANDROID_HOME=C:\Users\<你的用戶名>\AppData\Local\Android\Sdk
   JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
   ```

#### **構建命令：**

**進入 Android 目錄：**
```bash
cd android
```

**構建 Debug APK：**
```bash
gradlew assembleDebug
```

**構建 Release APK（需要簽名）：**
```bash
gradlew assembleRelease
```

**APK 輸出位置：**
- **Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release:** `android/app/build/outputs/apk/release/app-release.apk`

---

### **方法 3: 快速測試（推薦用於開發）**

#### **在真實設備上測試：**

1. **啟用 USB 調試**
   - 在手機上：設置 → 關於手機 → 連續點擊 "版本號" 7次
   - 開發者選項 → 啟用 "USB 調試"

2. **連接手機到電腦**

3. **運行應用：**
   ```bash
   npx cap run android
   ```

這會自動：
- 構建 APK
- 安裝到手機
- 啟動應用

---

## 🎨 **自定義應用圖標和啟動畫面**

### **圖標位置：**
```
android/app/src/main/res/
├── mipmap-hdpi/
├── mipmap-mdpi/
├── mipmap-xhdpi/
├── mipmap-xxhdpi/
└── mipmap-xxxhdpi/
```

### **所需尺寸：**
| 密度 | 尺寸 |
|------|------|
| mdpi | 48x48 |
| hdpi | 72x72 |
| xhdpi | 96x96 |
| xxhdpi | 144x144 |
| xxxhdpi | 192x192 |

### **啟動畫面：**
```
android/app/src/main/res/drawable/
└── splash.png
```

---

## 📝 **應用信息配置**

### **修改應用名稱：**
編輯 `android/app/src/main/res/values/strings.xml`：
```xml
<resources>
    <string name="app_name">HKMTRVUE</string>
    <string name="title_activity_main">HKMTRVUE</string>
    <string name="package_name">com.hkmtrvue.app</string>
    <string name="custom_url_scheme">com.hkmtrvue.app</string>
</resources>
```

### **修改版本號：**
編輯 `android/app/build.gradle`：
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

---

## 🔐 **簽名 APK（發布用）**

### **生成密鑰庫：**
```bash
keytool -genkey -v -keystore hkmtrvue-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hkmtrvue
```

### **配置簽名：**
編輯 `android/app/build.gradle`：
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../hkmtrvue-release-key.jks')
            storePassword 'your_password'
            keyAlias 'hkmtrvue'
            keyPassword 'your_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### **構建簽名的 Release APK：**
```bash
cd android
gradlew assembleRelease
```

---

## 🎯 **完整構建流程（從零開始）**

### **每次更新代碼後：**

```bash
# 1. 構建 Vue 應用
npm run build

# 2. 同步到 Android
npx cap sync

# 3. 構建 APK（選擇其中一個）
# 方法 A: 使用 Android Studio
npx cap open android
# 然後在 Android Studio 中構建

# 方法 B: 命令行
cd android
gradlew assembleDebug
cd ..
```

---

## 📊 **構建狀態檢查**

### **驗證配置：**
```bash
npx cap doctor
```

### **查看已安裝平台：**
```bash
npx cap ls
```

### **更新 Capacitor：**
```bash
npm update @capacitor/core @capacitor/cli @capacitor/android
npx cap sync
```

---

## ❓ **常見問題**

### **Q: 找不到 Android SDK**
**A:** 設置環境變量：
```bash
ANDROID_HOME=C:\Users\<你的用戶名>\AppData\Local\Android\Sdk
```

### **Q: Gradle 構建失敗**
**A:** 檢查：
1. Java 版本（需要 JDK 17+）
2. Gradle 版本
3. 網絡連接（Gradle 需要下載依賴）

### **Q: APK 太大**
**A:** 優化：
1. 啟用 ProGuard/R8
2. 移除未使用的資源
3. 使用 App Bundle 代替 APK

### **Q: 應用閃退**
**A:** 檢查：
1. Chrome DevTools 遠程調試
2. Android Logcat 日誌
3. 權限配置（如果使用了特殊功能）

---

## 🎊 **成功標誌**

構建成功後，你應該看到：
```
✅ APK 文件：android/app/build/outputs/apk/debug/app-debug.apk
✅ 文件大小：約 3-5 MB
✅ 可安裝到 Android 5.0+ 設備
```

---

## 📱 **測試 APK**

### **在真實設備上：**
1. 複製 APK 到手機
2. 啟用 "未知來源安裝"
3. 點擊 APK 安裝
4. 打開應用測試

### **使用 ADB：**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 **下一步建議**

1. ✅ **立即執行：** 使用 Android Studio 構建第一個 APK
2. 📱 **測試：** 在真實設備上安裝測試
3. 🎨 **自定義：** 添加自定義圖標和啟動畫面
4. 🔐 **準備發布：** 生成簽名的 Release APK
5. 📲 **發布：** 上傳到 Google Play Store

---

## 📞 **需要幫助？**

**常用命令速查：**
```bash
npx cap open android          # 打開 Android Studio
npx cap sync                  # 同步 Web 資源
npx cap run android           # 運行到設備
npx cap doctor                # 檢查環境
```

**日誌調試：**
```bash
npx cap run android -l        # 實時查看日誌
```

---

## ✅ **當前狀態：準備構建 APK！**

**下一步執行：**
```bash
npx cap open android
```

然後在 Android Studio 中：**Build → Build APK(s)** 🚀

**預計完成時間：** 2-5 分鐘（首次構建可能需要更長時間下載依賴）
