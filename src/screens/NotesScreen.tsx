import { router } from 'expo-router';
import { CaretRightIcon, ListIcon } from 'phosphor-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../components/GlassTabBar/GlassTabBar';
import { TopBar } from '../components/TopBar/TopBar';
import { dayLabel } from '../features/notes/dates';
import { useDays } from '../features/notes/useDays';
import { useOpenDrawer } from '../navigation/useOpenDrawer';
import { useTheme } from '../theme';
import { useStyles } from './NotesScreen.styles';

export function NotesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const openDrawer = useOpenDrawer();
  const days = useDays();
  const tabBarSpace = useTabBarSpace();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar icon={ListIcon} accessibilityLabel="Open menu" onPress={openDrawer} title="Notes" />
      {days.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>no notes yet</Text>
          <Text style={styles.emptyHint}>what you record will show up here</Text>
        </View>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(item) => item.day}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarSpace }]}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/notes/[day]', params: { day: item.day } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.dayRow, pressed && styles.pressed]}
            >
              <View style={styles.dayText}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>{dayLabel(item.day)}</Text>
                  <Text style={styles.count}>
                    {item.count} {item.count === 1 ? 'entry' : 'entries'}
                  </Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.preview}
                </Text>
              </View>
              <CaretRightIcon size={18} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
