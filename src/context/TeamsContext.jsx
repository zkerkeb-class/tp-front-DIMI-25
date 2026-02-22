import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pokemon-teams';

function loadTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveTeams(teams) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch (_) {}
}

const MAX_POKEMON_PER_TEAM = 6;

export function TeamsProvider({ children }) {
  const [teams, setTeams] = useState(loadTeams);

  useEffect(() => {
    saveTeams(teams);
  }, [teams]);

  const addTeam = useCallback((name) => {
    const id = `team-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setTeams((prev) => [...prev, { id, name: name || 'Nouvelle équipe', pokemonIds: [] }]);
    return id;
  }, []);

  const removeTeam = useCallback((teamId) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }, []);

  const updateTeamName = useCallback((teamId, name) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, name } : t)));
  }, []);

  const addPokemonToTeam = useCallback((teamId, pokemonId) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        if ((t.pokemonIds || []).length >= MAX_POKEMON_PER_TEAM) return t;
        if ((t.pokemonIds || []).includes(pokemonId)) return t;
        return { ...t, pokemonIds: [...(t.pokemonIds || []), pokemonId] };
      })
    );
  }, []);

  const removePokemonFromTeam = useCallback((teamId, pokemonId) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, pokemonIds: (t.pokemonIds || []).filter((id) => id !== pokemonId) } : t
      )
    );
  }, []);

  const value = {
    teams,
    addTeam,
    removeTeam,
    updateTeamName,
    addPokemonToTeam,
    removePokemonFromTeam,
    MAX_POKEMON_PER_TEAM,
  };
  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}

const TeamsContext = createContext(null);

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error('useTeams must be used within TeamsProvider');
  return ctx;
}
