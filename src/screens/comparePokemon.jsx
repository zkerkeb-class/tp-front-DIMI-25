import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { comparePokemon } from '../utils/typeChart';
import { playPokemonCry, playWinnerCry } from '../utils/pokemonSound';
import './comparePokemon.css';

const API_BASE = 'http://localhost:3000';
const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC',
};

const STAT_KEYS = ['HP', 'Attack', 'Defense', 'SpecialAttack', 'SpecialDefense', 'Speed'];
const STAT_LABELS = { HP: 'PV', Attack: 'Att', Defense: 'Def', SpecialAttack: 'Att.Sp', SpecialDefense: 'Déf.Sp', Speed: 'Vit' };

function StatBar({ label, value, max = 255, color, delay = 0 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="compare-stat-row" style={{ animationDelay: `${delay}ms` }}>
      <span className="compare-stat-label">{STAT_LABELS[label] || label}</span>
      <span className="compare-stat-value">{value}</span>
      <div className="compare-stat-bar-wrap">
        <div className="compare-stat-bar-fill" style={{ width: `${pct}%`, backgroundColor: color, animationDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function CharacterCard({ pokemon, side, isWinner }) {
  const color = TYPE_COLORS[pokemon?.type?.[0]] || '#A8A878';
  return (
    <div className={`compare-char-card ${side} ${isWinner ? 'char-winner' : ''}`} style={{ '--type-color': color }}>
      <div className="compare-char-header">
        <img src={pokemon.image} alt={pokemon.name?.french} className="compare-char-img" />
        <div className="compare-char-title">
          <span className="compare-char-name">{pokemon.name?.french}</span>
          <span className="compare-char-id">#{String(pokemon.id).padStart(3, '0')}</span>
        </div>
        <button type="button" className="compare-cry-btn" onClick={() => playPokemonCry(pokemon.id)} title="Écouter le cri">
          🔊
        </button>
      </div>
      <div className="compare-char-types">
        {(pokemon.type || []).map((t) => (
          <span key={t} className="compare-type-badge" style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</span>
        ))}
      </div>
      <div className="compare-char-stats">
        {STAT_KEYS.map((key, i) => (
          <StatBar key={key} label={key} value={pokemon.base?.[key] ?? 0} color={color} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

export default function ComparePokemon() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pokemonA, setPokemonA] = useState(null);
  const [pokemonB, setPokemonB] = useState(null);
  const [filterA, setFilterA] = useState('');
  const [filterB, setFilterB] = useState('');
  const hasPlayedWinnerSound = useRef(false);

  useEffect(() => {
    fetch(`${API_BASE}/pokemons/list`)
      .then((res) => res.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredList = (filter) =>
    list.filter((p) => (p.name?.french || '').toLowerCase().includes((filter || '').toLowerCase()));

  const listA = filteredList(filterA);
  const listB = filteredList(filterB);

  const result = pokemonA && pokemonB ? comparePokemon(pokemonA, pokemonB) : null;

  useEffect(() => {
    if (!result || result.winner === 'tie' || hasPlayedWinnerSound.current) return;
    const winnerId = result.winner === 'a' ? pokemonA?.id : pokemonB?.id;
    hasPlayedWinnerSound.current = true;
    const t = setTimeout(() => playWinnerCry(winnerId), 800);
    return () => clearTimeout(t);
  }, [result?.winner, pokemonA?.id, pokemonB?.id]);

  useEffect(() => {
    if (!result) hasPlayedWinnerSound.current = false;
  }, [pokemonA?.id, pokemonB?.id]);

  return (
    <div className="compare-container">
      <div className="compare-header">
        <Link to="/" className="back-link">← Retour</Link>
        <h1 className="compare-title">Comparer deux Pokémon</h1>
        <p className="compare-subtitle">Choisis deux Pokémon pour voir leurs caractéristiques et qui aurait l'avantage au combat.</p>
      </div>

      {loading ? (
        <div className="compare-loading">
          <div className="pokeball-loader" />
          <p>Chargement de la liste…</p>
        </div>
      ) : (
        <>
          <div className="compare-pickers">
            <div className="compare-panel picker-a">
              <h2>Pokémon 1</h2>
              <input
                type="text"
                placeholder="Rechercher…"
                value={filterA}
                onChange={(e) => setFilterA(e.target.value)}
                className="compare-search"
              />
              <div className="compare-select-wrap">
                <select
                  value={pokemonA?.id ?? ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    setPokemonA(list.find((p) => p.id === id) || null);
                  }}
                  className="compare-select"
                >
                  <option value="">— Choisir —</option>
                  {listA.map((p) => (
                    <option key={p.id} value={p.id}>#{String(p.id).padStart(3, '0')} {p.name?.french}</option>
                  ))}
                </select>
              </div>
              {pokemonA && (
                <div className="compare-preview" style={{ borderColor: TYPE_COLORS[pokemonA.type?.[0]] || '#A8A878' }}>
                  <img src={pokemonA.image} alt={pokemonA.name?.french} className="compare-preview-img" />
                  <div className="compare-preview-name">{pokemonA.name?.french}</div>
                  <div className="compare-preview-types">
                    {(pokemonA.type || []).map((t) => (
                      <span key={t} className="compare-type-badge" style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="compare-vs">VS</div>

            <div className="compare-panel picker-b">
              <h2>Pokémon 2</h2>
              <input
                type="text"
                placeholder="Rechercher…"
                value={filterB}
                onChange={(e) => setFilterB(e.target.value)}
                className="compare-search"
              />
              <div className="compare-select-wrap">
                <select
                  value={pokemonB?.id ?? ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    setPokemonB(list.find((p) => p.id === id) || null);
                  }}
                  className="compare-select"
                >
                  <option value="">— Choisir —</option>
                  {listB.map((p) => (
                    <option key={p.id} value={p.id}>#{String(p.id).padStart(3, '0')} {p.name?.french}</option>
                  ))}
                </select>
              </div>
              {pokemonB && (
                <div className="compare-preview" style={{ borderColor: TYPE_COLORS[pokemonB.type?.[0]] || '#A8A878' }}>
                  <img src={pokemonB.image} alt={pokemonB.name?.french} className="compare-preview-img" />
                  <div className="compare-preview-name">{pokemonB.name?.french}</div>
                  <div className="compare-preview-types">
                    {(pokemonB.type || []).map((t) => (
                      <span key={t} className="compare-type-badge" style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="compare-result-wrap">
              <div className="compare-battle-flash" aria-hidden />
              <h2 className="compare-section-title compare-section-characteristics">Caractéristiques</h2>
              <div className="compare-characteristics">
                <CharacterCard
                  pokemon={pokemonA}
                  side="a"
                  isWinner={result.winner === 'a'}
                />
                <CharacterCard
                  pokemon={pokemonB}
                  side="b"
                  isWinner={result.winner === 'b'}
                />
              </div>

              <h2 className="compare-section-title compare-section-winner">Gagnant probable</h2>
              <div className="compare-result">
                <div className={`compare-winner winner-${result.winner}`}>
                  {result.winner === 'tie' ? (
                    <span className="winner-label">Égalité</span>
                  ) : (
                    <>
                      <span className="winner-label">Gagnant probable</span>
                      <span className="winner-name">{result.winnerName}</span>
                      <button type="button" className="compare-cry-btn winner-cry" onClick={() => playWinnerCry(result.winner === 'a' ? pokemonA?.id : pokemonB?.id)} title="Réécouter le cri du gagnant">
                        🔊 Réécouter le cri
                      </button>
                    </>
                  )}
                </div>
                <div className="compare-reasons">
                  <h3>Pourquoi ?</h3>
                  <ul>
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
