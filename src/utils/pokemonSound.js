const POKE_CRY_BASE = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest';

/**
 * Play Pokémon cry by id (national dex 1–1025 supported by PokeAPI).
 * No-op if id out of range or playback fails (e.g. CORS / 404).
 */
export function playPokemonCry(id) {
  const num = parseInt(id, 10);
  if (Number.isNaN(num) || num < 1 || num > 1025) return;
  const audio = new Audio(`${POKE_CRY_BASE}/${num}.ogg`);
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

/**
 * Play winner cry when result is shown (id of the winning Pokémon).
 */
export function playWinnerCry(winnerId) {
  if (winnerId) playPokemonCry(winnerId);
}
