# Contribuer à LecteurRapide

Merci de l'intérêt pour le projet ! Voici comment participer.

## Signaler un bug

1. Vérifiez qu'il n'existe pas déjà dans les [Issues](../../issues)
2. Ouvrez une nouvelle issue en décrivant :
   - Ce que vous faisiez
   - Ce que vous avez obtenu
   - Ce que vous attendiez
   - Votre navigateur et OS

## Proposer une fonctionnalité

Ouvrez une issue avec le tag `enhancement` et décrivez votre idée. On en discute avant de coder.

## Contribuer du code

```bash
# 1. Forkez le repo puis clonez votre fork
git clone https://github.com/VOTRE-PSEUDO/LecteurRapide.git
cd LecteurRapide

# 2. Installez les dépendances
npm install

# 3. Créez une branche
git checkout -b feat/ma-fonctionnalite

# 4. Développez et testez
npm run dev
npm test

# 5. Commitez
git commit -m "feat: description de la fonctionnalité"

# 6. Poussez et ouvrez une Pull Request
git push origin feat/ma-fonctionnalite
```

## Règles

- Un commit = une chose précise
- Les tests doivent passer (`npm test`)
- Le build doit passer (`npm run build`)
- Respectez le style de code existant (CSS Modules, pas de lib de state externe)

## Idées de contributions bienvenues

- 🌍 Traduction de l'interface (EN, ES, DE…)
- 📄 Support PDF via pdf.js
- 📱 Meilleure expérience mobile
- ♿ Améliorations d'accessibilité
- 🧪 Nouveaux tests unitaires

## Licence

En contribuant, vous acceptez que votre code soit publié sous licence [MIT](LICENSE).
