# Haven — Native Android Packaging & Build Guide

This project includes dual standalone applications for residential building management tailored for Algeria and North Africa:
1. **Haven Resident App** (`com.haven.resident`) — Live outage status, water return confirmations, community notices & shared expenses, resident ticket reporting, emergency directory.
2. **Haven Manager Suite (Syndic)** (`com.haven.manager`) — Multi-building portfolio selector, emergency outage dispatcher with 1-tap presets, expense calculator, tenant issue manager.

---

## 1. Quick Testing & Standalone Preview in Browser

You can preview each app in isolated standalone mode:
- **Resident Standalone:** `/?app=resident&standalone=true`
- **Manager Suite Standalone:** `/?app=manager&standalone=true`
- **Dual Launcher Mode:** Open the root URL `/` and toggle between apps using the top launcher bar.

---

## 2. Packaging as Native Android APK with Capacitor 6 (Recommended)

Capacitor wraps the web application into an official Android Studio project that can be compiled into a `.apk` (debug or release) or `.aab` (Android App Bundle for Google Play).

### Prerequisites
- Node.js 18+
- Android Studio (Koala / Iguana or later) with Android SDK 34+
- Java JDK 17+

### Step-by-Step Instructions

#### Step 1: Install Capacitor dependencies
\`\`\`bash
npm install @capacitor/core @capacitor/cli @capacitor/android
\`\`\`

#### Step 2: Build the web bundle
\`\`\`bash
npm run build
\`\`\`

#### Step 3: Add the Android platform
\`\`\`bash
npx cap add android
\`\`\`

#### Step 4: Sync assets and plugins
\`\`\`bash
npx cap sync android
\`\`\`

#### Step 5: Open the project in Android Studio
\`\`\`bash
npx cap open android
\`\`\`

#### Step 6: Build the APK in Android Studio
- In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- The output `.apk` file will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`.

Or build directly via command line:
\`\`\`bash
cd android
./gradlew assembleDebug
\`\`\`

---

## 3. Packaging as Two Separate Standalone APKs

If you wish to distribute two completely independent APKs (one for tenants on Google Play, and one for the management company):

### For the Resident App (`Haven Résidents`):
1. In `capacitor.config.json`:
   \`\`\`json
   {
     "appId": "com.haven.resident",
     "appName": "Haven Résidents",
     "webDir": "dist",
     "server": {
       "url": "https://your-domain.com/?app=resident&standalone=true",
       "cleartext": true
     }
   }
   \`\`\`
2. Run `npx cap sync android` and build.

### For the Manager App (`Haven Syndic`):
1. In `capacitor.config.json`:
   \`\`\`json
   {
     "appId": "com.haven.manager",
     "appName": "Haven Syndic",
     "webDir": "dist",
     "server": {
       "url": "https://your-domain.com/?app=manager&standalone=true",
       "cleartext": true
     }
   }
   \`\`\`
2. Run `npx cap sync android` and build.

---

## 4. Google Play Trusted Web Activity (TWA) with Bubblewrap CLI

\`\`\`bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://your-domain.com/manifest.json"
bubblewrap build
\`\`\`

---

## 5. Built-in Localized Hotlines for Algeria
- **Protection Civile:** 14
- **Police Secours:** 17
- **Gendarmerie Nationale:** 1055
- **SEAAL (Eau & Assainissement):** 1594
- **Sonelgaz (Dépannage Électricité & Gaz):** 3303
