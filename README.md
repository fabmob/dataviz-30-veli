# Dataviz 30 VELI

Le projet d’expérimentation 30 VELI est lancé en partenariat entre l'ADEME et la Fabrique de Mobilités, dans le cadre de l'eXtrême Défi Mobilité. Il consiste à tester 30 véhicules sur 16 territoires au total pour fin 2025.

Ce tableau bord partage des statistiques générales sur les voyages à bord de ces véhicules, mesurées à partir de capteurs embarqués, ainsi que les expériences des testeurs issus de questionnaires.

![](demo.png)
*Vue d'ensemble, chaque emoji correspond à un test utilisateur.*


## Structure
Le code de ce tableau de bord est organisé en 2 parties:
* le code de traitement des données (data_processing), le dossier contient un readme détaillé sur le mécanisme de traitement des données brutes.
* le code de la dataviz, divisé en frontend et backend.

## Installation et démarrage de la dataviz
La base de données `data.db` utilisée pour nourrir le tableau de bord est générée par le code de traitement des données. Consultez le dossier `data_processing` pour plus de détails.

De son côté, la dataviz est construite en utilisant Node v20+, TypeScript et React. Pour installer les dépendances, exécutez la commande suivante:
```bash
npm install
```

Ensuite, pour build et démarrer le serveur, exécutez les commandes suivantes:
```bash
npm run build
node dist/index.js
```

Une fonctionalité de build dynamique est disponible en environnement de développement:

```bash
# Dans un premier terminal
npm run build:dev
```

```bash
# Dans un second terminal
npm run start:dev
```

Une fois le serveur démarré, vous pouvez accéder à la dataviz en allant sur l'URL suivante dans votre navigateur:
```
http://localhost:8081
```

