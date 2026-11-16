import { Platform } from 'react-native';
import LiteRtLm, { type Backend } from '../../../modules/litert-lm';
import ModelStore from '../../../modules/model-store';
import { SEARCH_EMBED } from '../models/packs';

// CPU was faster than GPU on a Pixel 8; Google's iPhone numbers favour GPU.
const BACKEND: Backend = Platform.OS === 'android' ? 'cpu' : 'gpu';

// About the model's 2,000-token limit.
const MAX_CHARS = 6000;

let loading: Promise<void> | null = null;

async function load() {
  const { path } = await ModelStore.getStatus(SEARCH_EMBED.id, SEARCH_EMBED.version);
  const modelPath = `${path}/${SEARCH_EMBED.files[0].name}`;
  try {
    await LiteRtLm.loadEmbedder(modelPath, BACKEND);
  } catch {
    await LiteRtLm.loadEmbedder(modelPath, 'cpu');
  }
}

// Loads the model on the first call.
async function embed(texts: string[]): Promise<number[][]> {
  try {
    return await LiteRtLm.embed(texts);
  } catch (error) {
    if ((error as { code?: string }).code !== 'E_NOT_LOADED') throw error;
    loading ??= load().finally(() => (loading = null));
    await loading;
    return LiteRtLm.embed(texts);
  }
}

// Prefixes from the EmbeddingGemma model card.
export function embedNotes(texts: string[]): Promise<number[][]> {
  return embed(texts.map((text) => `title: none | text: ${text.slice(0, MAX_CHARS)}`));
}

// So the first search isn't slowed by loading the model.
export function warmUpEmbedder() {
  embedQuery('').catch(() => {});
}

export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embed([`task: search result | query: ${query}`]);
  return vector;
}
