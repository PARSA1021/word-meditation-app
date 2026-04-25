// context/BookmarkContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Word } from "@/lib/types/word";

interface BookmarkContextType {
  bookmarks: Word[];
  addBookmark: (word: Word) => void;
  removeBookmark: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  toggleBookmark: (word: Word) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Word[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("truepath_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("truepath_bookmarks", JSON.stringify(bookmarks));
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = (word: Word) => {
    if (!bookmarks.find((b) => b.id === word.id)) {
      setBookmarks((prev) => [...prev, word]);
    }
  };

  const removeBookmark = (id: number) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const isBookmarked = (id: number) => {
    return bookmarks.some((b) => b.id === id);
  };

  const toggleBookmark = (word: Word) => {
    if (isBookmarked(word.id)) {
      removeBookmark(word.id);
    } else {
      addBookmark(word);
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
