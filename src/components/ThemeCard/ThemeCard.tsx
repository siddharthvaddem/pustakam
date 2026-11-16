import { Fragment } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { type NoteNode, toSearchResult } from '../../features/graph/graph';
import { NoteResult } from '../NoteResult/NoteResult';
import { useStyles } from './ThemeCard.styles';

export function ThemeCard({ label, notes }: { label: string; notes: NoteNode[] }) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.header}>
        {label}
        <Text style={styles.count}>
          {' · '}
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Text>
      </Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {notes.map((note, index) => (
          <Fragment key={note.id}>
            {index > 0 && <View style={styles.divider} />}
            <NoteResult result={toSearchResult(note)} />
          </Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
