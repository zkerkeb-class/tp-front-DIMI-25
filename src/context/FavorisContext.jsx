import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pokemon-favoris';
const FavorisContext = createContext(null);

function loadFavoris() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveFavoris(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (_) {}
}

export function FavorisProvider({ children }) {
  const [ids, setIds] = useState(loadFavoris);

  useEffect(() => {
    saveFavoris(ids);
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const num = Number(id);
      if (prev.includes(num)) return prev.filter((x) => x !== num);
      return [...prev, num];
    });
  }, []);

  const isFavorite = useCallback((id) => ids.includes(Number(id)), [ids]);

  const value = { favorisIds: ids, toggleFavoris: toggle, isFavorite, count: ids.length };
  return <FavorisContext.Provider value={value}>{children}</FavorisContext.Provider>;
}

export function useFavoris() {
  const ctx = useContext(FavorisContext);
  if (!ctx) throw new Error('useFavoris must be used within FavorisProvider');
  return ctx;
}
