import React from 'react';
import {View, Text, StyleSheet, Switch, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {useSettings} from '../hooks/useSettings';
import {colors, spacing, fontSize} from '../theme';

export default function SettingsScreen() {
  const {settings, updateWPM, updateSmartPauses} = useSettings();

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://github.com/AceCentre/fast-reader/blob/main/PRIVACY_POLICY.md');
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/AceCentre/fast-reader');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Reading Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Settings</Text>

          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Default Speed</Text>
              <Text style={styles.settingValue}>{settings.wpm} WPM</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={800}
              step={25}
              value={settings.wpm}
              onValueChange={updateWPM}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.buttonBackground}
              thumbTintColor={colors.accent}
            />
            <Text style={styles.settingHint}>
              New reading sessions will start at this speed
            </Text>
          </View>

          <View style={styles.setting}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Smart Pauses</Text>
                <Text style={styles.settingDescription}>
                  Automatically pause longer on punctuation and long words for
                  better comprehension
                </Text>
              </View>
              <Switch
                value={settings.smartPauses}
                onValueChange={updateSmartPauses}
                trackColor={{false: colors.buttonBackground, true: colors.accent}}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text
              style={[styles.aboutLabel, styles.link]}
              onPress={handleOpenGitHub}>
              View on GitHub
            </Text>
          </View>

          <View style={styles.aboutItem}>
            <Text
              style={[styles.aboutLabel, styles.link]}
              onPress={handleOpenPrivacyPolicy}>
              Privacy Policy
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How RSVP Works</Text>
          <Text style={styles.infoText}>
            RSVP (Rapid Serial Visual Presentation) displays words one at a time
            at a fixed point. The{' '}
            <Text style={styles.highlight}>highlighted character</Text> marks
            the ORP (Optimal Recognition Point) - the best spot for your eyes
            to focus for fastest recognition.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with ⚡ for speed readers everywhere
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  setting: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.accent,
  },
  slider: {
    height: 40,
    marginHorizontal: -spacing.xs,
  },
  settingHint: {
    fontSize: fontSize.xs,
    color: colors.textDark,
    marginTop: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  aboutValue: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  link: {
    color: colors.accent,
  },
  infoBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  highlight: {
    color: colors.accent,
    fontWeight: '600',
  },
  footer: {
    fontSize: fontSize.xs,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
