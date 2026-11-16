import type { Href } from 'expo-router';

export type Tab = {
  // File name under app/(drawer)/(tabs)/.
  name: string;
  href: Href;
  title: string;
};

// The tab bar and drawer both read this, so a new tab only needs adding here.
export const TABS: Tab[] = [
  { name: 'index', href: '/', title: 'Record' },
  { name: 'notes', href: '/notes', title: 'Notes' },
];
