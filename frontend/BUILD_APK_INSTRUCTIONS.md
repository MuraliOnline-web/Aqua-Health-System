# Build Instructions for Fish Disease Detector APK

## Prerequisites
- Node.js and npm installed
- Android Studio installed (with SDK)
- Java JDK 17 or higher

## Steps to Build APK

### 1. Update Backend URL
Edit `.env.production` file and set your deployed backend URL:
```
VITE_API_URL=https://your-backend-url.com
```

### 2. Build the App
```bash
npm run build
npx cap sync android
```

### 3. Open in Android Studio
```bash
npx cap open android
```

### 4. Generate APK in Android Studio
1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. APK will be in: `C:\projects\aqua-health-pro\android\app\build\outputs\apk\debug`

### 5. Generate Signed APK (for Release)
1. Click **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Create or select a keystore
4. Choose release build variant
5. APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

## Quick Build Commands

### Debug APK (no signing required)
```bash
cd android
gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (requires signing)
```bash
cd android
gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Important Notes
- **You MUST deploy your backend** to a public server (Render, Railway, etc.)
- Update `VITE_API_URL` in `.env.production` with your backend URL
- The app will NOT work with localhost URLs when installed on a phone
- Rebuild the app after changing the backend URL

## Testing
- Install the APK on your Android device
- Make sure your backend is deployed and accessible
- Upload a fish image to test the detection
