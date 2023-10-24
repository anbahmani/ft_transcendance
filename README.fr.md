[![en](https://img.shields.io/badge/language-en-red.svg)](https://github.com/anbahmani/ft_transcendance/blob/main/README.md)

## Sommaire
1. [Aperçu](#📷-aperçu)
2. [Technologies Utilisées](#🚀-technologies-utilisées)
3. [Sécurité](#🛡️-sécurité)
4. [Gestion des Comptes Utilisateurs](#👤-gestion-des-comptes-utilisateurs)
5. [Fonctionnalité de Chat](#⚙️-fonctionnalité-de-chat)
6. [Le Jeu](#🎮-le-jeu)
<a
## 📷 Aperçu
Ce projet est une plateforme dédiée au mythique jeu Pong, permettant aux utilisateurs de s'affronter en temps réel. Le site offre une interface utilisateur soignée, un système de chat et de multiples fonctionnalités pour une expérience de jeu multijoueur en ligne.


## 🚀 Technologies Utilisées

- Backend: Réalisé avec NestJS, garantissant une architecture robuste et une gestion efficace des différentes requêtes. La communication API se fait via le protocole GraphQL et la communication avec la base de données se fait via l'ORM Prisma.
- Frontend: Construit avec la librairie React, assurant une interface dynamique et réactive.
- Base de données: Utilisation exclusive de PostgreSQL pour la gestion fiable et performante des données.
- Déploiement: Une intégration transparente avec Docker, permettant un lancement rapide et fiable du projet.

## 🛡️ Sécurité
Une attention particulière est accordée aux aspects sécuritaires :

- Hachage sécurisé des mots de passe avant leur stockage.
- Protection renforcée contre les injections SQL.
- Validation rigoureuse côté serveur pour tous les formulaires et entrées des utilisateurs.
- Gestion sécurisée des clés d'API et des données sensibles, évitant toute exposition publique.

## 👤 Gestion des Comptes Utilisateurs
Les utilisateurs se connectent via le système OAuth de l'intranet 42, avec des fonctionnalités de profil étendues :

- Sélection d'un nom unique et téléchargement d'un avatar.
- Activation de l'authentification à deux facteurs.
- Possibilité d'ajouter des amis et de consulter leur statut en temps réel (en ligne, hors-ligne et en partie).
- Profils détaillés affichant les statistiques de jeu, l'historique des matchs, et plus encore.

## ⚙️ Fonctionnalité de Chat
Le site propose un chat intégré permettant :

- Création de canaux publics, privés ou sécurisés par mot de passe.
- Envoi de messages directs.
- Blocage des utilisateurs indésirables.
- Gestion avancée des droits pour les propriétaires et administrateurs de canaux.
- Invitations directes aux jeux via le chat.

## 🎮 Le Jeu
Au cœur du site se trouve le jeu Pong, avec :

- Des parties en temps réel contre d'autres joueurs.
- Un système de matchmaking équitable.
- Gestion des problèmes de réseau pour une expérience utilisateur sans faille.

## 🧑‍💻 Lancer l'application

```
  git clone git@github.com:anbahmani/ft_transcendance.git
  cd ft_transcendance ; make ;
```

Aller sur l'URL ```localhost:3000```

Ce projet représente une fusion complexe de technologies web modernes, de fonctionnalités interactives en temps réel et d'une attention rigoureuse aux détails de sécurité et de performance, offrant une plateforme de jeu nostalgique mais innovante.

