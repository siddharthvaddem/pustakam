#!/usr/bin/env bash
# Fetches and checksums the prebuilt iOS frameworks that are too big for git.
set -euo pipefail

MODULES="$(cd "$(dirname "$0")/../modules" && pwd)"

MOONSHINE_URL="https://github.com/moonshine-ai/moonshine-swift/releases/download/v0.1.5/Moonshine.xcframework.zip"
MOONSHINE_SHA="6bc7fb4b6d3a470a2ae2d681299975f3ba9d710753786d1cd7e8beabaad066e8"
MOONSHINE_DIR="$MODULES/moonshine-stt/ios/Frameworks/Moonshine.xcframework"

# Same URL and checksum as LiteRT-LM's Package.swift at v0.18.0.
LITERT_URL="https://github.com/google-ai-edge/LiteRT-LM/releases/download/v0.18.0/CLiteRTLM.xcframework.zip"
LITERT_SHA="d765b99592d4ec3d0c9e2bd69469454af06c834861340672da1891c0c121c347"
LITERT_DIR="$MODULES/litert-lm/ios/Frameworks/CLiteRTLM.xcframework"

sha256() { shasum -a 256 "$1" | cut -d' ' -f1; }

download_checked() {
  local url="$1" dest="$2" expected="$3"
  echo "  downloading $(basename "$dest")"
  curl -fsSL "$url" -o "$dest"
  if [[ "$(sha256 "$dest")" != "$expected" ]]; then
    echo "Checksum mismatch for $(basename "$dest"), refusing to use it." >&2
    exit 1
  fi
}

if [[ "$(uname)" != "Darwin" ]]; then
  echo "Skipped: the frameworks are only needed for iOS builds on a Mac."
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Moonshine"
if [[ -d "$MOONSHINE_DIR" ]]; then
  echo "  already in place"
else
  download_checked "$MOONSHINE_URL" "$tmp/Moonshine.xcframework.zip" "$MOONSHINE_SHA"
  unzip -q "$tmp/Moonshine.xcframework.zip" -d "$tmp"
  # Drop the unused macOS slice; keep iPhone + simulator.
  src="$tmp/Moonshine.xcframework"
  mkdir -p "$(dirname "$MOONSHINE_DIR")"
  xcodebuild -create-xcframework \
    -library "$src/ios-arm64/libmoonshine.a" -headers "$src/ios-arm64/Headers" \
    -library "$src/ios-arm64_x86_64-simulator/libmoonshine.a" -headers "$src/ios-arm64_x86_64-simulator/Headers" \
    -output "$MOONSHINE_DIR" >/dev/null
  echo "  done"
fi

echo "LiteRT-LM"
if [[ -d "$LITERT_DIR" ]]; then
  echo "  already in place"
else
  download_checked "$LITERT_URL" "$tmp/CLiteRTLM.xcframework.zip" "$LITERT_SHA"
  mkdir -p "$(dirname "$LITERT_DIR")"
  unzip -q "$tmp/CLiteRTLM.xcframework.zip" -d "$(dirname "$LITERT_DIR")"
  echo "  done"
fi

echo "All set."
