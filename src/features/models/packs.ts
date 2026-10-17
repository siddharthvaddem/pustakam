import type { PackFile } from '../../../modules/model-store';

// Models the app downloads once after install and keeps on the phone. Each pack is a
// folder of files pinned to exact checksums; changing `version` makes phones that have
// the old files download the new ones.
export type ModelPack = {
  id: string;
  version: string;
  files: PackFile[];
};

const MOONSHINE_SMALL_EN =
  'https://download.moonshine.ai/model/small-streaming-en/quantized_26_08_21';

function moonshineFile(name: string, sha256: string, size: number): PackFile {
  return { name, url: `${MOONSHINE_SMALL_EN}/${name}`, sha256, size };
}

// Moonshine Small Streaming, English: the speech-to-text model.
export const SPEECH_EN: ModelPack = {
  id: 'speech-en',
  version: 'small-streaming-en@quantized_26_08_21',
  files: [
    moonshineFile(
      'adapter.ort',
      'c665f742364febad597cc9ac1e0b341ffbee0e24a1466e2f3bde95e6e4771762',
      2870368,
    ),
    moonshineFile(
      'cross_kv.ort',
      'e2d3417144e9514055ebfefe8dcc4c0a55a55adcb8530435844c75c53e352bf6',
      5356536,
    ),
    moonshineFile(
      'decoder_kv.ort',
      '1a05465b1dd955858dfcbee039c0020fb5dd982b0f5094c34e61735d518d771b',
      81878600,
    ),
    moonshineFile(
      'encoder.ort',
      '2d4d973e91e8aca08c51e7e7efa28a46ab265b63d809d5294d18b86bcd85b993',
      44148576,
    ),
    moonshineFile(
      'frontend.model.ort',
      '09b1210ae30dc5f0f3e45f0ebab914c254741323114f53fbbe5ae62cca35058f',
      26944,
    ),
    moonshineFile(
      'frontend.weights.ort',
      '7ef97521bd4bad3928f5bb6808586f4fcc6e92bd5990394112eed7d4052ec338',
      7769464,
    ),
    moonshineFile(
      'streaming_config.json',
      '26f02b6afb22d60871a5efd85c3d38e569cc0ddb6c5eb6e93d3260152ae8a47a',
      512,
    ),
    moonshineFile(
      'tokenizer.bin',
      '6884b35fd6377d4c4d32336a0bc152f36b64d1e45b6503683cdc238250a8472d',
      249974,
    ),
  ],
};

// EmbeddingGemma 2 Text 270M: turns notes into vectors for search.
export const SEARCH_EMBED: ModelPack = {
  id: 'search-embed',
  version: 'embeddinggemma-2-text-270m@lrtlm-0.18',
  files: [
    {
      name: 'embeddinggemma-2-text-270m.litertlm',
      url: 'https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm/resolve/main/embeddinggemma-2-text-270m.litertlm',
      sha256: '2d079ee2f6f066b1f368e8d7c819f55214eaef1d0513b312321901f30ab286fb',
      size: 164626432,
    },
  ],
};

// Downloaded on first launch, before the app opens.
export const CORE_PACKS: readonly ModelPack[] = [SPEECH_EN, SEARCH_EMBED];

export function packBytes(pack: ModelPack): number {
  return pack.files.reduce((total, file) => total + file.size, 0);
}

// Sizes as people read them: "142 MB". Decimal megabytes, like the App Store and Play Store.
export function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / 1_000_000)} MB`;
}
