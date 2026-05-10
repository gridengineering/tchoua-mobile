// Multilingual support for Tchoua mobile
// Supports: French, English + 5 local Cameroonian languages
// (Ghomala, Ewondo, Douala, Fulfulde, Mafa)

export type Lang = "fr" | "en" | "ghomala" | "ewondo" | "douala" | "fulfulde" | "mafa";

export const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  ghomala: "Ghɔmálá'",
  ewondo: "Ewondo",
  douala: "Duálá",
  fulfulde: "Fulfulde",
  mafa: "Mafa",
};

export const LANG_FLAGS: Record<Lang, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  ghomala: "🌍",
  ewondo: "🌍",
  douala: "🌍",
  fulfulde: "🌍",
  mafa: "🌍",
};

interface Strings {
  appName: string;
  free: string;

  // Auth
  login: string;
  email: string;
  password: string;
  signIn: string;
  loggingIn: string;

  // Tabs
  home: string;
  associations: string;
  activities: string;
  meetings: string;
  reports: string;
  profile: string;
  chat: string;
  settings: string;

  // Home
  myAssociations: string;
  noAssociation: string;
  joinFirst: string;
  selectAssociation: string;
  active: string;
  members: string;
  contributed: string;
  received: string;
  reliability: string;
  loans: string;
  caisse: string;

  // Associations
  createAssociation: string;
  joinAssociation: string;
  pendingMember: string;
  founder: string;
  bureau: string;
  member: string;

  // Activities
  noActivity: string;
  contribute: string;
  amount: string;
  paymentMethod: string;
  cash: string;
  mobileMoney: string;
  bank: string;
  pay: string;
  upcomingSessions: string;

  // Meetings
  upcoming: string;
  past: string;
  noMeeting: string;
  attend: string;
  quorum: string;
  attendance: string;

  // Reports
  totalContributed: string;
  totalReceived: string;
  globalScore: string;
  confidential: string;

  // Generic
  loading: string;
  retry: string;
  cancel: string;
  save: string;
  close: string;
  search: string;
  offline: string;
  online: string;
  cached: string;
  syncNow: string;
  noConnection: string;
  ussdHint: string;

  // Settings
  language: string;
  notifications: string;
  about: string;
  logout: string;
  version: string;
}

const fr: Strings = {
  appName: "Tchoua",
  free: "100% Gratuit · Open Source · Multi-Associations",
  login: "Se connecter",
  email: "Email",
  password: "Mot de passe",
  signIn: "Connexion",
  loggingIn: "Connexion...",
  home: "Accueil",
  associations: "Associations",
  activities: "Activités",
  meetings: "Réunions",
  reports: "Rapports",
  profile: "Profil",
  chat: "Discussion",
  settings: "Paramètres",
  myAssociations: "Mes Associations",
  noAssociation: "Aucune association",
  joinFirst: "Créez ou rejoignez une association pour commencer",
  selectAssociation: "Choisir une association",
  active: "Actif",
  members: "Membres",
  contributed: "Cotisé",
  received: "Reçu",
  reliability: "Fiabilité",
  loans: "Prêts",
  caisse: "Caisse",
  createAssociation: "Créer une association",
  joinAssociation: "Rejoindre",
  pendingMember: "En attente",
  founder: "Fondateur",
  bureau: "Bureau",
  member: "Membre",
  noActivity: "Aucune activité",
  contribute: "Cotiser",
  amount: "Montant",
  paymentMethod: "Mode de paiement",
  cash: "Espèces",
  mobileMoney: "Mobile Money",
  bank: "Virement",
  pay: "Payer",
  upcomingSessions: "Prochaines sessions",
  upcoming: "À venir",
  past: "Passées",
  noMeeting: "Aucune réunion",
  attend: "Présent",
  quorum: "Quorum",
  attendance: "Présence",
  totalContributed: "Total cotisé",
  totalReceived: "Total reçu",
  globalScore: "Score global",
  confidential: "Confidentiel · visible uniquement par vous",
  loading: "Chargement...",
  retry: "Réessayer",
  cancel: "Annuler",
  save: "Enregistrer",
  close: "Fermer",
  search: "Rechercher",
  offline: "Hors ligne",
  online: "En ligne",
  cached: "Données en cache",
  syncNow: "Synchroniser",
  noConnection: "Pas de connexion. Données affichées en cache.",
  ussdHint: "Sans Internet : composez *888# pour cotiser par SMS",
  language: "Langue",
  notifications: "Notifications",
  about: "À propos",
  logout: "Déconnexion",
  version: "Version",
};

