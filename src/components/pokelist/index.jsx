import { useState, useEffect } from "react";
import PokeCard from "../pokeCard";
import './index.css';

const PokeList = () => {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const isSearching = searchTerm.trim() !== '';// || selectedType !== '';


    const [displayPokemons, setDisplayPokemons] = useState([]);


    const availableTypes = [
        'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
        'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
        'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
    ];
    const fetchPokemons = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3000/pokemons?page=${currentPage}`);
            const data = await res.json();

            setPokemons(data.results);
            setDisplayPokemons(data.results);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
    if (searchTerm.trim() !== '') return;

    

    fetchPokemons();
}, [currentPage, searchTerm,]);

   useEffect(() => {
    if (searchTerm.trim() === '' && selectedType === '') return;

    const fetchPokemon = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3000/pokemonss?search=${searchTerm}&type=${selectedType}`);
            const data = await res.json();

            // Always normalize to array
            setDisplayPokemons(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error("Erreur:", error);
            setDisplayPokemons([]);
        } finally {
            setLoading(false);
        }
    };

    const timer = setTimeout(fetchPokemon, 1000);
    return () => clearTimeout(timer);
}, [searchTerm, selectedType]);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setSearchTerm('');
            setSelectedType('');
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setSearchTerm('');
            setSelectedType('');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="pokeball-loader"></div>
                <p>Chargement des Pokémon...</p>
            </div>
        );
    }

    return (
        <div className="poke-list-container">
            <div className="filters-container">
                <input 
                    type="text"
                    placeholder="Rechercher un Pokémon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                
                <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="type-filter"
                >
                    <option value="">Tous les types</option>
                    {availableTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                {(searchTerm || selectedType) && (
                    <button 
                        onClick={() => { setSearchTerm(''); setSelectedType(''); fetchPokemons(); }}
                        className="reset-button"
                    >
                        ✕ Réinitialiser
                    </button>
                )}
            </div>
            
            {!isSearching && (<div className="pagination-controls">
                <button 

                    onClick={goToPreviousPage} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    ← Précédent
                </button>
                <span className="page-info">Page {currentPage} / {totalPages}</span>
                <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Suivant →
                </button>
            </div>)}

            {loading && <p>Chargement...</p>}

{!loading && displayPokemons.length === 0 && (
    <div className="no-results">
        <p>Aucun Pokémon trouvé{searchTerm && ` pour "${searchTerm}"`}</p>
    </div>
)}

{!loading && displayPokemons.length > 0 && (
    <div className="poke-list">
        {displayPokemons.map((pokemon) => (
            <PokeCard key={pokemon.id} pokemon={pokemon} />
        ))}
    </div>
)}

            {/*<div className="pagination-controls">
                <button 
                    onClick={goToPreviousPage} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    ← Précédent
                </button>
                <span className="page-info">Page {currentPage} / {totalPages}</span>
                <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Suivant →
                </button>
            </div>*/}
        </div>
    );
};

export default PokeList;
