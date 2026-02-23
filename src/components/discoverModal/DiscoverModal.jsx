import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { playPokemonCry } from '../../utils/pokemonSound';
import './DiscoverModal.css';

const API_BASE = 'http://localhost:3000';
const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC',
};

export default function DiscoverModal({ isOpen, onClose }) {
  const [phase, setPhase] = useState('idle'); // idle | shaking | reveal
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(false);

  const runShake = () => {
    setPhase('shaking');
    setPokemon(null);
    setError(false);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/pokemons/random`);
        if (!res.ok) throw new Error('No pokemon');
        const data = await res.json();
        setPokemon(data);
        setPhase('reveal');
        playPokemonCry(data.id);
      } catch {
        setError(true);
        setPhase('reveal');
      }
    }, 2600);
    return () => clearTimeout(t);
  };

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setPokemon(null);
      setError(false);
      return undefined;
    }
    return runShake();
  }, [isOpen]);

  const handleAgain = () => runShake();

  if (!isOpen) return null;

  const color = pokemon?.type?.[0] ? TYPE_COLORS[pokemon.type[0]] : '#A8A878';

  return (
    <div className="discover-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Découvrir un Pokémon">
      <div className="discover-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="discover-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {phase === 'shaking' && (
          <div className="discover-shake-wrap">
            <div className="discover-pokeball shake" />
            <p className="discover-shake-text">La Poké Ball secoue...</p>
          </div>
        )}

        {phase === 'reveal' && (
          <div className="discover-reveal">
            {error ? (
              <p className="discover-error">Aucun Pokémon trouvé. Réessaie !</p>
            ) : pokemon ? (
              <>
                <div className="discover-reveal-flash" />
                <div className="discover-pokemon-card" style={{ borderColor: color }}>
                  <img src={pokemon.image} alt={pokemon.name?.french} className="discover-pokemon-img" />
                  <h2 className="discover-pokemon-name">{pokemon.name?.french}</h2>
                  <span className="discover-pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
                  <div className="discover-pokemon-types">
                    {(pokemon.type || []).map((t) => (
                      <span key={t} className="discover-type-badge" style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</span>
                    ))}
                  </div>
                  <Link to={`/pokemonDetails/${pokemon.id}`} className="discover-detail-link" onClick={onClose}>
                    Voir la fiche →
                  </Link>
                </div>
              </>
            ) : null}
            <button type="button" className="discover-again-btn" onClick={handleAgain}>
              🎲 Encore une fois
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
