# Setup

These steps assume a Mac. You need a Mac to build for iOS; Android works from a Mac, Linux or Windows (the Android steps below use Homebrew, so adapt them on other systems).

## 1. Tools everyone needs

- [Node.js](https://nodejs.org) 20 or newer
- [Homebrew](https://brew.sh) (macOS)

## 2. For iOS

1. Install **Xcode 16.1 or newer** from the App Store.
2. Install the iOS simulator. In Xcode open **Settings → Components** and download the iOS platform, or run:
   ```bash
   xcodebuild -downloadPlatform iOS
   ```
3. Install CocoaPods:
   ```bash
   brew install cocoapods
   ```
   If `pod install` later complains about encoding, add `export LANG=en_US.UTF-8` to your `~/.zshrc`.

## 3. For Android

Either install [Android Studio](https://developer.android.com/studio), which includes everything, or install just the command-line pieces:

```bash
brew install openjdk@17
brew install --cask android-commandlinetools
```

Add these to your `~/.zshrc`, then open a new terminal:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
```

Install the SDK pieces this project builds against:

```bash
SDKM=/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin/sdkmanager
yes | $SDKM --sdk_root=$ANDROID_HOME --licenses
$SDKM --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" "cmake;3.22.1"
```

## 4. Get the project

```bash
git clone <repo-url> memory-bank
cd memory-bank
npm install
npm run setup
```

`npm run setup` downloads the speech model and Moonshine's iOS framework (~250 MB) from Moonshine's official servers and checks every file against a known checksum.

## 5. Run it

```bash
npm run ios       # iOS simulator
npm run android   # Android phone connected over USB
```
