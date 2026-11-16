import { router } from 'expo-router';
import { CaretLeftIcon, MagnifyingGlassIcon, XIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton/IconButton';
import { NoteResult } from '../components/NoteResult/NoteResult';
import { warmUpEmbedder } from '../features/search/embedder';
import { useSearch } from '../features/search/useSearch';
import { useTheme } from '../theme';
import { useStyles } from './SearchScreen.styles';

export function SearchScreen() {
  const styles = useStyles();
  const { scheme, colors } = useTheme();
  const [query, setQuery] = useState('');
  const { results, searching } = useSearch(query);
  const hasQuery = query.trim().length > 0;

  useEffect(warmUpEmbedder, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.bar}>
        <IconButton icon={CaretLeftIcon} accessibilityLabel="Back" onPress={() => router.back()} />
        <View style={styles.field}>
          <MagnifyingGlassIcon size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="search notes"
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            keyboardAppearance={scheme}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            accessibilityLabel="Search notes"
          />
          {hasQuery && (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={12}
            >
              <XIcon size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!hasQuery ? (
        <Text style={styles.hint}>search your notes by meaning or by word</Text>
      ) : results.length === 0 && !searching ? (
        <Text style={styles.hint}>nothing found for “{query.trim()}”</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <NoteResult result={item} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}