const en: Strings = {
  appName: "Tchoua",
  free: "100% Free · Open Source · Multi-Associations",
  login: "Sign in",
  email: "Email",
  password: "Password",
  signIn: "Sign in",
  loggingIn: "Signing in...",
  home: "Home",
  associations: "Associations",
  activities: "Activities",
  meetings: "Meetings",
  reports: "Reports",
  profile: "Profile",
  chat: "Chat",
  settings: "Settings",
  myAssociations: "My Associations",
  noAssociation: "No association yet",
  joinFirst: "Create or join an association to start",
  selectAssociation: "Select an association",
  active: "Active",
  members: "Members",
  contributed: "Contributed",
  received: "Received",
  reliability: "Reliability",
  loans: "Loans",
  caisse: "Treasury",
  createAssociation: "Create association",
  joinAssociation: "Join",
  pendingMember: "Pending",
  founder: "Founder",
  bureau: "Bureau",
  member: "Member",
  noActivity: "No activity",
  contribute: "Contribute",
  amount: "Amount",
  paymentMethod: "Payment method",
  cash: "Cash",
  mobileMoney: "Mobile Money",
  bank: "Bank transfer",
  pay: "Pay",
  upcomingSessions: "Upcoming sessions",
  upcoming: "Upcoming",
  past: "Past",
  noMeeting: "No meeting",
  attend: "Present",
  quorum: "Quorum",
  attendance: "Attendance",
  totalContributed: "Total contributed",
  totalReceived: "Total received",
  globalScore: "Overall score",
  confidential: "Confidential · only visible to you",
  loading: "Loading...",
  retry: "Retry",
  cancel: "Cancel",
  save: "Save",
  close: "Close",
  search: "Search",
  offline: "Offline",
  online: "Online",
  cached: "Cached data",
  syncNow: "Sync now",
  noConnection: "No connection. Displaying cached data.",
  ussdHint: "Offline: dial *888# to contribute via SMS",
  language: "Language",
  notifications: "Notifications",
  about: "About",
  logout: "Sign out",
  version: "Version",
};

// Local Cameroonian language support — basic key terms.
// Native speakers can extend these. Falls back to French for missing keys.
const ghomala: Partial<Strings> = {
  login: "Pô' kǎ",
  signIn: "Pô' kǎ",
  home: "Ndá",
  members: "Pɔ̌'",
  amount: "Mǎ'",
  pay: "Vùb",
  cash: "Mɔní",
  associations: "Pô' shyǎ",
  meetings: "Tʉ́m",
  loading: "Tʉ̀'...",
  cancel: "Yáa",
  save: "Bʉŋ",
  logout: "Lɛ́",
};

const ewondo: Partial<Strings> = {
  login: "Nyiñ",
  signIn: "Nyiñ",
  home: "Mvog",
  members: "Bot",
  amount: "Mone",
  pay: "Vaa",
  cash: "Mone",
  associations: "Mintaŋan",
  meetings: "Asoŋ",
  loading: "Edzag...",
  cancel: "Sai",
  save: "Bege",
  logout: "Kuli",
};

const douala: Partial<Strings> = {
  login: "Boyi",
  signIn: "Boyi",
  home: "Mboa",
  members: "Bato",
  amount: "Moni",
  pay: "Futa",
  cash: "Moni",
  associations: "Mwemba",
  meetings: "Loña",
  loading: "Edingiledi...",
  cancel: "Tika",
  save: "Bomba",
  logout: "Boa",
};

const fulfulde: Partial<Strings> = {
  login: "Naasta",
  signIn: "Naasta",
  home: "Galle",
  members: "Yimɓe",
  amount: "Ceede",
  pay: "Yoɓa",
  cash: "Ceede",
  associations: "Fedde",
  meetings: "Yiide",
  loading: "Hino tagga...",
  cancel: "Acca",
  save: "Marda",
  logout: "Yalta",
};

const mafa: Partial<Strings> = {
  login: "Hɗáy",
  signIn: "Hɗáy",
  home: "Wáy",
  members: "Mádàw",
  amount: "Sàn",
  pay: "Vìŋè",
  cash: "Sàn",
  associations: "Skú",
  meetings: "Wàŋèy",
  loading: "Á zlàʼà...",
  cancel: "Mbɛ́ɗ",
  save: "Ŋgàlè",
  logout: "Plàʼà",
};

const TABLES: Record<Lang, Strings> = {
  fr,
  en,
  ghomala: { ...fr, ...ghomala },
  ewondo: { ...fr, ...ewondo },
  douala: { ...fr, ...douala },
  fulfulde: { ...fr, ...fulfulde },
  mafa: { ...fr, ...mafa },
};

export function t(lang: Lang): Strings {
  return TABLES[lang] ?? TABLES.fr;
}

export const ALL_LANGS: Lang[] = ["fr", "en", "ghomala", "ewondo", "douala", "fulfulde", "mafa"];
