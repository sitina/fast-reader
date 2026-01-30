import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {useShareIntent} from '../hooks/useShareIntent';
import {colors, spacing, fontSize} from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SAMPLE_TEXT = `Speed reading is a technique that allows you to read faster while maintaining comprehension.
The RSVP (Rapid Serial Visual Presentation) method displays words one at a time at a fixed focal point,
eliminating the need for eye movement across lines of text. This can significantly increase your reading speed.

By focusing on the ORP (Optimal Recognition Point) - typically about one-third into each word -
your brain can process words more efficiently. The highlighted character helps guide your focus
to this optimal position, making reading feel more natural and effortless.

Try adjusting the speed to find your comfort zone. Most people can comfortably read between
300-500 words per minute with practice, though some can reach 700+ WPM with training.`;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [customText, setCustomText] = useState('');
  const {sharedContent, clearSharedContent} = useShareIntent();

  // Handle shared content
  useEffect(() => {
    if (sharedContent) {
      navigation.navigate('Reader', {
        text: sharedContent.text,
        title: sharedContent.title || 'Shared Content',
      });
      clearSharedContent();
    }
  }, [sharedContent, navigation, clearSharedContent]);

  const handleTrySample = () => {
    navigation.navigate('Reader', {
      text: SAMPLE_TEXT,
      title: 'Sample: Speed Reading Introduction',
    });
  };

  const handleReadCustom = () => {
    if (customText.trim().length === 0) {
      Alert.alert('No Text', 'Please enter some text to read.');
      return;
    }
    navigation.navigate('Reader', {
      text: customText,
      title: 'Custom Text',
    });
    setCustomText('');
  };

  const handleOpenExtension = () => {
    Linking.openURL(
      'https://chromewebstore.google.com/detail/fast-reader',
    ).catch(() => {
      Alert.alert('Error', 'Could not open the link');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>⚡</Text>
          <Text style={styles.heroTitle}>Fast Reader</Text>
          <Text style={styles.heroSubtitle}>
            Speed read any text using RSVP technology
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTrySample}
            activeOpacity={0.7}>
            <Text style={styles.actionIcon}>📖</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Try Sample Text</Text>
              <Text style={styles.actionDescription}>
                Learn about speed reading with a quick demo
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Main', {screen: 'Library'})}
            activeOpacity={0.7}>
            <Text style={styles.actionIcon}>📚</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Open EPUB Book</Text>
              <Text style={styles.actionDescription}>
                Import and read your favorite ebooks
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Custom text input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paste Your Text</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Paste or type text here..."
            placeholderTextColor={colors.textDark}
            multiline
            value={customText}
            onChangeText={setCustomText}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.readButton,
              customText.trim().length === 0 && styles.readButtonDisabled,
            ]}
            onPress={handleReadCustom}
            activeOpacity={0.7}
            disabled={customText.trim().length === 0}>
            <Text style={styles.readButtonText}>Read Now</Text>
          </TouchableOpacity>
        </View>

        {/* Share tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipText}>
            Share any article or text from other apps to Fast Reader using the
            share menu!
          </Text>
        </View>

        {/* Extension link */}
        <TouchableOpacity
          style={styles.extensionLink}
          onPress={handleOpenExtension}
          activeOpacity={0.7}>
          <Text style={styles.extensionText}>
            Also available as a Chrome Extension →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 120,
    marginBottom: spacing.md,
  },
  readButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
  },
  readButtonDisabled: {
    opacity: 0.5,
  },
  readButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  tipTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  extensionLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  extensionText: {
    fontSize: fontSize.sm,
    color: colors.accent,
  },
});
