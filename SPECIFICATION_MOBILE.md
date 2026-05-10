# Spécification Fonctionnelle : Application Mobile – Espace Membre

### 1. Principe Général

L'application mobile offre **exactement les mêmes fonctionnalités** que la version web de l'Espace Membre, avec une ergonomie repensée pour le format smartphone (écran réduit, navigation tactile, usage en mobilité). Elle exploite également les capacités natives du téléphone pour enrichir l'expérience utilisateur.

L'application est disponible sur **Android** et **iOS**.

---

### 2. Architecture de Navigation Mobile

L'application mobile adopte une navigation à **deux niveaux** :

| Niveau | Type | Description |
| :--- | :--- | :--- |
| **Barre inférieure (Bottom Navigation)** | Fixe, toujours visible | Contient les **5 modules principaux** les plus utilisés au quotidien. |
| **Menu "Plus" (Hamburger ou icône grille)** | Accessible depuis la barre inférieure | Regroupe les **10 modules secondaires**, les paramètres et les fonctionnalités avancées. |

---

### 3. Barre de Navigation Inférieure (Bottom Navigation Bar)

Barre fixe en bas de l'écran, toujours visible, avec 5 onglets principaux.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    ZONE DE CONTENU                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  📊 Accueil  │  💰 Tontines  │ ➕  │  💬 Chat  │  👤 Profil  │
└──────────────────────────────────────────────────────────────┘
```

| Position | Icône | Libellé | Module Principal |
| :--- | :--- | :--- | :--- |
| 1 | 📊 | Accueil | Tableau de Bord |
| 2 | 💰 | Tontines | Mes Tontines (point d'entrée principal des activités financières) |
| 3 | ➕ | Actions | Bouton central proéminent (FAB – Floating Action Button élargi) : accès rapide aux actions clés + menu "Plus" |
| 4 | 💬 | Chat | Chat de Groupe |
| 5 | 👤 | Profil | Mon Profil |

---

### 4. Menu "Plus" (accessible depuis le bouton central ➕)

Le bouton central (+) déclenche un menu overlay qui donne accès aux modules secondaires et aux actions rapides.

```
┌─────────────────────────────────────┐
│  ✕ Fermer                          │
├─────────────────────────────────────┤
│  🏦  Épargne & Investissement       │
│  💳  Prêts & Crédit                 │
│  🤝  Solidarité                     │
│  📅  Sessions & Tirage              │
│  👥  Membres                        │
│  🛒  Marketplace                    │
│  🎉  Événements                     │
│  🤖  Conseils IA                    │
│  📈  Rapports                       │
│  🏆  Gamification                   │
│  🎓  Académie                       │
├─────────────────────────────────────┤
│  ⚡ Actions Rapides :               │
│  💸 Effectuer un versement          │
│  🤲 Demander une aide               │
│  💳 Solliciter un prêt              │
│  📝 Créer une association           │
└─────────────────────────────────────┘
```

---

### 5. Adaptation Mobile des 15 Modules

#### Module 1 : 📊 Tableau de Bord (Accueil)

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Sélecteur d'association** | Barre horizontale en haut, défilement latéral des associations (swipe gauche/droite). Vue par défaut : "Toutes". |
| **Cartes résumées** | Cartes empilées verticalement avec défilement (scroll). |
| **Prochaine échéance** | Carte mise en avant avec compte à rebours visuel. |
| **Actions rapides** | Boutons d'action en bas de chaque carte (Payer, Voir plus). |
| **Tirer vers le bas (Pull-to-refresh)** | Actualisation des données par geste. |
| **Widget écran d'accueil** | Possibilité d'épingler un résumé sur l'écran d'accueil du téléphone (Android/iOS). |

---

#### Module 2 : 💰 Mes Tontines

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Liste des tontines** | Liste avec défilement vertical, chaque tontine affichée sous forme de carte compacte. |
| **Tontine active** | Badge de statut (En cours, Terminée). Indicateur de progression circulaire. |
| **Détail d'une tontine** | Écran dédié avec navigation par onglets (Aperçu, Mon suivi, Historique). |
| **Paiement** | Bouton "Payer ma cotisation" proéminent, intégration native Mobile Money. |
| **Notifications push** | Rappel de cotisation J-1, Jour J, confirmation de paiement. |

---

#### Module 3 : 🏦 Épargne & Investissement

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Vue d'ensemble** | Soldes affichés sous forme de jauges circulaires. |
| **Mes comptes** | Liste des comptes épargne et investissements, solde, évolution en pourcentage. |
| **Verser / Retirer** | Formulaire optimisé pour saisie tactile, validation biométrique (empreinte digitale, Face ID). |
| **Graphiques d'évolution** | Graphiques interactifs adaptés au mobile (toucher pour voir le détail d'un point). |
| **Objectifs** | Barre de progression avec animation, possibilité de créer un objectif avec photo. |

---

#### Module 4 : 💳 Prêts & Crédit

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Mes prêts** | Liste avec statut visuel (couleur) : En cours (vert), En retard (rouge), Remboursé (gris). |
| **Demander un prêt** | Processus étape par étape (stepper), champ de montant avec curseur tactile. |
| **Échéancier** | Calendrier mensuel interactif avec pastilles de couleur. |
| **Remboursement** | Paiement en un clic, confirmation biométrique. |
| **Alertes** | Notification push 3 jours avant échéance, jour J, et rappel en cas de retard. |

---

#### Module 5 : 🤝 Solidarité

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Caisses de solidarité** | Cartes avec icône par type (🕊️ Décès, 👶 Naissance, 💒 Mariage, 🏥 Maladie). |
| **Demander une aide** | Formulaire simplifié avec capture photo de justificatif (appareil photo natif). |
| **Suivi de demande** | Timeline visuelle de l'avancement de la demande (Soumise → En cours → Validée → Payée). |
| **Contributions** | Possibilité de contribuer en un clic à une cagnotte solidaire. |
| **Notifications** | Alerte en cas de nouvelle demande d'aide dans l'association. |

---

#### Module 6 : 📅 Sessions & Tirage

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Calendrier** | Vue mensuelle avec navigation par swipe, pastilles de couleur par type de session. |
| **Prochaine session** | Carte avec localisation (carte native GPS si lieu physique) ou lien visioconférence. |
| **Tirage au sort** | Animation de tirage avec effets visuels et sonores, résultat affiché en plein écran. |
| **Procès-verbaux** | Liste des PV, consultation en mode lecture avec zoom, téléchargement PDF. |
| **Rappel** | Ajout direct au calendrier natif du téléphone (Google Calendar, Apple Calendar). |

---

#### Module 7 : 👥 Membres

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Annuaire** | Liste avec barre de recherche, photos en cercle, swipe pour voir plus d'informations. |
| **Fiche membre** | Profil avec photo, onglets (Infos, Activité, Réputation). |
| **Actions** | Boutons contextuels : Envoyer message, Voir historique. Pour le bureau : Gérer le rôle, Exclure. |
| **Inviter** | Partage de lien d'invitation via les applications natives (WhatsApp, SMS, email). |
| **Répertoire téléphonique** | Synchronisation possible avec le répertoire du téléphone pour trouver des contacts. |

---

#### Module 8 : 🛒 Marketplace

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Fil d'annonces** | Grille de 2 colonnes avec photos, scroll infini. |
| **Recherche** | Barre de recherche avec filtres, suggestions automatiques. |
| **Fiche produit** | Galerie photos avec swipe, description, prix, vendeur (lien vers profil membre). |
| **Contacter le vendeur** | Ouverture du chat privé en un clic. |
| **Acheter** | Paiement intégré Mobile Money, confirmation biométrique. |
| **Publier une annonce** | Formulaire avec prise de photo native, description, prix. |

---

#### Module 9 : 🎉 Événements

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Calendrier** | Vue liste ou calendrier, filtres par type (Mariage, Funérailles, Fête, AG). |
| **Fiche événement** | Photo, date, lieu avec carte GPS, liste des participants. |
| **Confirmer présence** | Boutons Présent / Absent / Peut-être. |
| **Contribuer** | Cagnotte événementielle avec paiement intégré, barre de progression. |
| **Album** | Grille de photos, upload depuis la galerie native, possibilité de commenter. |
| **Partage** | Partager l'événement sur WhatsApp, Facebook, etc. |

---

#### Module 10 : 💬 Chat de Groupe

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Liste des conversations** | Chats classés : Association, Bureau, Activités, Privés. Badge de messages non lus. |
| **Conversation** | Interface de messagerie instantanée classique (bulles). |
| **Saisie** | Clavier natif, envoi de photos (galerie ou appareil photo), messages vocaux (micro natif), emojis. |
| **Notifications push** | Alerte instantanée pour nouveaux messages, avec aperçu. |
| **@mentions** | Surbrillance quand l'utilisateur est mentionné. |
| **Pièces jointes** | Partage de documents (PDF, Excel) avec ouverture dans applications natives. |

---

#### Module 11 : 🤖 Conseils IA

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Chatbot** | Interface de chat conversationnel, bulles de dialogue. |
| **Assistant vocal** | Activation par commande vocale (micro natif), réponse synthétisée (text-to-speech). |
| **Widget conseils** | Carte de conseil personnalisé sur le tableau de bord. |
| **Notifications intelligentes** | Alerte contextuelle basée sur le comportement ("Votre solde est bas pour la cotisation de demain"). |
| **Mode hors ligne** | FAQ accessible sans connexion. |

---

#### Module 12 : 📈 Rapports

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Mes rapports** | Liste des rapports disponibles. |
| **Génération** | Sélecteur de période avec plage de dates, bouton "Générer". |
| **Visualisation** | Consultation en mode lecture avec zoom, graphiques interactifs. |
| **Export** | Partage PDF ou Excel via les applications natives (WhatsApp, email, stockage cloud). |
| **Reçus** | Génération de reçu instantané après chaque transaction, option "Partager" ou "Enregistrer". |

---

#### Module 13 : 🏆 Gamification

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Mon profil de jeu** | Niveau actuel, points, barre de progression vers le niveau supérieur. |
| **Badges** | Collection de badges obtenus, grille avec animation. |
| **Classement** | Liste des membres par score, mise en avant du rang de l'utilisateur. |
| **Défis en cours** | Liste de défis à accomplir ("Payer 5 cotisations à temps"), barre de progression. |
| **Notifications** | Alerte de déblocage de badge (avec confettis animés), passage de niveau. |

---

#### Module 14 : 🎓 Académie

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Catalogue** | Liste des cours et articles avec miniature, barre de progression. |
| **Cours** | Contenu adapté au mobile : texte avec défilement, images zoomables, vidéos intégrées. |
| **Quiz** | Questions à choix unique/multiple, feedback immédiat, score final. |
| **Certificat** | Affichage du certificat, option "Partager" sur les réseaux sociaux ou "Télécharger". |
| **Mode hors ligne** | Possibilité de télécharger les cours pour lecture sans connexion. |
| **Reprendre** | Indicateur "Dernier cours consulté" pour reprendre là où l'utilisateur s'est arrêté. |

---

#### Module 15 : 👤 Mon Profil

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Photo de profil** | Modification avec prise de photo native ou galerie, recadrage. |
| **Informations** | Formulaire avec champs optimisés mobile (clavier adapté au type de donnée). |
| **Portefeuille** | Solde affiché, lier un compte Mobile Money (intégration native USSD ou API), historique des transactions. |
| **Sécurité** | Activer 2FA, biométrie (empreinte digitale, Face ID) pour connexion et validation de transactions. |
| **Notifications** | Réglages fins par type et canal (push, SMS, email). |
| **Langue** | Choix dans liste, application immédiate. |
| **Bascule Admin** | Bouton "Passer en mode Administration" (si l'utilisateur a les droits). |
| **Déconnexion** | Avec confirmation. |

---

#### Nouveau Module : 🔐 Authentification Sociale (Social Login)

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Boutons de connexion** | "Continuer avec Google", "Continuer avec Facebook". |
| **Fluidité** | Utilisation des SDK natifs (via Firebase Auth) pour une ouverture fluide de l'invite du système. |
| **Création de compte** | Récupération automatique du nom, prénom et de la photo de profil. |

---

#### Nouveau Module : 💳 Wallet Intégré (Portefeuille Électronique)

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Solde Actuel** | Affichage proéminent en haut de l'écran avec bouton pour masquer/afficher. |
| **Actions** | Boutons d'action rapides : "Recharger" (Dépôt) et "Retirer". |
| **Historique** | Liste des transactions avec défilement vertical, icônes par type (Entrant, Sortant). |
| **Paiement Mobile** | Intégration native Mobile Money via USSD ou API (Orange Money, MTN MoMo). |

---

#### Nouveau Module : 📆 Calendrier Financier Consolidé

| Élément | Adaptation Mobile |
| :--- | :--- |
| **Vue Mensuelle** | Calendrier interactif avec pastilles de couleur. |
| **Indicateurs financiers** | Jours avec entrées prévues (vert), jours avec sorties prévues (rouge). |
| **Détail du jour** | Clic sur un jour ouvre une modale coulissante vers le haut (Bottom Sheet) listant les événements. |
| **Notifications** | Alertes push rappelant les échéances importantes (J-1, Jour J). |

---

### 6. Fonctionnalités Spécifiques au Mobile (Non Disponibles sur Web)

| Fonctionnalité Native | Usage dans l'Application |
| :--- | :--- |
| **Notifications Push** | Rappels de cotisation, alertes de session, nouveaux messages, demandes d'aide, déblocage de badges. |
| **Authentification Biométrique** | Connexion par empreinte digitale ou Face ID, validation des transactions sensibles. |
| **Appareil Photo** | Capture de justificatifs pour aides, photo de profil, annonces Marketplace, partage dans le chat. |
| **Microphone** | Messages vocaux dans le chat, commandes vocales pour Conseils IA. |
| **Géolocalisation (GPS)** | Localisation des lieux de session, événements, membres à proximité. |
| **Calendrier Natif** | Ajout automatique des sessions et événements au calendrier du téléphone. |
| **Répertoire Téléphonique** | Invitation de contacts à rejoindre une association, synchronisation. |
| **Stockage Local / Mode Hors Ligne** | Consultation des données en cache, consultation des cours Académie, historique des transactions récentes. |
| **Widget Écran d'Accueil** | Résumé rapide (prochaine échéance, solde) sans ouvrir l'application. |
| **Partage Natif** | Partage via WhatsApp, Facebook, SMS, email, etc. (liens d'invitation, événements, reçus). |
| **Paiement Mobile Money** | Intégration directe via API ou USSD pour Orange Money, MTN Mobile Money, etc. |

---

### 7. Gestuelle et Interactions Tactiles Mobiles

| Geste | Usage |
| :--- | :--- |
| **Pull-to-refresh (Tirer vers le bas)** | Actualiser une liste (membres, transactions, chat). |
| **Swipe horizontal** | Changer d'association dans le sélecteur, naviguer entre onglets. |
| **Swipe latéral sur un élément** | Actions rapides (ex: swiper un prêt pour voir options "Payer", "Détails"). |
| **Appui long** | Menu contextuel (ex: sur un message du chat pour "Copier", "Supprimer"). |
| **Double tap** | Zoomer sur une image, aimer un message. |
| **Shake (secouer)** | Fonction "undo" après une action (annuler dernier paiement si délai non expiré). |

---

### 8. Sélecteur d'Association sur Mobile

Le sélecteur d'association est adapté pour une utilisation tactile fluide.

```
┌──────────────────────────────────────────────────────────────┐
│  ◄  [Tontine Familiale Nguemba]  ►                           │
│     ●       ○        ○        ○        ○                     │
└──────────────────────────────────────────────────────────────┘
```

| Élément | Comportement |
| :--- | :--- |
| **Défilement horizontal** | Swipe gauche/droite pour passer d'une association à l'autre. |
| **Indicateur de position** | Points indiquant le nombre d'associations et la position actuelle. |
| **Menu déroulant** | Appui sur le nom pour ouvrir la liste complète avec barre de recherche. |
| **Persistance** | La dernière association sélectionnée est conservée à la réouverture de l'application. |

---

### 9. Tableau Récapitulatif : Correspondance Modules Web ↔ Mobile

| N° | Module | Barre Inférieure | Menu "Plus" | Spécificité Mobile |
| :--- | :--- | :---: | :---: | :--- |
| 1 | Tableau de Bord | ✅ Accueil | — | Widget écran d'accueil |
| 2 | Mes Tontines | ✅ Tontines | — | Paiement Mobile Money natif |
| 3 | Épargne & Investissement | — | ✅ | Validation biométrique |
| 4 | Prêts & Crédit | — | ✅ | Notifications push échéances |
| 5 | Solidarité | — | ✅ | Capture photo justificatifs |
| 6 | Sessions & Tirage | — | ✅ | Ajout calendrier natif, GPS |
| 7 | Membres | — | ✅ | Synchro répertoire téléphonique |
| 8 | Marketplace | — | ✅ | Prise de photo annonces |
| 9 | Événements | — | ✅ | GPS, calendrier natif |
| 10 | Chat de Groupe | ✅ Chat | — | Messages vocaux, push |
| 11 | Conseils IA | — | ✅ | Commande vocale |
| 12 | Rapports | — | ✅ | Partage natif PDF |
| 13 | Gamification | — | ✅ | Animations, confettis |
| 14 | Académie | — | ✅ | Mode hors ligne |
| 15 | Mon Profil | ✅ Profil | — | Biométrie, 2FA natif |

---

### 10. Écran de Lancement et Onboarding Mobile

| Étape | Écran |
| :--- | :--- |
| **Splash Screen** | Logo de l'application avec animation pendant le chargement. |
| **Authentification** | Connexion par email/téléphone + mot de passe, ou biométrie si déjà configurée. |
| **Tutoriel (première connexion)** | 3-4 écrans de présentation des fonctionnalités clés avec swipe. |
| **Accueil** | Arrivée sur le Tableau de Bord avec l'association par défaut. |
