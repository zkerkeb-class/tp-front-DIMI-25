import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Confetti from '../components/confetti/Confetti';
import './addPokemon.css';

const API_BASE = 'http://localhost:3000';

const AddPokemon = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [formData, setFormData] = useState({
        name: {
            french: '',
            english: '',
            japanese: '',
            chinese: ''
        },
        type: [],
        base: {
            HP: 50,
            Attack: 50,
            Defense: 50,
            SpecialAttack: 50,
            SpecialDefense: 50,
            Speed: 50
        },
        image: ''
    });

    const availableTypes = [
        'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
        'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
        'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
    ];

    const handleNameChange = (lang, value) => {
        setFormData(prev => ({
            ...prev,
            name: { ...prev.name, [lang]: value }
        }));
    };

    const handleStatChange = (stat, value) => {
        setFormData(prev => ({
            ...prev,
            base: { ...prev.base, [stat]: parseInt(value) || 0 }
        }));
    };

    const handleTypeToggle = (type) => {
        setFormData(prev => {
            const types = prev.type.includes(type)
                ? prev.type.filter(t => t !== type)
                : [...prev.type, type];
            return { ...prev, type: types };
        });
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
            alert('Format accepté : JPG, PNG, GIF ou WebP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image trop volumineuse (max 5 Mo).');
            return;
        }
        setUploading(true);
        try {
            const form = new FormData();
            form.append('image', file);
            const res = await fetch(`${API_BASE}/pokemons/upload`, {
                method: 'POST',
                body: form,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Échec de l\'upload');
            }
            const { imageUrl } = await res.json();
            setFormData(prev => ({ ...prev, image: imageUrl }));
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'upload : ' + (err.message || 'réseau'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.french) {
            alert('Le nom français est obligatoire !');
            return;
        }

        if (formData.type.length === 0) {
            alert('Sélectionnez au moins un type !');
            return;
        }

        if (!formData.image) {
            alert('Ajoutez une image (fichier ou URL).');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/pokemons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowConfetti(true);
            } else {
                const error = await response.json();
                alert('Erreur : ' + (error.error || 'création impossible'));
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création du Pokémon');
        }
    };

    useEffect(() => {
        if (!showConfetti) return;
        const t = setTimeout(() => navigate('/'), 2800);
        return () => clearTimeout(t);
    }, [showConfetti, navigate]);

    return (
        <div className="add-container">
            <Confetti active={showConfetti} />
            {showConfetti && (
                <div className="add-success-overlay">
                    <div className="add-success-card">
                        <span className="add-success-icon">✨</span>
                        <h2>Pokémon créé !</h2>
                        <p>Redirection...</p>
                    </div>
                </div>
            )}
            <div className="add-header">
                <Link to="/" className="back-link">← Retour à la liste</Link>
                <h1 className="add-title">Créer un nouveau Pokémon</h1>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
                <section className="form-section">
                    <h2>Informations générales</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nom français *</label>
                            <input
                                type="text"
                                value={formData.name.french}
                                onChange={(e) => handleNameChange('french', e.target.value)}
                                required
                                placeholder="Ex: Pikachu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom anglais</label>
                            <input
                                type="text"
                                value={formData.name.english}
                                onChange={(e) => handleNameChange('english', e.target.value)}
                                placeholder="Ex: Pikachu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom japonais</label>
                            <input
                                type="text"
                                value={formData.name.japanese}
                                onChange={(e) => handleNameChange('japanese', e.target.value)}
                                placeholder="Ex: ピカチュウ"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom chinois</label>
                            <input
                                type="text"
                                value={formData.name.chinese}
                                onChange={(e) => handleNameChange('chinese', e.target.value)}
                                placeholder="Ex: 皮卡丘"
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>Types (1 ou 2 max)</h2>
                    <div className="types-grid">
                        {availableTypes.map(type => (
                            <button
                                key={type}
                                type="button"
                                className={`type-btn ${formData.type.includes(type) ? 'selected' : ''}`}
                                onClick={() => handleTypeToggle(type)}
                                disabled={formData.type.length >= 2 && !formData.type.includes(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="form-section">
                    <h2>Statistiques</h2>
                    <div className="stats-grid">
                        {Object.keys(formData.base).map(stat => (
                            <div key={stat} className="stat-control">
                                <label>{stat}: {formData.base[stat]}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="255"
                                    value={formData.base[stat]}
                                    onChange={(e) => handleStatChange(stat, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="form-section image-section">
                    <h2>Image du Pokémon</h2>
                    <div className="image-options">
                        <div className="upload-zone">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileSelect}
                                className="file-input"
                                id="pokemon-image-file"
                            />
                            <label htmlFor="pokemon-image-file" className="upload-label">
                                {uploading ? (
                                    <span className="upload-status">
                                        <span className="upload-spinner" /> Envoi en cours…
                                    </span>
                                ) : (
                                    <>
                                        <span className="upload-icon">📷</span>
                                        Choisir une image sur mon PC
                                    </>
                                )}
                            </label>
                            <p className="upload-hint">JPG, PNG, GIF ou WebP — max 5 Mo</p>
                        </div>
                        <div className="url-option">
                            <label>Ou coller une URL</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                placeholder="https://exemple.com/image.png"
                            />
                        </div>
                    </div>
                    {formData.image && (
                        <div className="image-preview">
                            <img src={formData.image} alt="Aperçu" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                    )}
                </section>

                <button type="submit" className="submit-btn" disabled={uploading}>
                    Créer le Pokémon
                </button>
            </form>
        </div>
    );
};

export default AddPokemon;
