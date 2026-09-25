# CampusRide Android Application

This project has been converted from a web application into a professional Android application using Capacitor.

## 📁 Live OTA Build Artifacts

You can find the newly generated live OTA build files here:

1. **Root Live OTA APK**: [`CampusRide-LIVE-OTA-NEW.apk`](file:///c:/Users/adity/OneDrive/Desktop/campus-ride%20android/CampusRide-LIVE-OTA-NEW.apk)
2. **Android-Builds Live OTA APK**: [`Android-Builds/CampusRide-live-ota.apk`](file:///c:/Users/adity/OneDrive/Desktop/campus-ride%20android/Android-Builds/CampusRide-live-ota.apk)
3. **Android-Builds Release APK**: [`Android-Builds/CampusRide-release.apk/CampusRide-release.apk`](file:///c:/Users/adity/OneDrive/Desktop/campus-ride%20android/Android-Builds/CampusRide-release.apk/CampusRide-release.apk)
4. **Play Store AAB Bundle**: [`Android-Builds/CampusRide-release.aab/app-release.aab`](file:///c:/Users/adity/OneDrive/Desktop/campus-ride%20android/Android-Builds/CampusRide-release.aab/app-release.aab)

> ⚡ **Live OTA Architecture**: Installing any of these updated APKs once enables automatic over-the-air frontend updates directly from `https://campusride-orpin.vercel.app`. Future frontend changes deployed to Vercel require **ZERO APK updates**!

## 🚀 How to build the project locally

If you want to rebuild the Android application yourself, follow these steps:

### Prerequisites
- Node.js installed
- Android Studio installed
- Java 11 or 17 (Java 8 is too old for modern Android Gradle builds)

### 1. Build the Web Assets
Navigate to the `client` directory and run:
```bash
npm run build
```

### 2. Sync with Capacitor
Sync the built assets to the Android project:
```bash
npx cap sync android
```

### 3. Open in Android Studio
To run the app on an emulator or a physical device:
```bash
npx cap open android
```

### 4. Build APK/AAB in Android Studio
- Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)** for APK.
- Go to **Build > Build Bundle(s) / APK(s) > Build Bundle(s)** for AAB.

## 🔑 App Signing (For Play Store)

To publish on the Google Play Store, you must sign your app with a production key:

1.  In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2.  Follow the wizard to create a new keystore (`.jks` file).
3.  **IMPORTANT**: Keep your keystore and passwords safe and do NOT commit them to GitHub.

## 🛠️ Configuration Details

- **App Name**: CampusRide
- **Package ID**: `com.campusride.app`
- **Backend URL**: Automatically uses the production Render backend when running on a phone.
- **Permissions**:
    - `INTERNET`: For API communication.
    - `ACCESS_FINE_LOCATION`: For GPS/location features.
- **Back Button**: Handled naturally (exits app only from Dashboard/Home).
- **Theme**: Dark theme optimized (#0B0F17).

## 📱 Data Safety & Privacy Policy

Since CampusRide collects user names, emails, and location data:
1.  **Privacy Policy**: You MUST host a privacy policy URL (you can use a GitHub Gist or a simple page on your website).
2.  **Data Safety Form**: When uploading to Play Console, declare that you collect:
    - Personal Info (Name, Email, Phone)
    - Location (Approximate/Precise)
    - Photos (if profile pictures are enabled)
