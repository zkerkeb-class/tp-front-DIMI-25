import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTeams } from '../context/TeamsContext';
import { suggestPokemonForTeam, getTeamWeaknesses, getTeamTypes } from '../utils/teamSuggestions';
import { comparePokemon } from '../utils/typeChart';
import './groupesCombat.css';

const API_BASE = 'http://localhost:3000';
const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC',
};

export default function GroupesCombat() {
  const { teams, addTeam, removeTeam, updateTeamName, addPokemonToTeam, removePokemonFromTeam, MAX_POKEMON_PER_TEAM } = useTeams();
  const [pool, setPool] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [suggestionsFor, setSuggestionsFor] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [battleTeamA, setBattleTeamA] = useState('');
  const [battleTeamB, setBattleTeamB] = useState('');
  const [battleResult, setBattleResult] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/pokemons/list`)
      .then((res) => res.json())
      .then((data) => setPool(Array.isArray(data) ? data : []))
      .catch(() => setPool([]));
  }, []);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    addTeam(newTeamName.trim());
    setNewTeamName('');
  };

  const getTeamPokemons = (team) => {
    return (team.pokemonIds || [])
      .map((id) => pool.find((p) => p.id === id))
      .filter(Boolean);
  };

  const suggestions = suggestionsFor
    ? suggestPokemonForTeam(getTeamPokemons(teams.find((t) => t.id === suggestionsFor)), pool, 6)
    : [];

  const runTeamBattle = () => {
    const teamA = teams.find((t) => t.id === battleTeamA);
    const teamB = teams.find((t) => t.id === battleTeamB);
    if (!teamA || !teamB || battleTeamA === battleTeamB) return;
    const pokesA = getTeamPokemons(teamA);
    const pokesB = getTeamPokemons(teamB);
    if (pokesA.length === 0 || pokesB.length === 0) return;
    const rounds = Math.min(pokesA.length, pokesB.length);
    const roundResults = [];
    let scoreA = 0;
    let scoreB = 0;
    for (let i = 0; i < rounds; i++) {
      const result = comparePokemon(pokesA[i], pokesB[i]);
      roundResults.push({
        pokeA: pokesA[i],
        pokeB: pokesB[i],
        winner: result.winner,
        winnerName: result.winnerName,
      });
      if (result.winner === 'a') scoreA++;
      else if (result.winner === 'b') scoreB++;
    }
    const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';
    const winnerTeamName = winner === 'A' ? teamA.name : winner === 'B' ? teamB.name : null;
    setBattleResult({
      teamA: teamA.name,
      teamB: teamB.name,
      scoreA,
      scoreB,
      rounds: roundResults,
      winner,
      winnerTeamName,
    });
  };

  return (
    <div className="groupes-container">
      <div className="groupes-header">
        <Link to="/" className="back-link">← Retour</Link>
        <h1 className="groupes-title">Groupes de combat</h1>
        <p className="groupes-subtitle">Crée des équipes de 6 Pokémon et fais-toi suggérer des Pokémon qui se complètent pour une équipe forte.</p>
      </div>

      <div className="groupes-create">
        <input
          type="text"
          placeholder="Nom de l'équipe"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
          className="groupes-input"
        />
        <button type="button" className="groupes-create-btn" onClick={handleCreateTeam}>
          + Créer une équipe
        </button>
      </div>

      {teams.length >= 2 && (
        <div className="groupes-battle-section">
          <h2 className="groupes-battle-title">⚔ Combattre deux équipes</h2>
          <p className="groupes-battle-desc">Choisis deux équipes : les Pokémon s'affrontent round par round (1 vs 1). L'équipe avec le plus de victoires gagne.</p>
          <div className="groupes-battle-selects">
            <div className="groupes-battle-select-wrap">
              <label>Équipe 1</label>
              <select value={battleTeamA} onChange={(e) => setBattleTeamA(e.target.value)} className="groupes-battle-select">
                <option value="">— Choisir une équipe —</option>
                {teams.map((t) => {
                  const count = getTeamPokemons(t).length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name || 'Sans nom'} ({count} Pokémon)
                    </option>
                  );
                })}
              </select>
            </div>
            <span className="groupes-battle-vs">VS</span>
            <div className="groupes-battle-select-wrap">
              <label>Équipe 2</label>
              <select value={battleTeamB} onChange={(e) => setBattleTeamB(e.target.value)} className="groupes-battle-select">
                <option value="">— Choisir une équipe —</option>
                {teams.map((t) => {
                  const count = getTeamPokemons(t).length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name || 'Sans nom'} ({count} Pokémon)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="groupes-battle-btn"
            onClick={runTeamBattle}
            disabled={
              !battleTeamA ||
              !battleTeamB ||
              battleTeamA === battleTeamB ||
              getTeamPokemons(teams.find((t) => t.id === battleTeamA)).length === 0 ||
              getTeamPokemons(teams.find((t) => t.id === battleTeamB)).length === 0
            }
          >
            Lancer le combat
          </button>

          {battleResult && (
            <div className="groupes-battle-result">
              <div className={`groupes-battle-winner ${battleResult.winner}`}>
                {battleResult.winner === 'tie' ? (
                  <span className="groupes-battle-winner-text">Égalité {battleResult.scoreA} - {battleResult.scoreB}</span>
                ) : (
                  <>
                    <span className="groupes-battle-winner-label">Vainqueur</span>
                    <span className="groupes-battle-winner-name">{battleResult.winnerTeamName}</span>
                    <span className="groupes-battle-score">{battleResult.scoreA} - {battleResult.scoreB}</span>
                  </>
                )}
              </div>
              <div className="groupes-battle-rounds">
                <h3>Détail des rounds</h3>
                {battleResult.rounds.map((r, i) => (
                  <div key={i} className="groupes-battle-round">
                    <span className="groupes-round-num">Round {i + 1}</span>
                    <div className="groupes-round-pokes">
                      <span className="groupes-round-poke">{r.pokeA.name?.french}</span>
                      <span className="groupes-round-vs">vs</span>
                      <span className="groupes-round-poke">{r.pokeB.name?.french}</span>
                    </div>
                    <span className="groupes-round-winner">→ {r.winnerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="groupes-empty">
          <p>Aucune équipe. Crée une équipe ci-dessus pour commencer.</p>
        </div>
      ) : (
        <div className="groupes-list">
          {teams.map((team) => {
            const teamPokes = getTeamPokemons(team);
            const weaknesses = getTeamWeaknesses(teamPokes);
            const coverage = getTeamTypes(teamPokes);
            const isFull = (team.pokemonIds || []).length >= MAX_POKEMON_PER_TEAM;
            return (
              <div key={team.id} className="groupes-team-card">
                <div className="groupes-team-header">
                  {editingName === team.id ? (
                    <input
                      type="text"
                      defaultValue={team.name}
                      className="groupes-edit-input"
                      onBlur={(e) => {
                        updateTeamName(team.id, e.target.value || team.name);
                        setEditingName(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                      autoFocus
                    />
                  ) : (
                    <h2 className="groupes-team-name" onClick={() => setEditingName(team.id)} title="Cliquer pour renommer">
                      {team.name}
                    </h2>
                  )}
                  <span className="groupes-team-count">{(team.pokemonIds || []).length} / {MAX_POKEMON_PER_TEAM}</span>
                  <button type="button" className="groupes-delete-team" onClick={() => removeTeam(team.id)} title="Supprimer l'équipe">
                    🗑
                  </button>
                </div>

                <div className="groupes-team-meta">
                  {coverage.length > 0 && (
                    <div className="groupes-meta-row">
                      <span className="groupes-meta-label">Types :</span>
                      {coverage.map((t) => (
                        <span key={t} className="groupes-type-pill" style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {weaknesses.length > 0 && (
                    <div className="groupes-meta-row">
                      <span className="groupes-meta-label">Faiblesses :</span>
                      {weaknesses.slice(0, 8).map((t) => (
                        <span key={t} className="groupes-weak-pill">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="groupes-team-pokemons">
                  {teamPokes.map((p) => (
                    <div key={p.id} className="groupes-poke-slot">
                      <Link to={`/pokemonDetails/${p.id}`} className="groupes-poke-link">
                        <img src={p.image} alt={p.name?.french} className="groupes-poke-img" />
                        <span className="groupes-poke-name">{p.name?.french}</span>
                      </Link>
                      <button type="button" className="groupes-remove-poke" onClick={() => removePokemonFromTeam(team.id, p.id)} title="Retirer">
                        ✕
                      </button>
                    </div>
                  ))}
                  {!isFull &&
                    Array.from({ length: MAX_POKEMON_PER_TEAM - teamPokes.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="groupes-poke-slot empty" />
                    ))}
                </div>

                <div className="groupes-team-actions">
                  <button
                    type="button"
                    className="groupes-suggest-btn"
                    onClick={() => setSuggestionsFor(suggestionsFor === team.id ? null : team.id)}
                  >
                    {suggestionsFor === team.id ? 'Masquer les suggestions' : 'Suggérer des Pokémon'}
                  </button>
                </div>

                {suggestionsFor === team.id && suggestions.length > 0 && (
                  <div className="groupes-suggestions">
                    <h3>Pokémon qui complètent l'équipe</h3>
                    <div className="groupes-suggest-grid">
                      {suggestions.map(({ pokemon: p, reason }) => (
                        <div key={p.id} className="groupes-suggest-item">
                          <img src={p.image} alt={p.name?.french} className="groupes-suggest-img" />
                          <div className="groupes-suggest-info">
                            <span className="groupes-suggest-name">{p.name?.french}</span>
                            <span className="groupes-suggest-types">
                              {(p.type || []).map((t) => (
                                <span key={t} className="groupes-type-pill small" style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</span>
                              ))}
                            </span>
                            <p className="groupes-suggest-reason">{reason}</p>
                            <button
                              type="button"
                              className="groupes-add-suggest-btn"
                              onClick={() => {
                                addPokemonToTeam(team.id, p.id);
                                setSuggestionsFor(null);
                              }}
                              disabled={isFull}
                            >
                              Ajouter à l'équipe
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestionsFor === team.id && suggestions.length === 0 && pool.length > 0 && (
                  <div className="groupes-suggestions">
                    <p className="groupes-no-suggest">Tous les Pokémon du pool sont déjà dans l'équipe ou l'équipe est pleine.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="groupes-add-poke-section">
        <p className="groupes-help">Pour ajouter un Pokémon : utilise « Suggérer des Pokémon » puis « Ajouter à l'équipe », ou ouvre la fiche d'un Pokémon et clique sur « Ajouter à une équipe ».</p>
      </div>
    </div>
  );
}
