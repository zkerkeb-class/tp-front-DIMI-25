/**
 * Pokémon type effectiveness (attacker type → defender type → multiplier).
 * 0 = immune, 0.5 = resisted, 1 = normal, 2 = super effective.
 * Dual-type defenders: multiply multipliers for each defender type.
 */
const EFFECT = {
  super: 2,
  normal: 1,
  resisted: 0.5,
  immune: 0,
};

const TYPE_CHART = {
  Normal: { Rock: EFFECT.resisted, Ghost: EFFECT.immune, Steel: EFFECT.resisted },
  Fire: { Fire: EFFECT.resisted, Water: EFFECT.resisted, Grass: EFFECT.super, Ice: EFFECT.super, Bug: EFFECT.super, Rock: EFFECT.resisted, Dragon: EFFECT.resisted, Steel: EFFECT.super },
  Water: { Fire: EFFECT.super, Water: EFFECT.resisted, Grass: EFFECT.resisted, Ground: EFFECT.super, Rock: EFFECT.super, Dragon: EFFECT.resisted },
  Electric: { Water: EFFECT.super, Electric: EFFECT.resisted, Grass: EFFECT.resisted, Ground: EFFECT.immune, Flying: EFFECT.super, Dragon: EFFECT.resisted },
  Grass: { Fire: EFFECT.resisted, Water: EFFECT.super, Grass: EFFECT.resisted, Poison: EFFECT.resisted, Ground: EFFECT.super, Flying: EFFECT.resisted, Bug: EFFECT.resisted, Rock: EFFECT.super, Dragon: EFFECT.resisted, Steel: EFFECT.resisted },
  Ice: { Fire: EFFECT.resisted, Water: EFFECT.resisted, Grass: EFFECT.super, Ice: EFFECT.resisted, Ground: EFFECT.super, Flying: EFFECT.super, Dragon: EFFECT.super, Steel: EFFECT.resisted },
  Fighting: { Normal: EFFECT.super, Ice: EFFECT.super, Poison: EFFECT.resisted, Flying: EFFECT.resisted, Psychic: EFFECT.resisted, Bug: EFFECT.resisted, Rock: EFFECT.super, Ghost: EFFECT.immune, Dark: EFFECT.super, Steel: EFFECT.super, Fairy: EFFECT.resisted },
  Poison: { Grass: EFFECT.super, Poison: EFFECT.resisted, Ground: EFFECT.resisted, Rock: EFFECT.resisted, Ghost: EFFECT.resisted, Steel: EFFECT.immune, Fairy: EFFECT.super },
  Ground: { Fire: EFFECT.super, Electric: EFFECT.super, Grass: EFFECT.resisted, Poison: EFFECT.super, Flying: EFFECT.immune, Bug: EFFECT.resisted, Rock: EFFECT.super, Steel: EFFECT.super },
  Flying: { Electric: EFFECT.resisted, Grass: EFFECT.super, Fighting: EFFECT.super, Bug: EFFECT.super, Rock: EFFECT.resisted, Steel: EFFECT.resisted },
  Psychic: { Fighting: EFFECT.super, Poison: EFFECT.super, Psychic: EFFECT.resisted, Dark: EFFECT.immune, Steel: EFFECT.resisted },
  Bug: { Fire: EFFECT.resisted, Grass: EFFECT.super, Fighting: EFFECT.resisted, Poison: EFFECT.resisted, Flying: EFFECT.resisted, Psychic: EFFECT.super, Ghost: EFFECT.resisted, Dark: EFFECT.super, Steel: EFFECT.resisted, Fairy: EFFECT.resisted },
  Rock: { Fire: EFFECT.super, Ice: EFFECT.super, Fighting: EFFECT.resisted, Ground: EFFECT.resisted, Flying: EFFECT.super, Bug: EFFECT.super, Steel: EFFECT.resisted },
  Ghost: { Normal: EFFECT.immune, Psychic: EFFECT.super, Ghost: EFFECT.super, Dark: EFFECT.resisted },
  Dragon: { Dragon: EFFECT.super, Steel: EFFECT.resisted, Fairy: EFFECT.immune },
  Dark: { Fighting: EFFECT.resisted, Psychic: EFFECT.super, Ghost: EFFECT.super, Dark: EFFECT.resisted, Fairy: EFFECT.resisted },
  Steel: { Fire: EFFECT.resisted, Water: EFFECT.resisted, Electric: EFFECT.resisted, Ice: EFFECT.super, Rock: EFFECT.super, Steel: EFFECT.resisted, Fairy: EFFECT.super },
  Fairy: { Fire: EFFECT.resisted, Fighting: EFFECT.super, Poison: EFFECT.resisted, Dragon: EFFECT.super, Dark: EFFECT.super, Steel: EFFECT.resisted },
};

