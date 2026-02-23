import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router";
import { FavorisProvider } from './context/FavorisContext.jsx';
import { TeamsProvider } from './context/TeamsContext.jsx';
import PokemonDetails from './screens/pokemonDetails.jsx';
import AddPokemon from './screens/addPokemon.jsx';
import ComparePokemon from './screens/comparePokemon.jsx';
import Favoris from './screens/favoris.jsx';
import GroupesCombat from './screens/groupesCombat.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavorisProvider>
      <TeamsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/pokemonDetails/:url" element={<PokemonDetails />} />
            <Route path="/add" element={<AddPokemon />} />
            <Route path="/compare" element={<ComparePokemon />} />
            <Route path="/favoris" element={<Favoris />} />
            <Route path="/groupes-combat" element={<GroupesCombat />} />
          </Routes>
        </BrowserRouter>
      </TeamsProvider>
    </FavorisProvider>
  </StrictMode>,
)
