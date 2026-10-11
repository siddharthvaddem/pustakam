#!/usr/bin/env bash
# Downloads the Moonshine files that are too big to keep in git:
#   - the speech model, bundled into the app on both platforms
#   - Moonshine's prebuilt iOS framework
# Every file is checked against a known checksum. Safe to run again; it skips
# whatever is already in place.
set -euo pipefail

MODULE="$(cd "$(dirname "$0")/../modules/moonshine-stt" && pwd)"

MODEL_NAME="small-streaming-en"
MODEL_URL="https://download.moonshine.ai/model/$MODEL_NAME/quantized_26_08_21"
MODEL_DIR="$MODULE/models/$MODEL_NAME"

FRAMEWORK_URL="https://github.com/moonshine-ai/moonshine-swift/releases/download/v0.1.5/Moonshine.xcframework.zip"
FRAMEWORK_SHA="6bc7fb4b6d3a470a2ae2d681299975f3ba9d710753786d1cd7e8beabaad066e8"
FRAMEWORK_DIR="$MODULE/ios/Frameworks/Moonshine.xcframework"

# file name, then its sha256
MODEL_FILES=(
  "adapter.ort c665f742364febad597cc9ac1e0b341ffbee0e24a1466e2f3bde95e6e4771762"
  "cross_kv.ort e2d3417144e9514055ebfefe8dcc4c0a55a55adcb8530435844c75c53e352bf6"
  "decoder_kv.ort 1a05465b1dd955858dfcbee039c0020fb5dd982b0f5094c34e61735d518d771b"
  "encoder.ort 2d4d973e91e8aca08c51e7e7efa28a46ab265b63d809d5294d18b86bcd85b993"
  "frontend.model.ort 09b1210ae30dc5f0f3e45f0ebab914c254741323114f53fbbe5ae62cca35058f"
  "frontend.weights.ort 7ef97521bd4bad3928f5bb6808586f4fcc6e92bd5990394112eed7d4052ec338"
  "streaming_config.json 26f02b6afb22d60871a5efd85c3d38e569cc0ddb6c5eb6e93d3260152ae8a47a"
  "tokenizer.bin 6884b35fd6377d4c4d32336a0bc152f36b64d1e45b6503683cdc238250a8472d"
)

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

echo "Model ($MODEL_NAME)"
mkdir -p "$MODEL_DIR"
for entry in "${MODEL_FILES[@]}"; do
  read -r file expected <<<"$entry"
  download_checked "$MODEL_URL/$file" "$MODEL_DIR/$file" "$expected"
done

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
