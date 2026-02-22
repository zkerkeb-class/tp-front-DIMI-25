# Pokédex — Application Pokémon

Application web complète de type Pokédex : exploration, création, comparaison, favoris, équipes de combat et découverte aléatoire. Interface gamifiée avec animations et sons.

---

## Prérequis

- **Node.js** (v18+ recommandé)
- **MongoDB** (pour le backend)

---

## Installation et lancement

### Backend

```bash
cd tp-back-final-DIMI-25
npm install
# Configurer la connexion MongoDB dans connect.js si besoin
npm run dev
```

Le serveur tourne sur **http://localhost:3000**.

### Frontend

```bash
cd tp-front-DIMI-25
npm install
npm run dev
```

L’application est disponible sur **http://localhost:5173** (ou le port indiqué par Vite).

---

## Fonctionnalités de l’application

### 1. Liste et exploration des Pokémon

- **Liste paginée** des Pokémon (20 par page) avec cartes affichant :
  - Nom, numéro (#001, #002…), image
  - Types (badges colorés)
  - Aperçu des stats (PV, Att, Déf)
- **Recherche** par nom (français, anglais, japonais, chinois) ou par numéro.
- **Filtre par type** (tous les types officiels).
- **Bouton « Réinitialiser »** pour revenir à la liste complète.
- Clic sur une carte pour ouvrir la **fiche détail** du Pokémon.

### 2. Fiche détail d’un Pokémon

- Image, nom, numéro, types.
- Noms en plusieurs langues (FR, EN, JP, CN).
- **Statistiques** avec barres (PV, Attaque, Défense, Att. Sp., Déf. Sp., Vitesse).
- **Modifier** : édition des noms et des stats, sauvegarde via l’API.
- **Supprimer** : suppression avec modal de confirmation.
- **Favoris** : bouton pour ajouter/retirer des favoris (cœur).
- **Ajouter à une équipe** : boutons pour ajouter ce Pokémon à une des équipes de combat (si équipes existantes et non pleines).

### 3. Favoris (collection)

- **Cœur sur chaque carte** (liste et fiche détail) pour ajouter/retirer des favoris.
- **Badge dans le header** : « ❤️ Favoris » avec le nombre de favoris.
- **Page Favoris** (`/favoris`) : liste de tous les Pokémon mis en favoris.
- Sauvegarde locale (**localStorage**), persistance entre les sessions.

### 4. Comparaison de deux Pokémon

- **Page Comparer** (`/compare`) accessible depuis le header.
- Choix de **deux Pokémon** (recherche + liste déroulante).
- **Caractéristiques** affichées avant le résultat :
  - Image, nom, numéro, types, **barres de stats** pour chaque Pokémon.
  - Bouton **🔊** pour écouter le cri de chaque Pokémon.
- **Gagnant probable** avec explications (avantages de type, stats, vitesse).
- **Cri du gagnant** joué automatiquement à l’affichage du résultat.
- Bouton « Réécouter le cri » dans le bloc du gagnant.

### 5. Groupes de combat (équipes)

- **Page Groupes de combat** (`/groupes-combat`) : création et gestion d’**équipes de 6 Pokémon**.
- **Créer une équipe** : saisie du nom, puis équipe vide créée.
- Pour chaque équipe :
  - **Renommer** en cliquant sur le nom.
  - **Types** et **faiblesses** de l’équipe affichés.
  - **Slots** pour les 6 Pokémon : ajout / retrait (✕).
- **Suggérer des Pokémon** : proposition de Pokémon qui **complètent l’équipe** (couverture de types, résistances aux faiblesses, équilibre Att/Déf/Vitesse). Bouton « Ajouter à l’équipe » sur chaque suggestion.
- **Ajout depuis la fiche** d’un Pokémon : section « Ajouter à une équipe » avec un bouton par équipe disponible.
- **Combattre deux équipes** : en haut de la page, section « Combattre deux équipes ». Choisir **Équipe 1** et **Équipe 2** (listes déroulantes), puis **Lancer le combat**. Les Pokémon s’affrontent **round par round** (1er vs 1er, 2e vs 2e, etc.) selon la même logique que la comparaison (types + stats). Affichage du **score** (ex. 4-2), du **vainqueur** (équipe avec le plus de victoires) ou **Égalité**, et du **détail des rounds** (Pokémon A vs Pokémon B → gagnant du round).
- Données des équipes en **localStorage**.

### 6. Création d’un Pokémon

- **Page Créer un Pokémon** (`/add`) depuis le header.
- **Informations générales** : noms (FR obligatoire, EN, JP, CN optionnels).
- **Types** : choix d’un ou deux types parmi la liste officielle.
- **Statistiques** : sliders pour PV, Attaque, Défense, Att. Sp., Déf. Sp., Vitesse (1–255).
- **Image** :
  - **Choisir une image sur le PC** : upload (JPG, PNG, GIF, WebP, max 5 Mo), prévisualisation, envoi au serveur.
  - **Ou coller une URL** d’image.
- À la **création réussie** : **confettis**, message « Pokémon créé ! », puis redirection vers l’accueil.

### 7. Découverte aléatoire (« Shake »)

- **Bouton « Découvrir »** dans le header.
- Ouverture d’une **modale** avec une **Poké Ball** qui **secoue** (animation).
- Après environ 2,6 s, **révélation** d’un **Pokémon aléatoire** (API backend) avec **flash** et **cri Pokémon**.
- Lien « Voir la fiche » et bouton **« Encore une fois »** pour relancer un tirage.

### 8. Animations et sons

- **Animations** : apparition des cartes, hover, léger rebond au clic, barres de stats en remplissage progressif, confettis à la création, flash et shake dans la modale Découvrir.
- **Sons** : cris Pokémon (PokeAPI) sur la comparaison (gagnant + boutons) et à la révélation dans Découvrir.

---

## API Backend (résumé)

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/pokemons` | Liste paginée (query: `page`) |
| GET | `/pokemons/list` | Liste complète (id, name, type, base, image) pour listes / équipes |
| GET | `/pokemons/random` | Un Pokémon aléatoire |
| GET | `/pokemons/:id` | Un Pokémon par ID |
| GET | `/pokemonss` | Recherche (query: `search`, `type`) |
| POST | `/pokemons/upload` | Upload d’image (multipart, champ `image`) |
| POST | `/pokemons` | Création d’un Pokémon (JSON) |
| PUT | `/pokemons/:id` | Modification d’un Pokémon |
| DELETE | `/pokemons/:id` | Suppression d’un Pokémon |

Les images uploadées sont servies sous `/assets/pokemons/custom/`.

---

## Structure du projet (frontend)

```
src/
├── components/     # Composants réutilisables (carte, confettis, modale Découvrir)
├── context/        # FavorisContext, TeamsContext
├── hook/           # Hooks (ex. usePokemon)
├── screens/        # Pages (liste, détail, ajout, comparer, favoris, groupes combat)
├── utils/          # typeChart, teamSuggestions, pokemonSound
├── App.jsx
├── main.jsx
└── index.css
```

---

## Technologies

- **Frontend** : React 19, React Router 7, Vite 7
- **Backend** : Express 5, Mongoose, Multer (upload)
- **Données** : MongoDB ; favoris et équipes en localStorage côté client

---

## Récapitulatif des écrans

| Route | Écran |
|-------|--------|
| `/` | Liste des Pokémon (filtres, pagination, cartes) |
| `/pokemonDetails/:id` | Fiche détail (modifier, supprimer, favoris, ajouter à une équipe) |
| `/add` | Création d’un Pokémon (formulaire + upload image) |
| `/compare` | Comparaison de deux Pokémon (caractéristiques + gagnant + sons) |
| `/favoris` | Liste des Pokémon favoris |
| `/groupes-combat` | Groupes de combat (équipes de 6 + suggestions) |

Toutes les fonctionnalités listées ci-dessus sont intégrées et utilisables dans l’application.
