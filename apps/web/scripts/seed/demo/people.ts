/**
 * Demo Store People — team, individual customers and business accounts.
 *
 * Names, towns and company names are made up but follow the real distribution
 * of a seaside rental shop in southern Finistère: a core of local families,
 * a large share of French holidaymakers, a handful of foreign tourists, and
 * a set of recurring professional accounts (campsites, hotels, works councils).
 */

export interface DemoTeamMember {
  firstName: string;
  lastName: string;
  email: string;
  role: "owner" | "member";
  jobTitle: string;
}

export const DEMO_TEAM: DemoTeamMember[] = [
  {
    firstName: "Gwenaëlle",
    lastName: "Le Bris",
    email: "gwenaelle@armor-location.bzh",
    role: "owner",
    jobTitle: "Responsable boutique",
  },
  {
    firstName: "Malo",
    lastName: "Tanguy",
    email: "malo@armor-location.bzh",
    role: "member",
    jobTitle: "Mécanicien cycles",
  },
  {
    firstName: "Anaïs",
    lastName: "Guével",
    email: "anais@armor-location.bzh",
    role: "member",
    jobTitle: "Accueil et base nautique",
  },
  {
    firstName: "Ronan",
    lastName: "Quéméner",
    email: "ronan@armor-location.bzh",
    role: "member",
    jobTitle: "Livraisons",
  },
];

export const DEMO_PENDING_INVITATIONS = [
  { email: "saisonnier.ete@armor-location.bzh", role: "member" as const },
  { email: "comptabilite@cabinet-kerhuel.fr", role: "member" as const },
];

// ---------------------------------------------------------------------------
// Individual customers
// ---------------------------------------------------------------------------

export const FIRST_NAMES = [
  "Camille",
  "Yann",
  "Maëlle",
  "Erwan",
  "Soizic",
  "Gaël",
  "Nolwenn",
  "Tanguy",
  "Morgane",
  "Loïc",
  "Anne-Laure",
  "Ronan",
  "Élise",
  "Killian",
  "Awen",
  "Brieuc",
  "Julie",
  "Mathieu",
  "Sarah",
  "Antoine",
  "Clara",
  "Nicolas",
  "Léa",
  "Thomas",
  "Manon",
  "Julien",
  "Chloé",
  "Alexandre",
  "Emma",
  "Pierre",
  "Inès",
  "Guillaume",
  "Lucie",
  "Vincent",
  "Marion",
  "Sébastien",
  "Pauline",
  "David",
  "Céline",
  "Fabien",
  "Amandine",
  "Olivier",
  "Charlotte",
  "Benoît",
  "Justine",
  "Romain",
  "Sophie",
  "Maxime",
  "Aurélie",
  "Damien",
  "Hélène",
  "Bastien",
  "Margaux",
  "Quentin",
  "Océane",
  "Florian",
  "Anaïs",
  "Jérémy",
  "Laura",
  "Cédric",
  "Noémie",
  "Arnaud",
  "Alice",
  "Baptiste",
  "Marine",
  "Hugo",
  "Solène",
  "Adrien",
  "Jeanne",
  "Simon",
];

export const LAST_NAMES = [
  "Le Bris",
  "Guével",
  "Tanguy",
  "Le Goff",
  "Kerneis",
  "Quéméner",
  "Le Gall",
  "Riou",
  "Cariou",
  "Le Berre",
  "Jaouen",
  "Pennec",
  "Guillou",
  "Bourhis",
  "Le Roux",
  "Salaün",
  "Nédélec",
  "Le Dû",
  "Coïc",
  "Hénaff",
  "Bideau",
  "Corre",
  "Prigent",
  "Le Corre",
  "Colin",
  "Moreau",
  "Girard",
  "Lefèvre",
  "Fournier",
  "Mercier",
  "Blanchard",
  "Rousseau",
  "Chevalier",
  "Perrin",
  "Robin",
  "Clément",
  "Morel",
  "Fontaine",
  "Barbier",
  "Renaud",
  "Leclerc",
  "Marchand",
  "Dumont",
  "Roussel",
  "Gauthier",
  "Masson",
  "Denis",
  "Bertrand",
  "Noël",
  "Aubert",
];

