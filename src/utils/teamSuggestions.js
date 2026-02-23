/**
 * Types that are super effective against the given defender types.
 */
const WEAKNESS_MAP = {
  Normal: ['Fighting'],
  Fire: ['Water', 'Ground', 'Rock'],
  Water: ['Electric', 'Grass'],
  Electric: ['Ground'],
  Grass: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
  Ice: ['Fire', 'Fighting', 'Rock', 'Steel'],
  Fighting: ['Flying', 'Psychic', 'Fairy'],
  Poison: ['Ground', 'Psychic'],
  Ground: ['Water', 'Grass', 'Ice'],
  Flying: ['Electric', 'Ice', 'Rock'],
  Psychic: ['Bug', 'Ghost', 'Dark'],
  Bug: ['Fire', 'Flying', 'Rock'],
  Rock: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
  Ghost: ['Ghost', 'Dark'],
  Dragon: ['Ice', 'Dragon', 'Fairy'],
  Dark: ['Fighting', 'Bug', 'Fairy'],
  Steel: ['Fire', 'Fighting', 'Ground'],
  Fairy: ['Poison', 'Steel'],
};

/** Defender types that resist this attack type (take 0.5x or 0x). */
const RESISTS_ATTACK = {
  Normal: ['Rock', 'Ghost', 'Steel'],
  Fire: ['Fire', 'Water', 'Rock', 'Dragon'],
  Water: ['Water', 'Grass', 'Dragon'],
  Electric: ['Electric', 'Grass', 'Dragon'],
  Grass: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
  Ice: ['Fire', 'Water', 'Ice', 'Steel'],
  Fighting: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
  Poison: ['Poison', 'Ground', 'Rock', 'Ghost'],
  Ground: ['Grass', 'Bug'],
  Flying: ['Electric', 'Rock', 'Steel'],
  Psychic: ['Psychic', 'Steel'],
  Bug: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
  Rock: ['Fighting', 'Ground', 'Steel'],
  Ghost: ['Dark'],
  Dragon: ['Steel'],
  Dark: ['Fighting', 'Dark', 'Fairy'],
  Steel: ['Fire', 'Water', 'Electric', 'Steel'],
  Fairy: ['Fire', 'Poison', 'Steel'],
};

/**
 * Get types that hit the team super effectively (team weaknesses).
 */
export function getTeamWeaknesses(teamPokemons) {
  const weak = new Set();
  for (const p of teamPokemons) {
    for (const t of p.type || []) {
      (WEAKNESS_MAP[t] || []).forEach((w) => weak.add(w));
    }
  }
  return [...weak];
}

/**
 * Get all types currently in the team (for coverage).
 */
export function getTeamTypes(teamPokemons) {
  const set = new Set();
  for (const p of teamPokemons) {
    (p.type || []).forEach((t) => set.add(t));
  }
  return [...set];
}

/**
 * Score how well a candidate Pokémon complements the team:
 * - Resists team weaknesses (good)
 * - Covers types we don't have (diversity)
 * - High stats where team is low (balance)
 */
export function getComplementScore(candidate, teamPokemons, allTypes) {
  let score = 0;
  const teamTypes = getTeamTypes(teamPokemons);
  const weaknesses = getTeamWeaknesses(teamPokemons);
  const candTypes = candidate.type || [];

  // Resists a team weakness: +2 if candidate has a type that resists that attack
  for (const w of weaknesses) {
    const resists = RESISTS_ATTACK[w] || [];
    if (candTypes.some((t) => resists.includes(t))) score += 2;
  }
  // Type diversity: +1.5 for each new type the candidate adds
  for (const t of candTypes) {
    if (!teamTypes.includes(t)) score += 1.5;
  }
  // Stat balance: if team is low on speed, candidate with high speed gets +1
  const teamMaxSpeed = Math.max(...teamPokemons.map((p) => p.base?.Speed || 0), 0);
  if (teamMaxSpeed < 100 && (candidate.base?.Speed || 0) >= 100) score += 1;
  const teamMaxAtk = Math.max(...teamPokemons.map((p) => (p.base?.Attack || 0) + (p.base?.SpecialAttack || 0)), 0);
  if (teamMaxAtk < 200 && ((candidate.base?.Attack || 0) + (candidate.base?.SpecialAttack || 0)) >= 180) score += 1;
  const teamMaxDef = Math.max(...teamPokemons.map((p) => (p.base?.Defense || 0) + (p.base?.SpecialDefense || 0)), 0);
  if (teamMaxDef < 200 && ((candidate.base?.Defense || 0) + (candidate.base?.SpecialDefense || 0)) >= 180) score += 1;

  return score;
}

/**
 * Suggest Pokémon that complement the current team (from a pool).
 * Returns sorted by complement score descending.
 */
export function suggestPokemonForTeam(teamPokemons, pool, maxSuggestions = 6) {
  if (!teamPokemons.length) {
    return pool.slice(0, maxSuggestions).map((p) => ({ pokemon: p, score: 1, reason: 'Premier Pokémon de l\'équipe' }));
  }
  const teamIds = new Set(teamPokemons.map((p) => p.id));
  const candidates = pool.filter((p) => !teamIds.has(p.id));
  const allTypes = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
  const scored = candidates.map((p) => ({
    pokemon: p,
    score: getComplementScore(p, teamPokemons, allTypes),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxSuggestions).map((s) => ({
    ...s,
    reason: s.score >= 2 ? 'Complète bien l\'équipe (types ou stats)' : 'Peut renforcer l\'équipe',
  }));
}
