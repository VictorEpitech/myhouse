# 🏰 Codex Epitech Moulins — Le Rituel d'Attribution des 4 Maisons

Plateforme web immersive et interactive conçue pour les étudiants d'**Epitech Moulins**. Elle propose un rituel d'attribution sous forme de test de culture informatique et logique (35 questions) pour découvrir leur Maison officielle du campus et accéder au portail [codex.techmoulins.fr](https://codex.techmoulins.fr).

---

## 🌟 Fonctionnalités Clés

- **🧙‍♂️ Illusion du Choixpeau (Sorting Hat)** :
  - 35 questions adaptées aux premières années (Tek1 sans C préalable) : 25 questions de logique, réseaux, hardware et culture tech + 10 questions de profilage d'ingénieur.
  - Choix neutres (A, B, C, D) ne mentionnant jamais le nom des Maisons.
  - Réconciliation discrète et automatique avec l'affectation officielle définie dans la promotion.
- **🔒 Confidentialité Absolue & Règle Anti-Fuite** :
  - Aucun nom de camarade affiché dans la révélation pour préserver l'effet de surprise le jour de l'événement.
  - Verrouillage strict anti-recommencement : une fois le rituel validé, l'étudiant ne peut plus repasser le test (`409 Conflict` en base de données).
- **🔑 Authentification Microsoft 365 Entra ID** :
  - Connexion SSO officielle `@epitech.eu` avec Microsoft Entra ID.
  - Rapprochement automatique des étudiants et détection du profil Administrateur pour `victor1.granger@epitech.eu`.
- **📊 Tableau de Bord Pédagogique Administrateur** :
  - Supervision en direct des passages d'étudiants.
  - Visualisation des scores objectifs (/25) et des profils d'affinité.
  - Exportation complète au format CSV.
  - Bouton d'actualisation directe depuis la base SQLite.
- **🎨 Design & Univers Graphique** :
  - Direction artistique cyberpunk & fantasy inspirée des bannières et affiches A3 officielles.
  - Synthèse sonore native Web Audio API (aucun asset lourd externe).

---

## 🛠️ Stack Technique

- **Frontend** : React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend API** : Node.js (v22+), Express.
- **Base de Données** : SQLite (persistance native sans dépendance externe).
- **Authentification** : `@azure/msal-browser` (Microsoft Entra ID PKCE).
- **Déploiement** : Docker & Docker Compose (multi-stage build).

---

## 🚀 Installation & Démarrage

### 1. Cloner le projet et configurer l'environnement

```bash
git clone <votre-url-de-depot>
cd myhouse

# Copier le fichier d'environnement
cp .env.example .env
```

Éditez le fichier `.env` avec les identifiants de votre inscription d'application Microsoft Entra ID :
```env
PORT=3000
VITE_AZURE_CLIENT_ID=votre-client-id-azure
VITE_AZURE_TENANT_ID=common
VITE_AZURE_REDIRECT_URI=https://codex.techmoulins.fr
ADMIN_EMAILS=victor1.granger@epitech.eu
DATABASE_PATH=/app/data/codex.db
```

### 2. Lancement avec Docker (Recommandé)

```bash
# Lancement du conteneur en arrière-plan avec volume persistant
docker compose up -d --build

# Consulter les logs
docker compose logs -f
```

L'application est disponible sur `http://localhost:3000`.

### 3. Lancement en Développement Local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement Vite
npm run dev
```

---

## 🛡️ Structure du Projet

```
├── public/assets/houses/   # Bannières et affiches A3 des 4 Maisons
├── server/
│   ├── index.js            # Serveur Express & API REST
│   └── db.js               # Gestionnaire de base de données SQLite
├── src/
│   ├── auth/               # Configuration MSAL et AuthContext
│   ├── components/         # Composants UI (Quiz, Reveal, Dashboard, Showcase)
│   ├── data/               # Données des Maisons, Étudiants et Questions
│   └── utils/              # Client API, Web Audio API synth
├── Dockerfile              # Build multi-stage pour la production
├── docker-compose.yml      # Service de conteneur avec volume persistant
└── package.json
```

---

## 📜 Licence & Droits

Projet développé pour le campus **Epitech Moulins** et les promotions du **Codex**. Tous droits réservés.