/** Local customers — the year-round base. */
export const LOCAL_TOWNS = [
  { city: "Concarneau", postalCode: "29900" },
  { city: "Trégunc", postalCode: "29910" },
  { city: "Bénodet", postalCode: "29950" },
  { city: "Fouesnant", postalCode: "29170" },
  { city: "La Forêt-Fouesnant", postalCode: "29940" },
  { city: "Névez", postalCode: "29920" },
  { city: "Pont-Aven", postalCode: "29930" },
  { city: "Quimper", postalCode: "29000" },
  { city: "Rosporden", postalCode: "29140" },
  { city: "Melgven", postalCode: "29140" },
];

/** French holidaymakers — the summer wave. */
export const VISITOR_TOWNS = [
  { city: "Paris", postalCode: "75011" },
  { city: "Paris", postalCode: "75015" },
  { city: "Boulogne-Billancourt", postalCode: "92100" },
  { city: "Versailles", postalCode: "78000" },
  { city: "Rennes", postalCode: "35000" },
  { city: "Nantes", postalCode: "44000" },
  { city: "Angers", postalCode: "49000" },
  { city: "Tours", postalCode: "37000" },
  { city: "Bordeaux", postalCode: "33000" },
  { city: "Lyon", postalCode: "69003" },
  { city: "Toulouse", postalCode: "31000" },
  { city: "Lille", postalCode: "59000" },
  { city: "Rouen", postalCode: "76000" },
  { city: "Strasbourg", postalCode: "67000" },
  { city: "Orléans", postalCode: "45000" },
];

export const FOREIGN_CUSTOMERS = [
  { firstName: "Lukas", lastName: "Brandt", city: "Köln", postalCode: "50667", country: "DE" },
  { firstName: "Anke", lastName: "Vermeulen", city: "Utrecht", postalCode: "3511", country: "NL" },
  {
    firstName: "Sanne",
    lastName: "De Vries",
    city: "Amersfoort",
    postalCode: "3811",
    country: "NL",
  },
  {
    firstName: "Oliver",
    lastName: "Hawkins",
    city: "Bristol",
    postalCode: "BS1 4DJ",
    country: "GB",
  },
  {
    firstName: "Emily",
    lastName: "Sinclair",
    city: "Edinburgh",
    postalCode: "EH1 1BQ",
    country: "GB",
  },
  { firstName: "Wouter", lastName: "Claes", city: "Gent", postalCode: "9000", country: "BE" },
  { firstName: "Marta", lastName: "Ferrer", city: "Girona", postalCode: "17001", country: "ES" },
  { firstName: "Niels", lastName: "Jørgensen", city: "Århus", postalCode: "8000", country: "DK" },
  { firstName: "Stefan", lastName: "Huber", city: "Bern", postalCode: "3011", country: "CH" },
  { firstName: "Giulia", lastName: "Ferraro", city: "Bologna", postalCode: "40121", country: "IT" },
];

export const STREET_NAMES = [
  "rue des Sables Blancs",
  "quai Carnot",
  "rue Dumont d’Urville",
  "avenue de la Gare",
  "route de Beuzec",
  "impasse des Ajoncs",
  "rue de Kerandon",
  "allée des Genêts",
  "rue du Port",
  "chemin de Kersaux",
  "rue de la Croix",
  "boulevard Bougainville",
  "rue des Écoles",
  "place Jean Jaurès",
  "venelle du Moros",
  "rue de Trégunc",
  "rue Victor Hugo",
  "avenue des Tilleuls",
  "rue Pasteur",
  "allée du Vieux Puits",
];

/** Free-text notes staff actually leave on a customer file. */
export const CUSTOMER_NOTES = [
  "Client fidèle, vient chaque été depuis 2021.",
  "Préfère être appelé le matin.",
  "A déjà eu une crevaison non signalée — vérifier le retour.",
  "Loue toujours deux VAE taille M et L.",
  "Réserve pour tout le camping, groupe de 6 à 8 personnes.",
  "Habitant de Concarneau — tarif LOCAL29.",
  "Arrive en train, retrait à la boutique du centre.",
  "Demande systématiquement la livraison à Bénodet.",
  "Ne parle pas français, échanges en anglais.",
  "Paiement toujours en espèces au retrait.",
  "Sensible aux annulations météo, prévenir la veille.",
  "A cassé un dérailleur en 2025, réglé à l’amiable.",
];

// ---------------------------------------------------------------------------
// Business customers
// ---------------------------------------------------------------------------

export interface DemoBusinessCustomer {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  postalCode: string;
  address: string;
  notes: string;
}

