import { count, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useState } from 'react';
import { db } from '../../db/client';
import { entryEmbeddings } from '../../db/schema';
import { loadNoteGraph, type NoteGraph } from './graph';

// Edits and deletes drop chunk 0 and indexing re-adds it, so this moves on every note change.
function useIndexedCount(): number | undefined {
  const { data } = useLiveQuery(
    db.select({ count: count() }).from(entryEmbeddings).where(eq(entryEmbeddings.chunk, 0)),
  );
  return data[0]?.count;
}

const EMPTY: NoteGraph = { nodes: [], links: [] };

// null until the first load finishes.
export function useNoteGraph(): NoteGraph | null {
  const indexed = useIndexedCount();
  const [graph, setGraph] = useState<NoteGraph | null>(null);

  useEffect(() => {
    if (indexed === undefined) return;
    let current = true;
    loadNoteGraph()
      .then((next) => {
        if (current) setGraph(next);
      })
      // Theme vectors need the embedding model; if it fails, keep what's shown.
      .catch(() => {
        if (current) setGraph((shown) => shown ?? EMPTY);
      });
    return () => {
      current = false;
    };
  }, [indexed]);

  return graph;
}
