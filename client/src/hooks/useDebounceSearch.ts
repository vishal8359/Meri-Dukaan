// src/hooks/useDebounceSearch.ts
import { useCallback, useEffect, useRef, useState } from "react";

import * as storeApi from "../api/stores";

export interface SearchResult {
  type: "product" | "service" | "store";
  id: string;
  name: string;
  subtitle: string;
  image: string;
  category?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=300";

export function useDebounceSearch(delay: number = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [defaultSuggestions, setDefaultSuggestions] = useState<SearchResult[]>(
    [],
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const mapStoreResult = (store: any): SearchResult => {
    const firstImage = Array.isArray(store?.images)
      ? store.images[0]?.image_url
      : undefined;

    return {
      type: "store",
      id: String(store?.id ?? ""),
      name: String(store?.store_name ?? "Store"),
      subtitle: `${store?.category ?? "General"} • ⭐ ${Number(store?.rating ?? 0).toFixed(1)}`,
      image: firstImage || FALLBACK_IMAGE,
      category: String(store?.category ?? "General"),
    };
  };

  const search = useCallback(async (text: string) => {
    const requestId = ++requestIdRef.current;

    if (!text.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const lowerQuery = text.trim().toLowerCase();

      const storeRes = await storeApi.getStores({
        search: lowerQuery,
        page: 1,
        limit: 10,
      });

      const stores = Array.isArray(storeRes?.stores)
        ? (storeRes.stores as any[])
        : [];

      const storeResults: SearchResult[] = stores.slice(0, 5).map(mapStoreResult);

      const detailFetches = stores.slice(0, 4).map(async (store) => {
        const storeId = String(store?.id ?? "");
        const [productsRes, servicesRes] = await Promise.allSettled([
          storeApi.getStoreProducts(storeId),
          storeApi.getStoreServices(storeId),
        ]);

        const products =
          productsRes.status === "fulfilled" &&
          Array.isArray(productsRes.value?.products)
            ? (productsRes.value.products as any[])
            : [];

        const services =
          servicesRes.status === "fulfilled" &&
          Array.isArray(servicesRes.value?.services)
            ? (servicesRes.value.services as any[])
            : [];

        const mappedProducts: SearchResult[] = products
          .filter((p) => String(p?.name ?? "").toLowerCase().includes(lowerQuery))
          .slice(0, 2)
          .map((p) => ({
            type: "product" as const,
            id: String(p?.id ?? ""),
            name: String(p?.name ?? "Product"),
            subtitle: `₹${Number(p?.offer_price ?? p?.real_price ?? 0)} • ${store?.store_name ?? "Store"}`,
            image: Array.isArray(p?.images)
              ? p.images[0]?.image_url || FALLBACK_IMAGE
              : FALLBACK_IMAGE,
            category: String(p?.type ?? "General"),
          }));

        const mappedServices: SearchResult[] = services
          .filter(
            (s) =>
              String(s?.name ?? "").toLowerCase().includes(lowerQuery) ||
              String(s?.description ?? "").toLowerCase().includes(lowerQuery),
          )
          .slice(0, 2)
          .map((s) => ({
            type: "service" as const,
            id: String(s?.id ?? ""),
            name: String(s?.name ?? "Service"),
            subtitle: `${store?.store_name ?? "Store"} • ${s?.timings ?? ""}`,
            image: FALLBACK_IMAGE,
            category: String(s?.type ?? "Service"),
          }));

        return [...mappedProducts, ...mappedServices];
      });

      const detailed = (await Promise.all(detailFetches)).flat();
      const combined = [...storeResults, ...detailed].slice(0, 12);

      if (requestId === requestIdRef.current) {
        setResults(combined);
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setResults([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void search(query);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, delay, search]);

  useEffect(() => {
    (async () => {
      try {
        const storesRes = await storeApi.getStores({ page: 1, limit: 6 });
        const stores = Array.isArray(storesRes?.stores)
          ? (storesRes.stores as any[])
          : [];

        const suggestions = stores
          .sort((a, b) => Number(b?.rating ?? 0) - Number(a?.rating ?? 0))
          .slice(0, 6)
          .map(mapStoreResult);

        setDefaultSuggestions(suggestions);
      } catch {
        setDefaultSuggestions([]);
      }
    })();
  }, []);

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
