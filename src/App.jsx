import { useState } from 'react'
import './App.css'
import Pokelist from './components/pokelist'
import { Link } from 'react-router'
import { useFavoris } from './context/FavorisContext'
import DiscoverModal from './components/discoverModal/DiscoverModal'

function App() {
  const { count } = useFavoris()
  const [discoverOpen, setDiscoverOpen] = useState(false)
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="pokeball-icon" aria-hidden />
            Pokédex
          </h1>
          <p className="app-subtitle">Explorez tous les Pokémon</p>
        </div>
        <div className="header-actions">
        <button type="button" className="discover-header-btn" onClick={() => setDiscoverOpen(true)}>
          🎲 Découvrir
        </button>
        <Link to="/favoris" className="favoris-header-btn">
          ❤️ Favoris {count > 0 && <span className="favoris-badge">{count}</span>}
        </Link>
        <Link to="/groupes-combat" className="groupes-combat-btn">
          ⚔ Équipes
        </Link>
        <Link to="/compare" className="compare-pokemon-btn">
          ⚔ Comparer
        </Link>
        <Link to="/add" className="add-pokemon-btn">
          <span className="btn-icon">+</span>
          Créer un Pokémon
        </Link>
      </div>
      </header>
      
      <main className="app-main">
        <Pokelist />
      </main>
      <DiscoverModal isOpen={discoverOpen} onClose={() => setDiscoverOpen(false)} />
    </div>
  )
}

export default App
