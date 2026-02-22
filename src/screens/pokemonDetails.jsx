import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useFavoris } from '../context/FavorisContext';
import { useTeams } from '../context/TeamsContext';
import './pokemonDetails.css';

const PokemonDetails = () => { 
    const { url } = useParams(); 
    const navigate = useNavigate();
    const { isFavorite, toggleFavoris } = useFavoris();
    const { teams, addPokemonToTeam, MAX_POKEMON_PER_TEAM } = useTeams();
    
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        fetch(`http://localhost:3000/pokemons/${url}`)
            .then(response => response.json())
            .then(data => {
                setPokemon(data);
                setEditedData({
                    name: { ...data.name },
                    type: [...data.type],
                    base: { ...data.base }
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Erreur:', error);
                setLoading(false);
            });
    }, [url]);

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${pokemon.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData),
            });

            if (response.ok) {
                alert('✅ Pokémon modifié avec succès!');
                setIsEditing(false);
                window.location.reload();
            } else {
                alert('❌ Erreur lors de la modification');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors de la modification');
        }
    };

    const handleDeleteClick = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${pokemon.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('✅ Pokémon supprimé avec succès!');
                navigate('/');
            } else {
                alert('❌ Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors de la suppression');
        }
    };

    const handleNameChange = (lang, value) => {
        setEditedData(prev => ({
            ...prev,
            name: { ...prev.name, [lang]: value }
        }));
    };

    const handleStatChange = (stat, value) => {
        setEditedData(prev => ({
            ...prev,
            base: { ...prev.base, [stat]: parseInt(value) || 0 }
        }));
    };

    if (loading) {
        return (
            <div className="details-container">
                <div className="loading">
                    <div className="pokeball-loader"></div>
                    <p>Chargement du Pokémon...</p>
                </div>
            </div>
        );
    }

    if (!pokemon) {
        return (
            <div className="details-container">
                <div className="error-message">
                    <h2>❌ Pokémon non trouvé</h2>
                    <Link to="/" className="back-btn">Retour à la liste</Link>
                </div>
            </div>
        );
    }

    const typeColors = {
        Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
        Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
        Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
        Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
        Steel: '#B8B8D0', Fairy: '#EE99AC'
    };

    const primaryColor = typeColors[pokemon.type[0]] || '#A8A878';

    const fav = isFavorite(pokemon.id);
    return (
        <div className="details-container">
            <div className="details-header">
                <Link to="/" className="back-link">← Retour à la liste</Link>
                <button
                    type="button"
                    className={`details-favoris-btn ${fav ? 'is-favorite' : ''}`}
                    onClick={() => toggleFavoris(pokemon.id)}
                    aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    <span className="heart-icon">{fav ? '❤️' : '🤍'}</span>
                    <span className="details-favoris-label">{fav ? 'Favori' : 'Ajouter aux favoris'}</span>
                </button>
            </div>

            <div className="details-card">
                <div className="card-top" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                    <div className="pokemon-id-badge">#{pokemon.id.toString().padStart(3, '0')}</div>
                    <img src={pokemon.image} alt={pokemon.name.french} className="details-image" />
                </div>

                <div className="card-content">
                    <h1 className="pokemon-title">
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={editedData.name.french}
                                onChange={(e) => handleNameChange('french', e.target.value)}
                                className="edit-input title-input"
                            />
                        ) : (
                            pokemon.name.french
                        )}
                    </h1>

                    <div className="types-section">
                        {pokemon.type.map((type) => (
                            <span 
                                key={type} 
                                className="type-badge-large"
                                style={{ backgroundColor: typeColors[type] }}
                            >
                                {type}
                            </span>
                        ))}
                    </div>

                    <div className="info-section">
                        <h2 className="section-title">📝 Noms</h2>
                        <div className="names-grid">
                            {Object.entries(pokemon.name).map(([lang, name]) => (
                                <div key={lang} className="name-item">
                                    <span className="name-label">{lang === 'french' ? '🇫🇷 Français' : lang === 'english' ? '🇬🇧 English' : lang === 'japanese' ? '🇯🇵 日本語' : '🇨🇳 中文'}:</span>
                                    {isEditing ? (
                                        <input 
                                            value={editedData.name[lang]}
                                            onChange={(e) => handleNameChange(lang, e.target.value)}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <span className="name-value">{name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="info-section">
                        <h2 className="section-title">📊 Statistiques</h2>
                        <div className="stats-grid">
                            {Object.entries(pokemon.base).map(([stat, value]) => (
                                <div key={stat} className="stat-box">
                                    <div className="stat-name">{stat}</div>
                                    {isEditing ? (
                                        <input 
                                            type="number" 
                                            value={editedData.base[stat]}
                                            onChange={(e) => handleStatChange(stat, e.target.value)}
                                            className="edit-input stat-input"
                                            min="1"
                                            max="255"
                                        />
                                    ) : (
                                        <>
                                            <div className="stat-value">{value}</div>
                                            <div className="stat-bar">
                                                <div 
                                                    className="stat-bar-fill" 
                                                    style={{ 
                                                        width: `${(value / 255) * 100}%`,
                                                        backgroundColor: primaryColor
                                                    }}
                                                ></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="actions-section">
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveClick} className="btn btn-success">
                                    ✓ Sauvegarder
                                </button>
                                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                    ✕ Annuler
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                                    ✎ Modifier
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
                                    🗑 Supprimer
                                </button>
                            </>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="details-add-to-team">
                            <h2 className="section-title">⚔ Ajouter à une équipe</h2>
                            {teams.filter((t) => (t.pokemonIds || []).length < MAX_POKEMON_PER_TEAM && !(t.pokemonIds || []).includes(pokemon.id)).length === 0 ? (
                                <p className="details-team-empty">Aucune équipe disponible (crée-en une depuis <Link to="/groupes-combat">Groupes de combat</Link>).</p>
                            ) : (
                                <div className="details-team-buttons">
                                    {teams
                                        .filter((t) => (t.pokemonIds || []).length < MAX_POKEMON_PER_TEAM && !(t.pokemonIds || []).includes(pokemon.id))
                                        .map((t) => (
                                            <button key={t.id} type="button" className="btn btn-team-add" onClick={() => addPokemonToTeam(t.id, pokemon.id)}>
                                                + {t.name}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">⚠️ Confirmer la suppression</h2>
                        <p className="modal-text">
                            Êtes-vous sûr de vouloir supprimer <strong>{pokemon.name.french}</strong> ?
                        </p>
                        <p className="modal-warning">Cette action est irréversible!</p>
                        
                        <div className="modal-actions">
                            <button onClick={handleDeleteClick} className="btn btn-danger">
                                Oui, supprimer
                            </button>
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PokemonDetails;
