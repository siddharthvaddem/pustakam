import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { dayLabel, timeLabel } from '../../features/notes/dates';
import { MATCH_END, MATCH_START, type SearchResult } from '../../features/search/search';
import { styles } from './NoteResult.styles';

// A search result. Tapping opens its day at that entry.
export function NoteResult({ result }: { result: SearchResult }) {
  const when = `${dayLabel(result.day)} · ${timeLabel(result.startedAt)}`;
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/notes/[day]',
          params: { day: result.day, entry: String(result.id) },
        })
      }
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.when}>{when}</Text>
      <Text style={styles.snippet} numberOfLines={2}>
        <Snippet text={result.snippet} />
      </Text>
    </Pressable>
  );
}

function Snippet({ text }: { text: string }) {
  const [first, ...rest] = text.split(MATCH_START);
  return (
    <>
      {first}
      {rest.map((part, i) => {
        const [match, after] = part.split(MATCH_END);
        return (
          <Text key={i}>
            <Text style={styles.match}>{match}</Text>
            {after}
          </Text>
        );
      })}
    </>
  );
}
