import { Link } from "react-router";
import { useFavoris } from "../../context/FavorisContext";
import './index.css';

const PokeCard = ({ pokemon }) => {
    const { isFavorite, toggleFavoris } = useFavoris();
    const typeColors = {
        Normal: '#A8A878',
        Fire: '#F08030',
        Water: '#6890F0',
        Electric: '#F8D030',
        Grass: '#78C850',
        Ice: '#98D8D8',
        Fighting: '#C03028',
        Poison: '#A040A0',
        Ground: '#E0C068',
        Flying: '#A890F0',
        Psychic: '#F85888',
        Bug: '#A8B820',
        Rock: '#B8A038',
        Ghost: '#705898',
        Dragon: '#7038F8',
        Dark: '#705848',
        Steel: '#B8B8D0',
        Fairy: '#EE99AC'
    };

    const primaryType = pokemon.type?.[0];
    const cardColor = typeColors[primaryType] || '#A8A878';
    const fav = isFavorite(pokemon.id);

    const handleFavorisClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavoris(pokemon.id);
    };

    return (
        <Link to={`/pokemonDetails/${pokemon.id}`} className="card-link">
            <div className="pokemon-card" style={{ borderColor: cardColor }}>
                <button
                    type="button"
                    className={`favoris-btn ${fav ? 'is-favorite' : ''}`}
                    onClick={handleFavorisClick}
                    aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    <span className="heart-icon">{fav ? '❤️' : '🤍'}</span>
                </button>
                <div className="card-header" style={{ background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)` }}>
                    <h3 className="pokemon-name">{pokemon.name?.french}</h3>
                    <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
                </div>

                <div className="card-image-container">
                    <img 
                        src={pokemon.image} 
                        alt={pokemon.name?.french}
                        className="pokemon-image"
                    />
                </div>

                <div className="card-body">
                    <div className="types-container">
                        {(pokemon.type || []).map((type) => (
                            <span 
                                key={type} 
                                className="type-badge"
                                style={{ backgroundColor: typeColors[type] || '#A8A878' }}
                            >
                                {type}
                            </span>
                        ))}
                    </div>

                    <div className="stats-preview">
                        <div className="stat-item">
                            <span className="stat-label">HP</span>
                            <span className="stat-value">{pokemon.base?.HP}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">ATK</span>
                            <span className="stat-value">{pokemon.base?.Attack}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">DEF</span>
                            <span className="stat-value">{pokemon.base?.Defense}</span>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <span className="view-details">Voir les détails →</span>
                </div>
            </div>
        </Link>
    );
};

export default PokeCard;