export const DEMO_BUSINESS_CUSTOMERS: DemoBusinessCustomer[] = [
  {
    companyName: "Camping des Prés Verts",
    firstName: "Hervé",
    lastName: "Le Meur",
    email: "reservation@presverts-concarneau.fr",
    city: "Concarneau",
    postalCode: "29900",
    address: "Kernous-Plage",
    notes: "Compte pro — facturation mensuelle. 6 vélos bloqués en juillet-août.",
  },
  {
    companyName: "Hôtel de l’Océan",
    firstName: "Nathalie",
    lastName: "Cariou",
    email: "conciergerie@hotel-ocean-benodet.fr",
    city: "Bénodet",
    postalCode: "29950",
    address: "3 avenue de la Plage",
    notes: "Livraison à l’hôtel avant 9h. Facture au nom de l’établissement.",
  },
  {
    companyName: "Camping Yelloh Village Le Manoir",
    firstName: "Sébastien",
    lastName: "Prigent",
    email: "accueil@manoir-kerlut.fr",
    city: "Fouesnant",
    postalCode: "29170",
    address: "Route de Mousterlin",
    notes: "Partenariat saison : 10 % de remise négociée.",
  },
  {
    companyName: "CE Chantiers Piriou",
    firstName: "Isabelle",
    lastName: "Le Gall",
    email: "ce@piriou-ce.fr",
    city: "Concarneau",
    postalCode: "29900",
    address: "Zone portuaire",
    notes: "Sorties CE 2 fois par an, groupes de 15 à 25 personnes. Devis obligatoire.",
  },
  {
    companyName: "Office de Tourisme Concarneau Cornouaille",
    firstName: "Marc",
    lastName: "Jaouen",
    email: "partenaires@concarneau-tourisme.bzh",
    city: "Concarneau",
    postalCode: "29900",
    address: "Quai d’Aiguillon",
    notes: "Prêt de matériel pour les eductours presse. Gratuité accordée.",
  },
  {
    companyName: "Colonie Les Mouettes",
    firstName: "Sandrine",
    lastName: "Bourhis",
    email: "direction@colo-lesmouettes.org",
    city: "Trégunc",
    postalCode: "29910",
    address: "Pointe de Trévignon",
    notes: "Réserve 12 vélos enfants + casques chaque juillet. Paiement par mandat administratif.",
  },
  {
    companyName: "Résidence Pierre & Vacances Cap Coz",
    firstName: "Damien",
    lastName: "Hénaff",
    email: "accueil.capcoz@pv-holidays.fr",
    city: "Fouesnant",
    postalCode: "29170",
    address: "Pointe du Cap Coz",
    notes: "Demande un stock dédié le samedi (jour d’arrivée des résidents).",
  },
  {
    companyName: "Vedettes de l’Odet",
    firstName: "Erwan",
    lastName: "Salaün",
    email: "groupes@vedettes-odet.com",
    city: "Bénodet",
    postalCode: "29950",
    address: "Port de plaisance",
    notes: "Offre combinée bateau + vélo (code GLENAN5).",
  },
  {
    companyName: "Mairie de Trégunc",
    firstName: "Christelle",
    lastName: "Nédélec",
    email: "services.techniques@tregunc.bzh",
    city: "Trégunc",
    postalCode: "29910",
    address: "Place de la Mairie",
    notes: "Semaine de la mobilité en septembre. Bon de commande obligatoire.",
  },
  {
    companyName: "Ker Ys Séminaires",
    firstName: "Antoine",
    lastName: "Le Dû",
    email: "contact@kerys-seminaires.fr",
    city: "La Forêt-Fouesnant",
    postalCode: "29940",
    address: "18 rue du Port-la-Forêt",
    notes: "Team building entreprises. Facturation à 30 jours.",
  },
  {
    companyName: "Camping Les Genêts d’Or",
    firstName: "Yannick",
    lastName: "Coïc",
    email: "contact@genetsdor-nevez.fr",
    city: "Névez",
    postalCode: "29920",
    address: "Route de Kerascoët",
    notes: "Petit camping familial, 2 à 4 vélos par semaine en été.",
  },
  {
    companyName: "Thalasso Concarneau",
    firstName: "Valérie",
    lastName: "Riou",
    email: "sport@thalasso-concarneau.fr",
    city: "Concarneau",
    postalCode: "29900",
    address: "Plage des Sables Blancs",
    notes: "Sorties longe-côte et paddle pour les curistes, tous les mardis en saison.",
  },
];
