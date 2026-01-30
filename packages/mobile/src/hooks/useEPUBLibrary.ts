import {useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {parseEPUB, EPUBMetadata, EPUBChapter} from '../services/epubParser';

const STORAGE_KEYS = {
  BOOKS: '@fast-reader/books',
  BOOK_DATA: '@fast-reader/book-data/',
  PROGRESS: '@fast-reader/progress/',
};

export interface Book {
  id: string;
  title: string;
  author?: string;
  totalChapters: number;
  lastChapter?: number;
  lastWordIndex?: number;
  addedAt: number;
  filePath?: string;
}

interface BookData {
  metadata: EPUBMetadata;
  chapters: EPUBChapter[];
}

export function useEPUBLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const booksJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      if (booksJson) {
        const loadedBooks: Book[] = JSON.parse(booksJson);
        // Load progress for each book
        const booksWithProgress = await Promise.all(
          loadedBooks.map(async book => {
            const progressJson = await AsyncStorage.getItem(
              STORAGE_KEYS.PROGRESS + book.id,
            );
            if (progressJson) {
              const progress = JSON.parse(progressJson);
              return {...book, ...progress};
            }
            return book;
          }),
        );
        setBooks(booksWithProgress.sort((a, b) => b.addedAt - a.addedAt));
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importBook = useCallback(async () => {
    try {
      // Dynamic import to avoid issues on platforms without the module
      const DocumentPicker = await import('react-native-document-picker');
      const RNFS = await import('react-native-fs');

      const result = await DocumentPicker.default.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const file = result[0];

      if (!file.name?.toLowerCase().endsWith('.epub')) {
        throw new Error('Please select an EPUB file');
      }

      // Read file content
      const base64Content = await RNFS.default.readFile(file.uri, 'base64');
      const binaryContent = atob(base64Content);

      // Parse EPUB
      const {metadata, chapters} = await parseEPUB(binaryContent);

      // Generate book ID
      const bookId = `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create book entry
      const newBook: Book = {
        id: bookId,
        title: metadata.title || file.name || 'Unknown Book',
        author: metadata.author,
        totalChapters: chapters.length,
        addedAt: Date.now(),
      };

      // Store book data
      const bookData: BookData = {metadata, chapters};
      await AsyncStorage.setItem(
        STORAGE_KEYS.BOOK_DATA + bookId,
        JSON.stringify(bookData),
      );

      // Update books list
      const currentBooks = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      const booksList: Book[] = currentBooks ? JSON.parse(currentBooks) : [];
      booksList.unshift(newBook);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(booksList));

      setBooks(prev => [newBook, ...prev]);

      return newBook;
    } catch (error) {
      if ((error as any).code === 'DOCUMENT_PICKER_CANCELED') {
        throw new Error('User cancelled');
      }
      throw error;
    }
  }, []);

  const deleteBook = useCallback(async (bookId: string) => {
    try {
      // Remove book data
      await AsyncStorage.removeItem(STORAGE_KEYS.BOOK_DATA + bookId);
      await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS + bookId);

      // Update books list
      const currentBooks = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      if (currentBooks) {
        const booksList: Book[] = JSON.parse(currentBooks);
        const updatedList = booksList.filter(b => b.id !== bookId);
        await AsyncStorage.setItem(
          STORAGE_KEYS.BOOKS,
          JSON.stringify(updatedList),
        );
      }

      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (error) {
      console.error('Failed to delete book:', error);
      throw error;
    }
  }, []);

  const getBookChapter = useCallback(
    async (
      bookId: string,
      chapterIndex: number,
    ): Promise<EPUBChapter | null> => {
      try {
        const bookDataJson = await AsyncStorage.getItem(
          STORAGE_KEYS.BOOK_DATA + bookId,
        );
        if (!bookDataJson) return null;

        const bookData: BookData = JSON.parse(bookDataJson);
        return bookData.chapters[chapterIndex] || null;
      } catch (error) {
        console.error('Failed to get chapter:', error);
        return null;
      }
    },
    [],
  );

  const getBookChapters = useCallback(
    async (bookId: string): Promise<EPUBChapter[]> => {
      try {
        const bookDataJson = await AsyncStorage.getItem(
          STORAGE_KEYS.BOOK_DATA + bookId,
        );
        if (!bookDataJson) return [];

        const bookData: BookData = JSON.parse(bookDataJson);
        return bookData.chapters;
      } catch (error) {
        console.error('Failed to get chapters:', error);
        return [];
      }
    },
    [],
  );

  const saveProgress = useCallback(
    async (bookId: string, chapterIndex: number, wordIndex: number) => {
      try {
        const progress = {
          lastChapter: chapterIndex,
          lastWordIndex: wordIndex,
        };
        await AsyncStorage.setItem(
          STORAGE_KEYS.PROGRESS + bookId,
          JSON.stringify(progress),
        );

        setBooks(prev =>
          prev.map(book =>
            book.id === bookId ? {...book, ...progress} : book,
          ),
        );
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    },
    [],
  );

  return {
    books,
    isLoading,
    loadBooks,
    importBook,
    deleteBook,
    getBookChapter,
    getBookChapters,
    saveProgress,
  };
}
