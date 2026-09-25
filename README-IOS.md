# CampusRide iOS Application & PWA Guide

This repository contains full iOS support for **CampusRide**, providing two distinct deployment paths for Apple iOS devices (iPhone & iPad):

---

## 📱 Option 1: Instant iOS PWA (Progressive Web App)
Users on iPhone can run CampusRide directly without downloading an `.ipa` file from the App Store.

### 🌟 Features:
- **Standalone App Experience**: Launches full screen without Safari browser chrome.
- **Dynamic Notch & Safe Area Support**: Styled for iPhone notches and the Dynamic Island.
- **Automatic iOS Install Banner**: Guides iPhone Safari visitors to tap **Share** → **Add to Home Screen**.
- **Dark Theme Status Bar**: Synchronized `#0B0F17` status bar styling.
- **WebKit Keyboard Safeguard**: 16px font minimums prevent unwanted auto-zooming on form fields.

### 🔗 How iPhone Users Access It:
1. Open your live website URL in **Safari** on an iPhone: `https://campusride-orpin.vercel.app`
2. Tap **Share** <svg class="inline w-3 h-3" viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>.
3. Select **Add to Home Screen** ➕.

---

## 🛠️ Option 2: Native iOS App (Xcode / App Store / TestFlight)
The native iOS project is pre-built using Capacitor in `client/ios/App`.

### Prerequisites for Native Compilation:
- A Mac computer running macOS.
- Xcode installed (free from the Mac App Store).
- An Apple Developer account (for TestFlight or App Store distribution).

### 🚀 Building the iOS Project on a Mac:

1. **Build Web Assets**:
   ```bash
   cd client
   npm run build
   ```

2. **Sync with Capacitor iOS**:
   ```bash
   npx cap sync ios
   ```

3. **Open Xcode**:
   ```bash
   npx cap open ios
   ```

4. **Run or Archive in Xcode**:
   - Select your target iPhone Simulator or connected iPhone to run locally.
   - Choose **Product > Archive** to build an `.ipa` for TestFlight or App Store distribution.

---

## 🔑 Native Configuration & Permissions (`Info.plist`)

- **Bundle ID**: `com.campusride.app`
- **Location Usage**: `NSLocationWhenInUseUsageDescription` (Finding rides nearby)
- **Camera Access**: `NSCameraUsageDescription` (Profile picture / identity verification)
- **Photo Library**: `NSPhotoLibraryUsageDescription` & `NSPhotoLibraryAddUsageDescription`
- **Transport Security**: Backend requests strictly routed over `https://campusride-backend-03ea.onrender.com/api`.