/**
 * Get damage multiplier when a move of type attackType hits a defender with defenderTypes.
 * Dual types: multiply the multiplier for each defender type.
 */
export function getTypeMultiplier(attackType, defenderTypes) {
  if (!defenderTypes || defenderTypes.length === 0) return 1;
  let mult = 1;
  for (const def of defenderTypes) {
    const m = (TYPE_CHART[attackType] && TYPE_CHART[attackType][def]) ?? 1;
    mult *= m;
  }
  return mult;
}

/**
 * Best damage multiplier when attacker (with their types) hits defender.
 * Uses the attacker's type that gives the highest multiplier (best "move").
 */
export function getOffensiveScore(attackerTypes, defenderTypes) {
  if (!attackerTypes || attackerTypes.length === 0) return 1;
  let best = 0;
  for (const atk of attackerTypes) {
    const m = getTypeMultiplier(atk, defenderTypes);
    if (m > best) best = m;
  }
  return best;
}

/**
 * Simple "power" score from base stats (for tie-breaking / overall strength).
 * Offense + speed bias vs defense + bulk.
 */
export function getStatScore(base) {
  if (!base) return 0;
  const off = (base.Attack || 0) + (base.SpecialAttack || 0);
  const def = (base.Defense || 0) + (base.SpecialDefense || 0);
  const hp = base.HP || 0;
  const speed = base.Speed || 0;
  return off * 1.2 + def * 0.9 + hp * 0.5 + speed * 1.1;
}

/**
 * Compare two Pokémon and return winner + reasons.
 * @param {Object} a - Pokémon A { name, type, base }
 * @param {Object} b - Pokémon B
 * @returns { { winner: 'a'|'b'|'tie', winnerName: string, reasons: string[] } }
 */
export function comparePokemon(a, b) {
  const reasons = [];
  const nameA = a?.name?.french || "Pokémon A";
  const nameB = b?.name?.french || "Pokémon B";
  const typesA = a?.type || [];
  const typesB = b?.type || [];

  const aVsB = getOffensiveScore(typesA, typesB);
  const bVsA = getOffensiveScore(typesB, typesA);

  if (aVsB > 1 && bVsA <= 1) {
    reasons.push(`${nameA} a un avantage de type sur ${nameB} (x${aVsB}) alors que ${nameB} n'est pas très efficace.`);
  } else if (bVsA > 1 && aVsB <= 1) {
    reasons.push(`${nameB} a un avantage de type sur ${nameA} (x${bVsA}) alors que ${nameA} n'est pas très efficace.`);
  } else if (aVsB > 1 && bVsA > 1) {
    const better = aVsB >= bVsA ? nameA : nameB;
    const mult = aVsB >= bVsA ? aVsB : bVsA;
    reasons.push(`Les deux ont des avantages de type ; ${better} inflige des coups plus douloureux (x${mult}).`);
  } else if (aVsB < 1 || bVsA < 1) {
    if (aVsB === 0) reasons.push(`${nameB} est immunisé aux types de ${nameA}.`);
    if (bVsA === 0) reasons.push(`${nameA} est immunisé aux types de ${nameB}.`);
    if (aVsB > 0 && aVsB < 1) reasons.push(`${nameB} résiste bien aux types de ${nameA}.`);
    if (bVsA > 0 && bVsA < 1) reasons.push(`${nameA} résiste bien aux types de ${nameB}.`);
  }

  const scoreA = getStatScore(a?.base);
  const scoreB = getStatScore(b?.base);
  const diff = Math.abs(scoreA - scoreB);
  if (diff > 50) {
    const stronger = scoreA > scoreB ? nameA : nameB;
    reasons.push(`${stronger} a des statistiques globales supérieures (puissance, défense, vitesse).`);
  }

  const speedA = a?.base?.Speed ?? 0;
  const speedB = b?.base?.Speed ?? 0;
  if (Math.abs(speedA - speedB) >= 20) {
    const faster = speedA > speedB ? nameA : nameB;
    reasons.push(`${faster} est plus rapide et peut frapper en premier.`);
  }

  const totalA = (aVsB * (scoreA + 1));
  const totalB = (bVsA * (scoreB + 1));

  let winner = "tie";
  let winnerName = "Égalité";
  if (totalA > totalB * 1.05) {
    winner = "a";
    winnerName = nameA;
  } else if (totalB > totalA * 1.05) {
    winner = "b";
    winnerName = nameB;
  } else {
    reasons.push("Les deux sont très proches en puissance et en types ; le combat pourrait aller dans les deux sens.");
  }

  return { winner, winnerName, reasons };
}
