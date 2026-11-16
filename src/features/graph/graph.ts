import { sqlite } from '../../db/client';
import { preview, type SearchResult } from '../search/search';
import { assignThemes, loadThemeVectors, THEMES } from './themes';

export type ThemeNode = { kind: 'theme'; key: string; label: string; count: number };
export type NoteNode = {
  kind: 'note';
  id: number;
  day: string;
  startedAt: number;
  preview: string;
};
export type GraphNode = ThemeNode | NoteNode;
export type GraphLink = { note: number; theme: string; score: number };
export type NoteGraph = { nodes: GraphNode[]; links: GraphLink[] };

export type GraphSelection = { kind: 'theme'; key: string } | { kind: 'note'; id: number } | null;

export function themeNodeId(key: string): string {
  return `t:${key}`;
}

export function noteNodeId(id: number): string {
  return `n:${id}`;
}

export function nodeId(node: NonNullable<GraphSelection>): string {
  return node.kind === 'theme' ? themeNodeId(node.key) : noteNodeId(node.id);
}

export function toSearchResult(note: NoteNode): SearchResult {
  return { id: note.id, day: note.day, startedAt: new Date(note.startedAt), snippet: note.preview };
}

type EntryRow = { id: number; day: string; startedAt: number; text: string; embedding: Uint8Array };

// Copied so the Float32Array starts on a 4-byte boundary.
function toVector(blob: Uint8Array): Float32Array {
  return new Float32Array(blob.slice().buffer);
}

export async function loadNoteGraph(): Promise<NoteGraph> {
  const rows = await sqlite.getAllAsync<EntryRow>(
    `SELECT e.id, e.day, e.started_at AS startedAt, e.text, v.embedding FROM entries e
     JOIN entry_embeddings v ON v.entry_id = e.id AND v.chunk = 0
     ORDER BY e.started_at`,
  );
  if (rows.length === 0) return { nodes: [], links: [] };

  const { vectors, baseline } = await loadThemeVectors();
  const matches = assignThemes(
    rows.map((row) => toVector(row.embedding)),
    vectors,
    baseline,
  );
  const links = rows.flatMap((row, index) =>
    matches[index].map(({ theme, score }) => ({ note: row.id, theme: THEMES[theme].key, score })),
  );

  const counts = new Map<string, number>();
  for (const link of links) counts.set(link.theme, (counts.get(link.theme) ?? 0) + 1);
  const themes: ThemeNode[] = THEMES.flatMap(({ key, label }) => {
    const count = counts.get(key) ?? 0;
    return count > 0 ? [{ kind: 'theme' as const, key, label, count }] : [];
  });
  const notes: NoteNode[] = rows.map((row) => ({
    kind: 'note',
    id: row.id,
    day: row.day,
    startedAt: row.startedAt,
    preview: preview(row.text),
  }));
  return { nodes: [...themes, ...notes], links };
}
