import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useFavoris } from '../context/FavorisContext';
import PokeCard from '../components/pokeCard';
import './favoris.css';

const API_BASE = 'http://localhost:3000';

export default function Favoris() {
  const { favorisIds } = useFavoris();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorisIds.length === 0) {
      setList([]);
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/pokemons/list`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setList(arr.filter((p) => favorisIds.includes(p.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [favorisIds]);

  return (
    <div className="favoris-container">
      <div className="favoris-header">
        <Link to="/" className="back-link">← Retour</Link>
        <h1 className="favoris-title">Mes favoris</h1>
        <p className="favoris-subtitle">
          {favorisIds.length === 0
            ? 'Aucun Pokémon en favori. Clique sur le cœur sur une carte pour en ajouter !'
            : `${favorisIds.length} Pokémon dans ta collection`}
        </p>
      </div>

      {loading ? (
        <div className="favoris-loading">
          <div className="pokeball-loader" />
          <p>Chargement…</p>
        </div>
      ) : list.length === 0 ? (
        <div className="favoris-empty">
          <div className="favoris-empty-icon">🤍</div>
          <p>Ta liste de favoris est vide</p>
          <Link to="/" className="favoris-empty-btn">Explorer le Pokédex</Link>
        </div>
      ) : (
        <div className="favoris-grid">
          {list.map((pokemon) => (
            <PokeCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}
