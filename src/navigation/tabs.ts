import type Feather from '@expo/vector-icons/Feather';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

export type Tab = {
  // File name under app/(drawer)/(tabs)/.
  name: string;
  href: Href;
  title: string;
  icon: ComponentProps<typeof Feather>['name'];
};

// The app's tabs, in order. Both the bottom tab bar and the side drawer read
// from this list, so a new tab only needs adding here (plus its route file).
export const TABS: Tab[] = [
  { name: 'index', href: '/', title: 'Record', icon: 'home' },
  { name: 'notes', href: '/notes', title: 'Notes', icon: 'file-text' },
];
