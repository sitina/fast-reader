import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {useEPUBLibrary, Book} from '../hooks/useEPUBLibrary';
import {colors, spacing, fontSize} from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    books,
    isLoading,
    importBook,
    deleteBook,
    getBookChapter,
    loadBooks,
  } = useEPUBLibrary();
  const [importing, setImporting] = useState(false);

  // Refresh library when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks]),
  );

  const handleImportBook = async () => {
    setImporting(true);
    try {
      await importBook();
    } catch (error) {
      if ((error as Error).message !== 'User cancelled') {
        Alert.alert('Import Error', (error as Error).message);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleOpenBook = async (book: Book) => {
    try {
      const chapterIndex = book.lastChapter || 0;
      const chapter = await getBookChapter(book.id, chapterIndex);

      if (!chapter) {
        Alert.alert('Error', 'Could not load chapter');
        return;
      }

      navigation.navigate('Reader', {
        text: chapter.text,
        title: `${book.title} - ${chapter.title}`,
        bookId: book.id,
        chapterIndex,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open book');
    }
  };

  const handleDeleteBook = (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to remove "${book.title}" from your library?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBook(book.id),
        },
      ],
    );
  };

  const renderBook = ({item}: {item: Book}) => {
    const progress = item.totalChapters
      ? Math.round(((item.lastChapter || 0) / item.totalChapters) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => handleOpenBook(item)}
        onLongPress={() => handleDeleteBook(item)}
        activeOpacity={0.7}>
        <View style={styles.bookCover}>
          <Text style={styles.bookEmoji}>📖</Text>
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.author && (
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author}
            </Text>
          )}
          <View style={styles.bookMeta}>
            <Text style={styles.bookChapters}>
              {item.totalChapters} chapters
            </Text>
            {progress > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>No Books Yet</Text>
      <Text style={styles.emptyText}>
        Import EPUB files to start reading at lightning speed
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.importButton, importing && styles.importButtonDisabled]}
          onPress={handleImportBook}
          disabled={importing}
          activeOpacity={0.7}>
          {importing ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <Text style={styles.importIcon}>+</Text>
              <Text style={styles.importText}>Import EPUB</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Text style={styles.hint}>Long press a book to delete</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm + 4,
    borderRadius: 8,
    gap: spacing.sm,
  },
  importButtonDisabled: {
    opacity: 0.7,
  },
  importIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  importText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookCover: {
    width: 60,
    height: 80,
    backgroundColor: colors.buttonBackground,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookEmoji: {
    fontSize: 28,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookChapters: {
    fontSize: fontSize.xs,
    color: colors.textDark,
  },
  progressBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textDark,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
