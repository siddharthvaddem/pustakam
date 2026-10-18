import { useEffect, useState } from 'react';
import type { Entry } from '../../db/schema';
import { relatedMoments, type SearchResult, searchNotes } from './search';

const DEBOUNCE_MS = 250;

// Old results stay on screen until new ones arrive.
export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let current = true;
    const timer = setTimeout(() => {
      searchNotes(query)
        .catch((error) => {
          console.warn('Search failed', error);
          return [];
        })
        .then((found) => {
          if (!current) return;
          setResults(found);
          setSearching(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  return { results, searching };
}

export function useRelatedMoments(day: string, entries: Entry[]) {
  const [related, setRelated] = useState<SearchResult[]>([]);

  useEffect(() => {
    let current = true;
    relatedMoments(day)
      .then((found) => current && setRelated(found))
      .catch((error) => console.warn('Related moments failed', error));
    return () => {
      current = false;
    };
  }, [day, entries]);

  return related;
}
