#!/usr/bin/env bash
# Downloads Moonshine's prebuilt iOS framework, which is too big to keep in git,
# and checks it against a known checksum. Safe to run again; it skips it if it's
# already in place. (The speech model itself is downloaded by the app on first launch;
# see src/features/models/packs.ts.)
set -euo pipefail

MODULE="$(cd "$(dirname "$0")/../modules/moonshine-stt" && pwd)"

FRAMEWORK_URL="https://github.com/moonshine-ai/moonshine-swift/releases/download/v0.1.5/Moonshine.xcframework.zip"
FRAMEWORK_SHA="6bc7fb4b6d3a470a2ae2d681299975f3ba9d710753786d1cd7e8beabaad066e8"
FRAMEWORK_DIR="$MODULE/ios/Frameworks/Moonshine.xcframework"

sha256() { shasum -a 256 "$1" | cut -d' ' -f1; }

download_checked() {
  local url="$1" dest="$2" expected="$3"
  if [[ -f "$dest" && "$(sha256 "$dest")" == "$expected" ]]; then
    return
  fi
  echo "  downloading $(basename "$dest")"
  curl -fsSL "$url" -o "$dest.part"
  if [[ "$(sha256 "$dest.part")" != "$expected" ]]; then
    rm -f "$dest.part"
    echo "Checksum mismatch for $(basename "$dest"), refusing to use it." >&2
    exit 1
  fi
  mv "$dest.part" "$dest"
}

echo "iOS framework"
if [[ -d "$FRAMEWORK_DIR" ]]; then
  echo "  already in place"
elif [[ "$(uname)" != "Darwin" ]]; then
  echo "  skipped (only needed for iOS builds on a Mac)"
else
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  download_checked "$FRAMEWORK_URL" "$tmp/Moonshine.xcframework.zip" "$FRAMEWORK_SHA"
  unzip -q "$tmp/Moonshine.xcframework.zip" -d "$tmp"
  # The download also contains a macOS build we never use; keep only iPhone + simulator.
  src="$tmp/Moonshine.xcframework"
  mkdir -p "$(dirname "$FRAMEWORK_DIR")"
  xcodebuild -create-xcframework \
    -library "$src/ios-arm64/libmoonshine.a" -headers "$src/ios-arm64/Headers" \
    -library "$src/ios-arm64_x86_64-simulator/libmoonshine.a" -headers "$src/ios-arm64_x86_64-simulator/Headers" \
    -output "$FRAMEWORK_DIR" >/dev/null
  echo "  done"
fi

echo "All set."
