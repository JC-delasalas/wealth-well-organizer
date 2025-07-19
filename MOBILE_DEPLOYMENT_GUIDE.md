# Wealth Well Organizer - Mobile Deployment Guide

## Prerequisites

### Development Environment Setup
```bash
# Install Node.js 18+ and npm
# Install Xcode (for iOS development)
# Install Android Studio (for Android development)
# Install CocoaPods (for iOS)
sudo gem install cocoapods
```

## Step 1: Install Capacitor Dependencies

```bash
# Core Capacitor packages
npm install @capacitor/core @capacitor/cli

# Platform-specific packages
npm install @capacitor/ios @capacitor/android

# Native plugins
npm install @capacitor/camera @capacitor/filesystem @capacitor/status-bar
npm install @capacitor/haptics @capacitor/splash-screen @capacitor/keyboard
npm install @capacitor/local-notifications @capacitor/push-notifications
```

## Step 2: Initialize Capacitor

```bash
# Initialize Capacitor project
npx cap init "Wealth Well Organizer" "com.wealthwell.organizer"

# Add platforms
npx cap add ios
npx cap add android
```

## Step 3: Configure App Icons and Splash Screens

### Create App Icons
Place app icons in the following sizes:
- `resources/icon.png` (1024x1024)
- iOS: Various sizes from 20x20 to 1024x1024
- Android: Various densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

### Create Splash Screens
- `resources/splash.png` (2732x2732)
- Platform-specific splash screens will be generated

### Generate Resources
```bash
# Install Capacitor Assets plugin
npm install @capacitor/assets --save-dev

# Generate icons and splash screens
npx capacitor-assets generate
```

## Step 4: Build and Sync

```bash
# Build the web app
npm run build

# Copy web assets to native projects
npx cap copy

# Update native dependencies
npx cap sync
```

## Step 5: iOS Configuration

### Configure Info.plist
Add the following permissions to `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to capture receipt photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select receipt images</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for voice notes</string>
```

### Open in Xcode
```bash
npx cap open ios
```

### iOS Build Settings
1. Set Development Team
2. Configure Bundle Identifier: `com.wealthwell.organizer`
3. Set Deployment Target: iOS 13.0+
4. Configure signing certificates

## Step 6: Android Configuration

### Configure AndroidManifest.xml
Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Configure Network Security
Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
    </domain-config>
</network-security-config>
```

### Open in Android Studio
```bash
npx cap open android
```

### Android Build Configuration
1. Set compileSdkVersion: 34
2. Set minSdkVersion: 22
3. Set targetSdkVersion: 34
4. Configure signing keys for release builds

## Step 7: Testing on Devices

### iOS Testing
```bash
# Run on iOS simulator
npx cap run ios

# Run on physical device (requires Apple Developer account)
npx cap run ios --target="Your iPhone"
```

### Android Testing
```bash
# Run on Android emulator
npx cap run android

# Run on physical device (enable USB debugging)
npx cap run android --target="device-id"
```

## Step 8: Production Build Process

### iOS Production Build
1. Archive in Xcode (Product → Archive)
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

### Android Production Build
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate App Bundle (recommended)
./gradlew bundleRelease
```

## Step 9: App Store Deployment

### iOS App Store
1. Create app in App Store Connect
2. Upload build using Xcode or Transporter
3. Fill out app information
4. Submit for review

### Google Play Store
1. Create app in Google Play Console
2. Upload APK or App Bundle
3. Fill out store listing
4. Submit for review

## Step 10: Continuous Deployment

### GitHub Actions Workflow
Create `.github/workflows/mobile-build.yml`:

```yaml
name: Mobile Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build web app
      run: npm run build
    
    - name: Sync Capacitor
      run: npx cap sync
    
    - name: Build iOS
      run: |
        cd ios/App
        xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS build
```

## Troubleshooting Common Issues

### Build Errors
```bash
# Clean and rebuild
npx cap clean
npm run build
npx cap sync
```

### iOS Simulator Issues
```bash
# Reset iOS simulator
xcrun simctl erase all
```

### Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Plugin Issues
```bash
# Reinstall plugins
npm uninstall @capacitor/camera
npm install @capacitor/camera
npx cap sync
```

## Performance Optimization

### Bundle Size Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          capacitor: ['@capacitor/core', '@capacitor/camera']
        }
      }
    }
  }
});
```

### Image Optimization
- Use WebP format for images
- Implement lazy loading
- Compress images before upload

### Network Optimization
- Implement offline caching
- Use service workers
- Optimize API calls

## Security Considerations

### API Keys
- Never expose API keys in client code
- Use environment variables
- Implement proper authentication

### Data Protection
- Encrypt sensitive data
- Use secure storage
- Implement proper session management

### Network Security
- Use HTTPS only
- Implement certificate pinning
- Validate all inputs

## Monitoring and Analytics

### Crash Reporting
```bash
npm install @capacitor-community/firebase-crashlytics
```

### Analytics
```bash
npm install @capacitor-community/firebase-analytics
```

### Performance Monitoring
- Monitor app startup time
- Track user interactions
- Monitor network requests

## Maintenance

### Regular Updates
- Update Capacitor regularly
- Update native dependencies
- Test on latest OS versions

### Version Management
- Use semantic versioning
- Maintain changelog
- Test thoroughly before releases

This guide provides a comprehensive approach to deploying the Wealth Well Organizer as a mobile app using Capacitor.
