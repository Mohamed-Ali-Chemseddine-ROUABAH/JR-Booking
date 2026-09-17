# JR Booking Premium

> Une plateforme web de réservation et d'analyse des déplacements, conçue pour les professionnels qui organisent des rendez-vous sur plusieurs lieux.

[![Firebase](https://img.shields.io/badge/backend-Firebase-FFCA28?logo=firebase&logoColor=111827)](https://firebase.google.com/) [![JavaScript](https://img.shields.io/badge/langage-JavaScript-F7DF1E?logo=javascript&logoColor=111827)](https://developer.mozilla.org/fr/docs/Web/JavaScript) [![GeoJSON](https://img.shields.io/badge/données-GeoJSON-4CAF50)](https://geojson.org/)

## Présentation

JR Booking Premium est une plateforme full-stack qui structure la réservation de services, la disponibilité, les échanges entre utilisateurs et le suivi opérationnel des rendez-vous. Le projet a été initié pour répondre à un besoin concret de gestion d'activité, puis pensé comme une base réutilisable pour différents professionnels et secteurs de services.

La prochaine étape importante est le développement de sa dimension géomatique : transformer les adresses et les déplacements liés aux rendez-vous en données géographiques exploitables, visualisables et utiles à la décision.

## Pourquoi ce projet est géomatique

La plateforme constitue un terrain d'application pour plusieurs problématiques de géomatique et d'analyse spatiale :

- géocodage et normalisation des adresses ;
- calcul de distances, de durées et d'itinéraires selon plusieurs modes de déplacement ;
- structuration et échange de données géographiques, notamment au format GeoJSON ;
- analyse des déplacements professionnels et des zones d'intervention ;
- cartographie interactive et tableaux de bord statistiques ;
- recommandations de mobilité prenant en compte le temps, la distance et l'impact environnemental ;
- comparaison de modèles de stockage et de requêtage adaptés aux données spatiales et opérationnelles.

L'objectif est de passer d'une simple gestion de rendez-vous à une meilleure compréhension des mobilités générées par l'activité professionnelle.

## Fonctionnalités déjà développées

La plateforme comprend notamment :

- profils clients et professionnels ;
- recherche et présentation de professionnels ;
- gestion des disponibilités, horaires et réservations ;
- services, durées et informations tarifaires ;
- messagerie liée aux réservations ;
- notifications et rappels ;
- synchronisation optionnelle avec Google Calendar ;
- gestion des contacts, des invitations et de la liaison sécurisée des réservations ;
- espace professionnel avec statistiques d'activité ;
- espace d'administration et contrôles de modération ;
- règles Firestore et fonctions serveur pour protéger les données sensibles ;
- tests locaux avec les émulateurs Firebase.

## Module géomatique en cours de conception

Le module spatial est encore en phase de développement. Les travaux prévus portent sur :

1. la validation et le géocodage des adresses ;
2. le calcul des distances, durées et itinéraires ;
3. la comparaison de plusieurs modes de transport ;
4. la conservation de données spatiales réutilisables ;
5. la visualisation cartographique des rendez-vous et déplacements ;
6. l'analyse des trajets passés et futurs ;
7. la création d'indicateurs d'aide à la décision pour les professionnels.

Les fonctionnalités disponibles aujourd'hui et les orientations futures sont volontairement distinguées afin de conserver une présentation fidèle à l'état réel du projet.

## Architecture technique

- **Interface :** HTML, CSS et JavaScript modulaire
- **Services backend :** Node.js et Firebase Cloud Functions
- **Données :** Cloud Firestore et Firebase Storage
- **Authentification :** Firebase Authentication
- **Hébergement :** Firebase Hosting
- **Données spatiales visées :** coordonnées, itinéraires, zones et GeoJSON
- **Qualité :** tests unitaires, tests d'intégration avec émulateurs et règles Firestore vérifiées

Le choix de Firebase est actuellement adapté à l'architecture opérationnelle du projet. Les besoins du futur module spatial pourront conduire à comparer cette solution avec une base SQL ou une solution disposant de capacités spatiales plus spécialisées.

## État du projet

Le projet est en développement actif. Le socle de réservation et d'administration est avancé et régulièrement vérifié dans un environnement local. La partie cartographique et l'analyse complète des déplacements constituent le prochain axe de développement et feront l'objet d'une conception progressive, documentée et évaluée.

## Feuille de route

- [x] Structurer les comptes, profils et réservations
- [x] Sécuriser les accès et les données métier
- [x] Ajouter les fonctions de communication, notifications et calendrier
- [x] Mettre en place les statistiques d'activité existantes
- [ ] Concevoir le modèle de données géographiques
- [ ] Ajouter le géocodage et la validation des adresses
- [ ] Intégrer le calcul des distances et itinéraires
- [ ] Construire la cartographie et le tableau de bord des déplacements
- [ ] Évaluer les recommandations de mobilité et les indicateurs environnementaux

## Données et responsabilité

Les adresses et informations de déplacement peuvent être sensibles. Leur traitement doit rester limité à ce qui est nécessaire au service, avec des règles d'accès adaptées, une minimisation des données et une séparation claire entre données privées et données utilisées pour les analyses agrégées. Les coordonnées, trajets et statistiques doivent être conçus pour éviter toute exposition inutile d'informations personnelles.

## Développement local

Le projet utilise les émulateurs Firebase pour les tests et la validation locale. Les scripts de test ne doivent jamais écrire dans les services de production. Les instructions détaillées sont conservées dans la documentation de développement du dépôt.

## Auteur

**Mohamed Ali Chemseddine Rouabah**

Projet personnel à vocation professionnelle et entrepreneuriale, développé comme une solution évolutive pour les professionnels ayant besoin de gérer des rendez-vous, des déplacements et des données géographiques.
