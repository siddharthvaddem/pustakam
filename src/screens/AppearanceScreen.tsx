import { router } from 'expo-router';
import { CaretLeftIcon, CheckIcon } from 'phosphor-react-native';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card/Card';
import { Orb } from '../components/Orb/Orb';
import { TopBar } from '../components/TopBar/TopBar';
import { setSetting } from '../features/settings/repository';
import { useSetting } from '../features/settings/useSetting';
import { ACCENTS, type AccentName, useTheme } from '../theme';
import { useStyles } from './AppearanceScreen.styles';

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export function AppearanceScreen() {
  const styles = useStyles();
  const { colors, accentName } = useTheme();
  const theme = useSetting('theme');
  const hapticsOn = useSetting('haptics') === 'on';
  const level = useSharedValue(0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon={CaretLeftIcon}
        accessibilityLabel="Back"
        onPress={() => router.back()}
        title="Appearance"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.preview} pointerEvents="none">
          <Orb phase="ready" level={level} size={140} onPress={() => {}} />
        </View>

        <Text style={styles.sectionLabel}>theme</Text>
        <View style={styles.segments} accessibilityRole="radiogroup">
          {THEMES.map((option) => {
            const selected = theme === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSetting('theme', option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.segment, selected && styles.segmentSelected]}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>colour</Text>
        <View style={styles.swatches} accessibilityRole="radiogroup">
          {(Object.keys(ACCENTS) as AccentName[]).map((name) => {
            const selected = name === accentName;
            const { orb, label } = ACCENTS[name];
            return (
              <Pressable
                key={name}
                onPress={() => setSetting('accent', name)}
                accessibilityRole="radio"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                style={styles.swatch}
              >
                <View
                  style={[
                    styles.swatchDot,
                    { backgroundColor: orb.lit, borderColor: selected ? colors.text : orb.rim },
                  ]}
                >
                  {selected && <CheckIcon size={18} weight="bold" color={orb.sheen} />}
                </View>
                <Text style={[styles.swatchLabel, selected && styles.swatchLabelSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Haptics</Text>
            <Switch
              value={hapticsOn}
              onValueChange={(on) => setSetting('haptics', on ? 'on' : 'off')}
              trackColor={{ true: colors.accent, false: colors.divider }}
              accessibilityLabel="Haptics"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
