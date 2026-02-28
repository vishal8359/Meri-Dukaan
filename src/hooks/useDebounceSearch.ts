// src/hooks/useDebounceSearch.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { mockProducts, mockStores } from "../assets/mockData";

export interface SearchResult {
  type: "product" | "store";
  id: string;
  name: string;
  subtitle: string;
  image: string;
  category?: string;
}

/**
 * Custom hook for debounced search across products, services, and stores
 * @param delay - debounce delay in ms (default: 300ms)
 */
export function useDebounceSearch(delay: number = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((text: string) => {
    if (!text.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const lowerQuery = text.toLowerCase();

    // Search products
    const productResults: SearchResult[] = mockProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery),
      )
      .slice(0, 5)
      .map((p) => ({
        type: "product" as const,
        id: p.id,
        name: p.name,
        subtitle: `₹${p.price} • ${p.storeName}`,
        image: p.image,
        category: p.category,
      }));

    // Search stores
    const storeResults: SearchResult[] = mockStores
      .filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.type.toLowerCase().includes(lowerQuery),
      )
      .slice(0, 5)
      .map((s) => ({
        type: "store" as const,
        id: s.id,
        name: s.name,
        subtitle: `${s.type} • ${s.distance} • ⭐ ${s.rating}`,
        image: s.image,
      }));

    setResults([...productResults, ...storeResults].slice(0, 8));
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new debounce timer
    timerRef.current = setTimeout(() => {
      search(query);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, delay, search]);

  // Default suggestions shown before user types
  const defaultSuggestions: SearchResult[] = [
    ...mockStores
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map((s) => ({
        type: "store" as const,
        id: s.id,
        name: s.name,
        subtitle: `${s.type} • ${s.distance} • ⭐ ${s.rating}`,
        image: s.image,
      })),
    ...mockProducts
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((p) => ({
        type: "product" as const,
        id: p.id,
        name: p.name,
        subtitle: `₹${p.price} • ${p.storeName}`,
        image: p.image,
        category: p.category,
      })),
  ];

  return {
    query,
    setQuery,
    results,
    isSearching,
    defaultSuggestions,
    clearSearch: () => {
      setQuery("");
      setResults([]);
    },
  };
}
