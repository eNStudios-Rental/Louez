/**
 * Demo Store Catalog — "Ar Mor Location" (Concarneau, Finistère)
 *
 * Hand-curated catalog used by the demo seed. Unlike the randomised
 * multi-store seed, every product here has realistic naming, copy, pricing
 * ladders and stock so the dashboard and storefront look like a real,
 * running business in demo videos.
 */

// ---------------------------------------------------------------------------
// Product photos
//
// Real photos already hosted on the platform's object storage (reused from
// existing dev stores) plus photos uploaded for this demo store. Keeping them
// on *.scw.cloud means they resolve through next/image with no config change.
// ---------------------------------------------------------------------------

const S3 = "https://louez.s3.fr-par.scw.cloud";
const S3_DEV = "https://louez-dev.s3.fr-par.scw.cloud";
const HUELGOAT = `${S3}/zrTri2EB7L-hyaXulZP9s/products`;
const BELLE_ILE = `${S3}/2cYHEFDVfZoGJyjR7AoEk/products`;
const RIBINE = `${S3}/R5Sn6RXEkh12ZkS7TJ-vz/products`;
const COMPLICES = `${S3}/QScB8hHBo5XqSPgVaEZ97/products`;
const REMORQUE = `${S3_DEV}/VKJ7f7GnmFyabDmbqOxpm/products`;

export const IMG = {
  vaeTrekking: `${HUELGOAT}/product-1773332881103-0-naIN-Sdzmo.png`,
  vaeTrekkingAlt: `${HUELGOAT}/product-1773332097940-0-Aumwpln33P.png`,
  vaeCity: `${HUELGOAT}/product-1773402288558-0-g-fv4koeTR.png`,
  vaeCityAlt: `${HUELGOAT}/product-1773333068956-0-_ywhpLfaBH.png`,
  vttae: `${HUELGOAT}/product-1771433687090-wJbgtIVlJY.jpg`,
  vttaeAlt: `${HUELGOAT}/product-1773329458452-0-JR6SqSPWqK.png`,
  vttaeAlt2: `${HUELGOAT}/product-1773329480751-0-Yz6_hyuNmm.png`,
  fatbike: `${BELLE_ILE}/product-1771836874654-0-rXPwF-wNsJ.jpg`,
  vaeConfort: `${BELLE_ILE}/product-1771836676194-0-FY7w1cuu5H.jpg`,
  vaeConfortAlt: `${BELLE_ILE}/product-1771835474760-0-LjvK3CdnW1.jpg`,
  vaePremium: `${BELLE_ILE}/product-1771779569923-0-f6vthRDLHj.webp`,
  cargoE: `${RIBINE}/product-1769804082260-Jx4ktvaE6I.jpg`,
  longtail: `${COMPLICES}/product-1770388422662-GBH_Cexv89.png`,
  voyageE: `${RIBINE}/product-1769803427961-eGbyxuye-M.jpg`,
  voyageEAlt: `${RIBINE}/product-1773056921630-0-MmQsV8-Ait.jpg`,
  city: `${COMPLICES}/product-1770282330519-9kJ-A7SZQN.jpg`,
  cityAlt: `${COMPLICES}/product-1772723999922-0-g4J97kWfif.jpg`,
  cityAlt2: `${COMPLICES}/product-1770304427428-_bpPkuBs0O.png`,
  rando: `${COMPLICES}/product-1770304553134-96UTXa1IDJ.png`,
  randoAlt: `${COMPLICES}/product-1770304788391-vxj2uxyKJJ.png`,
  randoAlt2: `${COMPLICES}/product-1772554570888-0-dCmlPEHYrL.jpg`,
  balade: `${RIBINE}/product-1769803125913-bkn5UDvv0k.jpg`,
  gravel: `${RIBINE}/product-1773056717999-0-0y6Cl4po_n.png`,
  gravelAlt: `${RIBINE}/product-1773056735877-0-j33jKczmcU.png`,
  gravelAlt2: `${RIBINE}/product-1773056756611-0-cehCz1hsvo.png`,
  route: `${RIBINE}/product-1769802403884-a6RhhEXWTz.jpg`,
  routeAlt: `${RIBINE}/product-1769802534495-A10muxsj2Z.jpg`,
  voyage: `${RIBINE}/product-1776421664073-0-UaFGbhexRl.png`,
  voyageAlt: `${RIBINE}/product-1776421686326-0-VHhl4MiChk.png`,
  kid20: `${RIBINE}/product-1769768797262-CpsHacYGBe.jpg`,
  kid24: `${RIBINE}/product-1769768745658-ZMfQZgzc65.jpg`,
  kid20Alt: `${COMPLICES}/product-1770388730587-MCQNuNU3dT.png`,
  trailerKid: `${RIBINE}/product-1769769078806-t16ZpxooEj.jpg`,
  trailerKidAlt: `${COMPLICES}/product-1770388933342-vKIGNfQfDU.jpg`,
  childSeat: `${RIBINE}/product-1769768938651-d9VP0_IIMZ.webp`,
  childSeatAlt: `${COMPLICES}/product-1770389053361-68xHJvbJzp.png`,
  panniers: `${RIBINE}/product-1769768887867-tUS0fwfOJN.jpg`,
  panniersAlt: `${HUELGOAT}/product-1773424110201-0-KvywHvtEPW.png`,
  tent2: `${RIBINE}/product-1769769004552-CjKwxjfGcD.jpg`,
  helmet: `${REMORQUE}/product-1771507974660-0-hguDDZQrYB.png`,
  helmetAlt: `${REMORQUE}/product-1771422168781-0-_9LtedDjRf.png`,
} as const;

/**
 * Photos uploaded to object storage by `scripts/seed/demo/upload-images.ts`.
 * The upload writes `demo-images.json` next to this file; when it is missing
 * the catalog falls back to the reused photos above so the seed never breaks.
 */
export type SourcedImageKey =
  | "sup"
  | "supRigid"
  | "kayak"
  | "kayak2"
  | "wetsuit"
  | "wing"
  | "tent4"
  | "sleepingBag"
  | "mattress"
  | "stove"
  | "lock"
  | "gps"
  | "repairKit"
  | "basket"
  | "trailgator"
  | "carrier"
  | "cargoTrailer"
  | "balanceBike"
  | "tandem"
  | "folding";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoRate {
  /** Period in minutes (1440 = 1 day, 10080 = 1 week) */
  period: number;
  price: number;
}

export interface DemoSeason {
  name: string;
  /** MM-DD — resolved against the seeded years at runtime */
  startMonthDay: string;
  endMonthDay: string;
  /** Multiplier applied to the base price and every rate */
  multiplier: number;
}

export interface DemoAxis {
  key: string;
  label: string;
  position: number;
}

export interface DemoUnitSpec {
  attributes?: Record<string, string>;
  count: number;
}

export interface DemoProduct {
  /** Stable key used to reference the product from reservations */
  key: string;
  name: string;
  category: string;
  description: string;
  aiContext?: string;
  images: string[];
  /** Sourced photo used in place of `images` when the upload ran */
  sourcedImage?: SourcedImageKey;
  price: number;
  basePeriodMinutes: number;
  pricingMode: "hour" | "day" | "week";
  deposit: number;
  rates: DemoRate[];
  enforceStrictTiers: boolean;
  /** Stock for products without unit tracking */
  quantity: number;
  trackUnits: boolean;
  axes?: DemoAxis[];
  units?: DemoUnitSpec[];
  unitPrefix?: string;
  status: "active" | "draft" | "archived";
  /** Relative booking weight (1 = rare, 10 = best seller) */
  popularity: number;
  /** Custom VAT rate; inherits the store rate when omitted */
  taxRate?: number;
  seasons?: DemoSeason[];
  /** Offered as an add-on on the storefront */
  isAccessory?: boolean;
  /** Average unit purchase price, used to seed inventory asset values */
  unitPurchasePrice?: number;
}

// ---------------------------------------------------------------------------
// Pricing helpers
// ---------------------------------------------------------------------------

const DAY = 1440;
const HALF_DAY = 240;

/**
 * Build the usual French rental ladder from a daily price: the longer the
 * rental, the lower the per-day rate. Prices are rounded to whole euros,
 * which is what shops actually display.
 */
function dayLadder(daily: number, opts: { halfDay?: number; weeks?: boolean } = {}): DemoRate[] {
  const rates: DemoRate[] = [
    { period: 2 * DAY, price: Math.round(daily * 2 * 0.9) },
    { period: 3 * DAY, price: Math.round(daily * 3 * 0.85) },
    { period: 7 * DAY, price: Math.round(daily * 7 * 0.7) },
  ];
  if (opts.weeks !== false) {
    rates.push({ period: 14 * DAY, price: Math.round(daily * 14 * 0.6) });
  }
  return rates;
}

/** Half-day based ladder for water sports (4h base). */
function hourLadder(halfDay: number): DemoRate[] {
  return [
    { period: 480, price: Math.round(halfDay * 1.6) },
    { period: DAY, price: Math.round(halfDay * 2.1) },
    { period: 2 * DAY, price: Math.round(halfDay * 3.6) },
    { period: 7 * DAY, price: Math.round(halfDay * 10) },
  ];
}

/** July–August peak season, the reality of a Breton seaside rental shop. */
const HIGH_SEASON: DemoSeason = {
  name: "Haute saison",
  startMonthDay: "07-01",
  endMonthDay: "08-31",
  multiplier: 1.25,
};

const SHOULDER_SEASON: DemoSeason = {
  name: "Vacances de printemps",
  startMonthDay: "04-05",
  endMonthDay: "05-11",
  multiplier: 1.1,
};

// ---------------------------------------------------------------------------
// Store identity
// ---------------------------------------------------------------------------

export const DEMO_STORE = {
  name: "Ar Mor Location",
  slug: "ar-mor-location",
  description:
    "<p><strong>Location de vélos, VAE, paddles, kayaks et matériel de bivouac à Concarneau.</strong></p><p>Depuis 2019, on équipe les habitants du Pays Fouesnantais et les vacanciers pour explorer la côte, la voie verte et les Glénan. Matériel révisé après chaque location, casques et antivols fournis, livraison possible sur tout le sud Finistère.</p>",
  email: "contact@armor-location.bzh",
  phone: "02 98 97 41 62",
  ownerPhone: "+33612345678",
  address: "14 quai d'Aiguillon, 29900 Concarneau",
  city: "Concarneau",
  postalCode: "29900",
  latitude: "47.8724000",
  longitude: "-3.9186000",
  vatNumber: "FR64891204773",
  primaryColor: "#0E7490",
} as const;

export const DEMO_LOCATIONS = [
  {
    name: "Base nautique de Bénodet",
    address: "Port de plaisance, 2 avenue de la Plage",
    city: "Bénodet",
    postalCode: "29950",
    latitude: "47.8720000",
    longitude: "-4.1050000",
    isActive: true,
  },
  {
    name: "Dépôt de Trégunc",
    address: "7 route de Pont-Aven, zone de Kersalé",
    city: "Trégunc",
    postalCode: "29910",
    latitude: "47.8560000",
    longitude: "-3.8530000",
    isActive: true,
  },
  {
    name: "Point relais Camping des Prés Verts",
    address: "Kernous-Plage",
    city: "Concarneau",
    postalCode: "29900",
    latitude: "47.8631000",
    longitude: "-3.9435000",
    isActive: false,
  },
];

export const DEMO_CATEGORIES = [
  {
    name: "Vélos & VAE",
    description:
      "Vélos de ville, VTC, gravel, VTT électriques et vélos cargo. Tous révisés et livrés avec casque et antivol.",
    order: 0,
  },
  {
    name: "Nautisme",
    description:
      "Paddles, kayaks et combinaisons pour explorer la baie, l’anse de Kersaux et l’archipel des Glénan.",
    order: 1,
  },
  {
    name: "Remorques & portage",
    description:
      "Remorques enfant et cargo, porte-vélos et sacoches pour partir chargé sans se compliquer la vie.",
    order: 2,
  },
  {
    name: "Camping & bivouac",
    description:
      "Tentes, couchage et cuisine pour un week-end sur la voie verte ou une itinérance à vélo.",
    order: 3,
  },
  {
    name: "Accessoires",
    description:
      "Casques, sièges enfant, antivols, GPS et petit matériel à ajouter à votre location.",
    order: 4,
  },
];

export const DEMO_VARIANT_DEFINITIONS = [
  {
    key: "taille",
    label: "Taille",
    kind: "size" as const,
    values: [
      { label: "XS", position: 0 },
      { label: "S", position: 1 },
      { label: "M", position: 2 },
      { label: "L", position: 3 },
      { label: "XL", position: 4 },
    ],
  },
  {
    key: "couleur",
    label: "Couleur",
    kind: "color" as const,
    values: [
      { label: "Noir", colorHex: "#111827", position: 0 },
      { label: "Bleu lagon", colorHex: "#0EA5E9", position: 1 },
      { label: "Vert forêt", colorHex: "#15803D", position: 2 },
      { label: "Sable", colorHex: "#D6C6A8", position: 3 },
    ],
  },
];

const TAILLE_AXIS: DemoAxis[] = [{ key: "taille", label: "Taille", position: 0 }];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ---------------------------------------------------------------- Vélos & VAE
  {
    key: "vae-trekking",
    name: "VAE trekking Riverside 540 E",
    category: "Vélos & VAE",
    description:
      "<p>Le vélo à assistance électrique le plus polyvalent de la flotte. Moteur central, batterie 500 Wh (80 à 110 km d'autonomie selon le vent), porte-bagages compatible sacoches et éclairage intégré.</p><p>Idéal pour la voie verte Concarneau–Rosporden et les boucles côtières.</p>",
    aiContext:
      "Convient à partir de 1m60. Autonomie réelle 80 km avec du vent de face. Batterie chargée à 100% au départ, chargeur prêté sur demande pour les locations de 3 jours et plus. Ne pas proposer pour du VTT engagé.",
    images: [IMG.vaeTrekking, IMG.vaeTrekkingAlt],
    price: 32,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 800,
    rates: dayLadder(32),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    axes: TAILLE_AXIS,
    units: [
      { attributes: { taille: "S" }, count: 2 },
      { attributes: { taille: "M" }, count: 3 },
      { attributes: { taille: "L" }, count: 3 },
      { attributes: { taille: "XL" }, count: 1 },
    ],
    unitPrefix: "VAE-TRK",
    status: "active",
    popularity: 10,
    seasons: [HIGH_SEASON, SHOULDER_SEASON],
    unitPurchasePrice: 1890,
  },
  {
    key: "vae-confort",
    name: "VAE ville confort Vitality",
    category: "Vélos & VAE",
    description:
      "<p>Cadre bas très accessible, selle large et position droite. Le choix numéro un des vacanciers qui veulent flâner sur le port sans transpirer.</p>",
    aiContext:
      "Cadre bas, montée facile, parfait pour les seniors et les personnes qui ne font pas de vélo régulièrement. Vitesse limitée à 25 km/h.",
    images: [IMG.vaeConfort, IMG.vaeConfortAlt],
    price: 28,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 700,
    rates: dayLadder(28),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    axes: TAILLE_AXIS,
    units: [
      { attributes: { taille: "S" }, count: 3 },
      { attributes: { taille: "M" }, count: 3 },
      { attributes: { taille: "L" }, count: 2 },
    ],
    unitPrefix: "VAE-CFT",
    status: "active",
    popularity: 9,
    seasons: [HIGH_SEASON],
    unitPurchasePrice: 1650,
  },
  {
    key: "vttae",
    name: "VTT électrique Rockrider E-Feel 5",
    category: "Vélos & VAE",
    description:
      '<p>Semi-rigide 29", fourche 100 mm, freins à disque hydrauliques. Pour les chemins côtiers, la forêt de Coat-Loc’h et les sentiers du Pays Fouesnantais.</p>',
    aiContext:
      "Réservé aux pratiquants habitués au VTT. Casque obligatoire, fourni. Interdiction formelle sur le sentier des douaniers (GR34) pour les groupes de plus de 4.",
    images: [IMG.vttae, IMG.vttaeAlt, IMG.vttaeAlt2],
    price: 42,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 1000,
    rates: dayLadder(42),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    axes: TAILLE_AXIS,
    units: [
      { attributes: { taille: "M" }, count: 2 },
      { attributes: { taille: "L" }, count: 3 },
      { attributes: { taille: "XL" }, count: 1 },
    ],
    unitPrefix: "VTTAE",
    status: "active",
    popularity: 7,
    seasons: [HIGH_SEASON],
    unitPurchasePrice: 2450,
  },
  {
    key: "gravel",
    name: "Gravel Triban GRVL 520",
    category: "Vélos & VAE",
    description:
      "<p>Cadre alu, transmission GRX, pneus 42 mm. Le vélo idéal pour enchaîner routes côtières et chemins blancs jusqu’à Pont-Aven.</p><p>Livré avec porte-bidon et compteur.</p>",
    images: [IMG.gravel, IMG.gravelAlt, IMG.gravelAlt2],
    price: 26,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 600,
    rates: dayLadder(26),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    axes: TAILLE_AXIS,
    units: [
      { attributes: { taille: "S" }, count: 2 },
      { attributes: { taille: "M" }, count: 2 },
      { attributes: { taille: "L" }, count: 2 },
    ],
    unitPrefix: "GRVL",
    status: "active",
    popularity: 6,
    seasons: [HIGH_SEASON],
    unitPurchasePrice: 1150,
  },
  {
    key: "voyage",
    name: "Vélo de voyage équipé (sacoches incluses)",
    category: "Vélos & VAE",
    description:
      "<p>Vélo de randonnée acier, porte-bagages avant et arrière, paire de sacoches Ortlieb 40 L incluse. Prêt à partir sur la Vélodyssée ou la V45.</p>",
    aiContext:
      "Location minimum 2 jours. Sacoches étanches incluses dans le prix. Proposer systématiquement le pack bivouac en complément.",
    images: [IMG.voyage, IMG.voyageAlt],
    price: 30,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 650,
    rates: dayLadder(30),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    axes: TAILLE_AXIS,
    units: [
      { attributes: { taille: "S" }, count: 2 },
      { attributes: { taille: "M" }, count: 3 },
      { attributes: { taille: "L" }, count: 2 },
    ],
    unitPrefix: "VOY",
    status: "active",
    popularity: 6,
    seasons: [HIGH_SEASON],
    unitPurchasePrice: 1290,
  },
  {
    key: "ville",
    name: "Vélo de ville classique",
    category: "Vélos & VAE",
    description:
      "<p>7 vitesses, panier avant, béquille et éclairage dynamo. Le vélo simple et increvable pour le centre-ville et le bord de mer.</p>",
    images: [IMG.city, IMG.cityAlt, IMG.cityAlt2],
    price: 12,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 250,
    rates: dayLadder(12),
    enforceStrictTiers: false,
    quantity: 14,
    trackUnits: false,
    status: "active",
    popularity: 10,
    seasons: [HIGH_SEASON, SHOULDER_SEASON],
  },
  {
    key: "rando",
    name: "VTC randonnée Escape 2",
    category: "Vélos & VAE",
    description:
      "<p>VTC musculaire léger, 24 vitesses, pneus 40 mm. Bon compromis entre le vélo de ville et le gravel pour la voie verte.</p>",
    images: [IMG.rando, IMG.randoAlt, IMG.randoAlt2],
    price: 16,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 350,
    rates: dayLadder(16),
    enforceStrictTiers: false,
    quantity: 10,
    trackUnits: false,
    status: "active",
    popularity: 8,
    seasons: [HIGH_SEASON],
  },
  {
    key: "cargo",
    name: "Vélo cargo électrique biporteur",
    category: "Vélos & VAE",
    description:
      "<p>Biporteur électrique avec caisse 2 places enfants, ceintures et bâche pluie. Charge utile 100 kg.</p>",
    aiContext:
      "Prise en main indispensable avant le départ (15 min sur le parking). Refuser la location aux clients qui n’ont jamais fait de vélo. Non livrable, retrait boutique uniquement.",
    images: [IMG.cargoE, IMG.longtail],
    price: 48,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 1500,
    rates: dayLadder(48),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    unitPrefix: "CARGO",
    units: [{ count: 2 }],
    status: "active",
    popularity: 4,
    unitPurchasePrice: 4200,
  },
  {
    key: "longtail",
    name: "Longtail électrique 3 places",
    category: "Vélos & VAE",
    description:
      "<p>Rallongé électrique avec double siège enfant et repose-pieds. L’alternative à la voiture pour une semaine de vacances en famille.</p>",
    images: [IMG.longtail, IMG.cargoE],
    price: 45,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 1400,
    rates: dayLadder(45),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    unitPrefix: "LONG",
    units: [{ count: 2 }],
    status: "active",
    popularity: 4,
    unitPurchasePrice: 3900,
  },
  {
    key: "pliant",
    name: "Vélo pliant Brompton M6L",
    category: "Vélos & VAE",
    description:
      "<p>Se plie en 20 secondes, rentre dans un coffre ou sur un bateau. Très demandé par les plaisanciers du port.</p>",
    sourcedImage: "folding",
    images: [IMG.cityAlt2],
    price: 20,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 900,
    rates: dayLadder(20),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    unitPrefix: "BROM",
    units: [{ count: 3 }],
    status: "active",
    popularity: 5,
    unitPurchasePrice: 1450,
  },
  {
    key: "tandem",
    name: "Tandem route",
    category: "Vélos & VAE",
    description:
      "<p>Tandem alu 27 vitesses. Convient à deux adultes ou un adulte et un ado. Réservation conseillée, on n’en a que deux.</p>",
    sourcedImage: "tandem",
    images: [IMG.route],
    price: 34,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 700,
    rates: dayLadder(34),
    enforceStrictTiers: true,
    quantity: 2,
    trackUnits: false,
    status: "active",
    popularity: 3,
  },
  {
    key: "kid-20",
    name: 'Vélo enfant 20" (6-9 ans)',
    category: "Vélos & VAE",
    description:
      "<p>Vélo 20 pouces, 6 vitesses, freins adaptés aux petites mains. Casque enfant offert avec la location.</p>",
    images: [IMG.kid20, IMG.kid20Alt],
    price: 9,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 150,
    rates: dayLadder(9),
    enforceStrictTiers: true,
    quantity: 8,
    trackUnits: false,
    status: "active",
    popularity: 7,
    seasons: [HIGH_SEASON],
  },
  {
    key: "kid-24",
    name: 'Vélo enfant 24" (9-12 ans)',
    category: "Vélos & VAE",
    description: "<p>Vélo 24 pouces, 18 vitesses. Casque enfant offert avec la location.</p>",
    images: [IMG.kid24, IMG.kid20],
    price: 10,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 150,
    rates: dayLadder(10),
    enforceStrictTiers: true,
    quantity: 6,
    trackUnits: false,
    status: "active",
    popularity: 6,
    seasons: [HIGH_SEASON],
  },
  {
    key: "draisienne",
    name: "Draisienne 2-4 ans",
    category: "Vélos & VAE",
    description:
      "<p>Draisienne bois, selle réglable. Pour que les plus petits suivent la balade familiale.</p>",
    sourcedImage: "balanceBike",
    images: [IMG.kid20Alt],
    price: 5,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 80,
    rates: dayLadder(5),
    enforceStrictTiers: true,
    quantity: 6,
    trackUnits: false,
    status: "active",
    popularity: 5,
  },
  {
    key: "fatbike",
    name: "Fat bike électrique plage",
    category: "Vélos & VAE",
    description:
      "<p>Pneus 4 pouces pour rouler sur le sable dur à marée basse. Sortie encadrée possible le samedi matin.</p>",
    images: [IMG.fatbike, IMG.vaePremium],
    price: 38,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 900,
    rates: dayLadder(38),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: true,
    unitPrefix: "FAT",
    units: [{ count: 3 }],
    status: "active",
    popularity: 4,
    seasons: [HIGH_SEASON],
    unitPurchasePrice: 2100,
  },

  // ------------------------------------------------------------------ Nautisme
  {
    key: "sup-gonflable",
    name: "Paddle gonflable 10'6 + pagaie",
    category: "Nautisme",
    description:
      "<p>Stand up paddle gonflable stable, livré avec pagaie réglable, leash, gonfleur et sac de portage. Parfait pour la rivière du Moros et la baie par temps calme.</p>",
    aiContext:
      "Ne pas louer si le vent annoncé dépasse 15 nœuds de secteur nord. Gilet obligatoire fourni. Interdit aux moins de 12 ans sans adulte.",
    sourcedImage: "sup",
    images: [],
    price: 18,
    basePeriodMinutes: HALF_DAY,
    pricingMode: "hour",
    deposit: 300,
    rates: hourLadder(18),
    enforceStrictTiers: true,
    quantity: 10,
    trackUnits: false,
    status: "active",
    popularity: 10,
    seasons: [HIGH_SEASON],
  },
  {
    key: "sup-rigide",
    name: "Paddle rigide performance 12'6",
    category: "Nautisme",
    description:
      "<p>Paddle rigide carbone pour les pratiquants confirmés qui veulent faire de la distance vers les Glénan.</p>",
    sourcedImage: "supRigid",
    images: [],
    price: 26,
    basePeriodMinutes: HALF_DAY,
    pricingMode: "hour",
    deposit: 500,
    rates: hourLadder(26),
    enforceStrictTiers: true,
    quantity: 3,
    trackUnits: false,
    status: "active",
    popularity: 4,
    seasons: [HIGH_SEASON],
  },
  {
    key: "kayak-1",
    name: "Kayak de mer monoplace",
    category: "Nautisme",
    description:
      "<p>Sit-on-top monoplace insubmersible, avec pagaie, gilet et bidon étanche. Briefing sécurité de 10 minutes inclus.</p>",
    sourcedImage: "kayak",
    images: [],
    price: 20,
    basePeriodMinutes: HALF_DAY,
    pricingMode: "hour",
    deposit: 350,
    rates: hourLadder(20),
    enforceStrictTiers: true,
    quantity: 8,
    trackUnits: false,
    status: "active",
    popularity: 9,
    seasons: [HIGH_SEASON],
  },
  {
    key: "kayak-2",
    name: "Kayak de mer biplace",
    category: "Nautisme",
    description:
      "<p>Sit-on-top 2 places (+ 1 enfant au centre), deux pagaies et deux gilets fournis.</p>",
    sourcedImage: "kayak2",
    images: [],
    price: 30,
    basePeriodMinutes: HALF_DAY,
    pricingMode: "hour",
    deposit: 450,
    rates: hourLadder(30),
    enforceStrictTiers: true,
    quantity: 5,
    trackUnits: false,
    status: "active",
    popularity: 8,
    seasons: [HIGH_SEASON],
  },
  {
    key: "combinaison",
    name: "Combinaison néoprène 3/2 mm",
    category: "Nautisme",
    description:
      "<p>Combinaison intégrale 3/2 mm, rincée et séchée après chaque location. Tailles enfant 8 ans à adulte XL.</p>",
    sourcedImage: "wetsuit",
    images: [],
    price: 8,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 60,
    rates: dayLadder(8),
    enforceStrictTiers: false,
    quantity: 16,
    trackUnits: false,
    status: "active",
    popularity: 7,
    isAccessory: true,
    seasons: [HIGH_SEASON],
  },
  {
    key: "wingfoil",
    name: "Pack wingfoil découverte",
    category: "Nautisme",
    description:
      "<p>Planche, foil et aile 5 m². Location réservée aux pratiquants autonomes, sur présentation d’une attestation de niveau.</p>",
    aiContext:
      "Location réservée aux pratiquants autonomes. Toujours demander le niveau et l’assurance responsabilité civile avant de valider. Ne jamais confirmer une réservation wingfoil sans validation humaine.",
    sourcedImage: "wing",
    images: [],
    price: 55,
    basePeriodMinutes: HALF_DAY,
    pricingMode: "hour",
    deposit: 1200,
    rates: hourLadder(55),
    enforceStrictTiers: true,
    quantity: 2,
    trackUnits: false,
    status: "active",
    popularity: 2,
    seasons: [HIGH_SEASON],
  },

  // -------------------------------------------------------- Remorques & portage
  {
    key: "remorque-enfant",
    name: "Remorque enfant Croozer Kid Plus 2 places",
    category: "Remorques & portage",
    description:
      "<p>Remorque 2 places convertible en poussette, suspension, moustiquaire et habillage pluie. Attelage universel fourni.</p>",
    images: [IMG.trailerKid, IMG.trailerKidAlt],
    price: 14,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 400,
    rates: dayLadder(14),
    enforceStrictTiers: true,
    quantity: 5,
    trackUnits: false,
    status: "active",
    popularity: 8,
    isAccessory: true,
    seasons: [HIGH_SEASON],
  },
  {
    key: "remorque-cargo",
    name: "Remorque cargo Carry Freedom",
    category: "Remorques & portage",
    description:
      "<p>Plateau 60 kg pour transporter les courses, une planche de surf ou du matériel de camping.</p>",
    sourcedImage: "cargoTrailer",
    images: [IMG.trailerKidAlt],
    price: 11,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 300,
    rates: dayLadder(11),
    enforceStrictTiers: true,
    quantity: 3,
    trackUnits: false,
    status: "active",
    popularity: 3,
    isAccessory: true,
  },
  {
    key: "porte-velos",
    name: "Porte-vélos attelage 3 vélos",
    category: "Remorques & portage",
    description:
      "<p>Porte-vélos plateforme basculant, compatible VAE (60 kg). Faisceau 13 broches, adaptateur 7 broches fourni.</p>",
    sourcedImage: "carrier",
    images: [],
    price: 16,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 350,
    rates: dayLadder(16),
    enforceStrictTiers: true,
    quantity: 4,
    trackUnits: false,
    status: "active",
    popularity: 4,
  },
  {
    key: "sacoches",
    name: "Paire de sacoches étanches Ortlieb 40 L",
    category: "Remorques & portage",
    description:
      "<p>Sacoches arrière étanches, fixation Quick-Lock. Vendues par paire, à ajouter à n’importe quel vélo.</p>",
    images: [IMG.panniers, IMG.panniersAlt],
    price: 6,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 120,
    rates: dayLadder(6),
    enforceStrictTiers: false,
    quantity: 12,
    trackUnits: false,
    status: "active",
    popularity: 6,
    isAccessory: true,
  },

  // -------------------------------------------------------- Camping & bivouac
  {
    key: "tente-2",
    name: "Tente 2 places MT900",
    category: "Camping & bivouac",
    description:
      "<p>Tente dôme 2 places, 2,4 kg, double toit imperméable 3000 mm. Compacte, elle rentre dans une sacoche arrière.</p>",
    images: [IMG.tent2],
    price: 15,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 250,
    rates: dayLadder(15),
    enforceStrictTiers: true,
    quantity: 7,
    trackUnits: false,
    status: "active",
    popularity: 6,
    seasons: [HIGH_SEASON],
  },
  {
    key: "tente-4",
    name: "Tente 4 places dôme familiale",
    category: "Camping & bivouac",
    description:
      "<p>Tente 4 places avec abside, hauteur sous plafond 1,90 m. Pour les séjours au camping plutôt que l’itinérance.</p>",
    sourcedImage: "tent4",
    images: [IMG.tent2],
    price: 22,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 350,
    rates: dayLadder(22),
    enforceStrictTiers: true,
    quantity: 4,
    trackUnits: false,
    status: "active",
    popularity: 4,
    seasons: [HIGH_SEASON],
  },
  {
    key: "sac-couchage",
    name: "Sac de couchage confort 5 °C",
    category: "Camping & bivouac",
    description:
      "<p>Sac de couchage sarcophage, température confort 5 °C. Drap de sac jetable fourni, lavage après chaque location.</p>",
    sourcedImage: "sleepingBag",
    images: [],
    price: 6,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 60,
    rates: dayLadder(6),
    enforceStrictTiers: true,
    quantity: 14,
    trackUnits: false,
    status: "active",
    popularity: 6,
    isAccessory: true,
  },
  {
    key: "matelas",
    name: "Matelas autogonflant 5 cm",
    category: "Camping & bivouac",
    description:
      "<p>Matelas autogonflant compact, R-value 3. Se roule à la taille d’une bouteille d’eau.</p>",
    sourcedImage: "mattress",
    images: [],
    price: 5,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 50,
    rates: dayLadder(5),
    enforceStrictTiers: true,
    quantity: 14,
    trackUnits: false,
    status: "active",
    popularity: 6,
    isAccessory: true,
  },
  {
    key: "rechaud",
    name: "Réchaud + popote 2 personnes",
    category: "Camping & bivouac",
    description:
      "<p>Réchaud gaz compact, popote 2 pièces, couverts. Cartouche de gaz vendue séparément à la boutique.</p>",
    sourcedImage: "stove",
    images: [],
    price: 5,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 50,
    rates: dayLadder(5),
    enforceStrictTiers: true,
    quantity: 9,
    trackUnits: false,
    status: "active",
    popularity: 5,
    isAccessory: true,
  },
  {
    key: "pack-bivouac",
    name: "Pack bivouac vélo complet",
    category: "Camping & bivouac",
    description:
      "<p>Tente 2 places + 2 sacs de couchage + 2 matelas + réchaud et popote, le tout conditionné pour tenir dans deux sacoches.</p><p>Formule la plus louée sur la Vélodyssée.</p>",
    aiContext:
      "Pack pensé pour deux personnes en itinérance. Toujours vérifier que le client loue aussi un vélo avec porte-bagages (voyage, gravel ou VTC randonnée).",
    images: [IMG.tent2],
    sourcedImage: "sleepingBag",
    price: 30,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 400,
    rates: dayLadder(30),
    enforceStrictTiers: true,
    quantity: 5,
    trackUnits: false,
    status: "active",
    popularity: 5,
    seasons: [HIGH_SEASON],
  },

  // ---------------------------------------------------------------- Accessoires
  {
    key: "casque-adulte",
    name: "Casque adulte",
    category: "Accessoires",
    description:
      "<p>Casque route/ville certifié CE, taille réglable. Offert avec toute location de vélo, facturé uniquement seul.</p>",
    images: [IMG.helmet, IMG.helmetAlt],
    price: 4,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 0,
    rates: dayLadder(4),
    enforceStrictTiers: false,
    quantity: 30,
    trackUnits: false,
    status: "active",
    popularity: 8,
    isAccessory: true,
  },
  {
    key: "casque-enfant",
    name: "Casque enfant",
    category: "Accessoires",
    description: "<p>Casque enfant avec molette de réglage, tailles 48 à 56 cm.</p>",
    images: [IMG.helmetAlt, IMG.helmet],
    price: 3,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 0,
    rates: dayLadder(3),
    enforceStrictTiers: true,
    quantity: 18,
    trackUnits: false,
    status: "active",
    popularity: 7,
    isAccessory: true,
  },
  {
    key: "siege-bebe",
    name: "Siège bébé Thule Yepp Maxi",
    category: "Accessoires",
    description:
      "<p>Siège enfant arrière 9 à 22 kg, harnais 5 points, montage sur porte-bagages. Installation faite par nos soins.</p>",
    images: [IMG.childSeat, IMG.childSeatAlt],
    price: 7,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 150,
    rates: dayLadder(7),
    enforceStrictTiers: true,
    quantity: 7,
    trackUnits: false,
    status: "active",
    popularity: 7,
    isAccessory: true,
  },
  {
    key: "antivol",
    name: "Antivol U + chaîne",
    category: "Accessoires",
    description:
      "<p>Antivol U niveau 2 roues + chaîne 90 cm. Fourni gratuitement avec chaque vélo, facturé s’il est loué seul.</p>",
    sourcedImage: "lock",
    images: [],
    price: 3,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 40,
    rates: dayLadder(3),
    enforceStrictTiers: true,
    quantity: 25,
    trackUnits: false,
    status: "active",
    popularity: 6,
    isAccessory: true,
  },
  {
    key: "gps",
    name: "Compteur GPS Garmin Edge 540",
    category: "Accessoires",
    description:
      "<p>Compteur GPS avec traces pré-chargées : Vélodyssée, tour de la baie, boucle des Glénan par la côte.</p>",
    sourcedImage: "gps",
    images: [],
    price: 9,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 300,
    rates: dayLadder(9),
    enforceStrictTiers: true,
    quantity: 5,
    trackUnits: false,
    status: "active",
    popularity: 4,
    isAccessory: true,
  },
  {
    key: "kit-repa",
    name: "Kit réparation + pompe",
    category: "Accessoires",
    description:
      "<p>Pompe, démonte-pneus, rustines, chambre à air de rechange et multi-outils. Non facturé si non utilisé au retour.</p>",
    sourcedImage: "repairKit",
    images: [],
    price: 4,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 0,
    rates: dayLadder(4),
    enforceStrictTiers: true,
    quantity: 18,
    trackUnits: false,
    status: "active",
    popularity: 5,
    isAccessory: true,
  },
  {
    key: "panier",
    name: "Panier avant amovible",
    category: "Accessoires",
    description: "<p>Panier avant clipsable 15 L, se retire en un geste pour aller au marché.</p>",
    sourcedImage: "basket",
    images: [],
    price: 3,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 30,
    rates: dayLadder(3),
    enforceStrictTiers: true,
    quantity: 10,
    trackUnits: false,
    status: "active",
    popularity: 4,
    isAccessory: true,
  },
  {
    key: "trailgator",
    name: "Barre de remorquage enfant Trail-Gator",
    category: "Accessoires",
    description:
      "<p>Barre de remorquage qui transforme le vélo de l’enfant en semi-remorque quand il fatigue.</p>",
    sourcedImage: "trailgator",
    images: [],
    price: 6,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 120,
    rates: dayLadder(6),
    enforceStrictTiers: true,
    quantity: 5,
    trackUnits: false,
    status: "active",
    popularity: 4,
    isAccessory: true,
  },

  // -------------------------------------------------------- Draft & archived
  {
    key: "velo-course",
    name: "Vélo de course carbone Ultegra",
    category: "Vélos & VAE",
    description:
      "<p>Cadre carbone, groupe Ultegra Di2, roues à profil 50 mm. En cours de préparation pour la saison prochaine.</p>",
    images: [IMG.routeAlt, IMG.route],
    price: 45,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 2000,
    rates: dayLadder(45),
    enforceStrictTiers: true,
    quantity: 2,
    trackUnits: false,
    status: "draft",
    popularity: 0,
  },
  {
    key: "trottinette",
    name: "Trottinette électrique 25 km/h",
    category: "Vélos & VAE",
    description:
      "<p>Retirée du catalogue : trop de casse et assurance impossible à couvrir correctement.</p>",
    images: [IMG.balade],
    price: 18,
    basePeriodMinutes: DAY,
    pricingMode: "day",
    deposit: 400,
    rates: dayLadder(18),
    enforceStrictTiers: true,
    quantity: 0,
    trackUnits: false,
    status: "archived",
    popularity: 0,
  },
];

// ---------------------------------------------------------------------------
// Promo codes
// ---------------------------------------------------------------------------

export const DEMO_PROMO_CODES = [
  {
    code: "BIENVENUE10",
    description: "Première location : 10 % de remise",
    type: "percentage" as const,
    value: 10,
    minimumAmount: 30,
    maxUsageCount: null,
    currentUsageCount: 47,
    isActive: true,
    startsAtDaysAgo: 400,
    expiresInDays: null,
  },
  {
    code: "LOCAL29",
    description: "Tarif habitants du Finistère (sur présentation d’un justificatif)",
    type: "percentage" as const,
    value: 15,
    minimumAmount: null,
    maxUsageCount: null,
    currentUsageCount: 112,
    isActive: true,
    startsAtDaysAgo: 400,
    expiresInDays: null,
  },
  {
    code: "SEMAINE25",
    description: "25 € de remise dès 7 jours de location",
    type: "fixed" as const,
    value: 25,
    minimumAmount: 150,
    maxUsageCount: 200,
    currentUsageCount: 38,
    isActive: true,
    startsAtDaysAgo: 200,
    expiresInDays: 120,
  },
  {
    code: "PAQUES26",
    description: "Opération vacances de Pâques 2026",
    type: "percentage" as const,
    value: 20,
    minimumAmount: 50,
    maxUsageCount: 100,
    currentUsageCount: 63,
    isActive: false,
    startsAtDaysAgo: 130,
    expiresInDays: -80,
  },
  {
    code: "GLENAN5",
    description: "Offre partenaire Vedettes de l’Odet",
    type: "fixed" as const,
    value: 5,
    minimumAmount: 20,
    maxUsageCount: 500,
    currentUsageCount: 9,
    isActive: true,
    startsAtDaysAgo: 45,
    expiresInDays: 300,
  },
];

// ---------------------------------------------------------------------------
// Inspection templates (état des lieux)
// ---------------------------------------------------------------------------

export const DEMO_INSPECTION_TEMPLATES = [
  {
    scope: "store" as const,
    category: null,
    name: "Contrôle général",
    description: "Points vérifiés au départ et au retour de tout matériel.",
    fields: [
      {
        name: "État général",
        fieldType: "select" as const,
        options: ["Neuf", "Bon", "Usure normale", "Dégradé"],
        isRequired: true,
        sectionName: "Général",
      },
      {
        name: "Propreté",
        fieldType: "rating" as const,
        isRequired: false,
        sectionName: "Général",
      },
      {
        name: "Accessoires remis (casque, antivol)",
        fieldType: "checkbox" as const,
        isRequired: true,
        sectionName: "Général",
      },
      {
        name: "Remarques",
        fieldType: "text" as const,
        isRequired: false,
        sectionName: "Général",
      },
    ],
  },
  {
    scope: "category" as const,
    category: "Vélos & VAE",
    name: "Contrôle vélo",
    description: "Contrôle mécanique effectué devant le client.",
    fields: [
      {
        name: "Freins avant/arrière",
        fieldType: "checkbox" as const,
        isRequired: true,
        sectionName: "Sécurité",
      },
      {
        name: "Pression des pneus",
        fieldType: "checkbox" as const,
        isRequired: true,
        sectionName: "Sécurité",
      },
      {
        name: "Éclairage avant/arrière",
        fieldType: "checkbox" as const,
        isRequired: false,
        sectionName: "Sécurité",
      },
      {
        name: "Niveau de batterie",
        fieldType: "number" as const,
        numberUnit: "%",
        isRequired: false,
        sectionName: "Assistance électrique",
      },
      {
        name: "Kilométrage compteur",
        fieldType: "number" as const,
        numberUnit: "km",
        isRequired: false,
        sectionName: "Assistance électrique",
      },
      {
        name: "État de la transmission",
        fieldType: "rating" as const,
        isRequired: false,
        sectionName: "Mécanique",
      },
      {
        name: "Rayures / chocs constatés",
        fieldType: "text" as const,
        isRequired: false,
        sectionName: "Mécanique",
      },
    ],
  },
  {
    scope: "category" as const,
    category: "Nautisme",
    name: "Contrôle nautique",
    description: "Vérification du matériel de sécurité avant mise à l’eau.",
    fields: [
      {
        name: "Gilet de sauvetage remis",
        fieldType: "checkbox" as const,
        isRequired: true,
        sectionName: "Sécurité",
      },
      {
        name: "Leash / bout de remorquage",
        fieldType: "checkbox" as const,
        isRequired: true,
        sectionName: "Sécurité",
      },
      {
        name: "Briefing météo et marée effectué",
        fieldType: "checkbox" as const,
        isRequired: true,
        sectionName: "Sécurité",
      },
      {
        name: "Étanchéité / pression",
        fieldType: "rating" as const,
        isRequired: false,
        sectionName: "Matériel",
      },
      {
        name: "Observations",
        fieldType: "text" as const,
        isRequired: false,
        sectionName: "Matériel",
      },
    ],
  },
];

export const DEMO_CGV = `<h2>Conditions générales de location</h2>
<h3>1. Objet</h3>
<p>Les présentes conditions régissent la location de matériel entre Ar Mor Location, SARL au capital de 15 000 €, 14 quai d'Aiguillon 29900 Concarneau, et le locataire.</p>
<h3>2. Durée et restitution</h3>
<p>La location prend effet à l'heure de retrait indiquée sur le contrat et se termine à l'heure de restitution convenue. Tout retard supérieur à 30 minutes entraîne la facturation d'une demi-journée supplémentaire.</p>
<h3>3. Caution</h3>
<p>Une empreinte bancaire est demandée au retrait. Elle est libérée sous 7 jours après restitution du matériel en bon état. En cas de dégradation, le montant des réparations est retenu sur présentation d'un devis.</p>
<h3>4. Assurance et responsabilité</h3>
<p>Le locataire est responsable du matériel pendant toute la durée de la location, y compris en cas de vol. Le port du casque est obligatoire pour les mineurs et fortement recommandé pour les adultes.</p>
<h3>5. Annulation</h3>
<p>Annulation gratuite jusqu'à 48 h avant le début de la location. Entre 48 h et 24 h, 50 % du montant est retenu. Moins de 24 h avant, la location est due en totalité.</p>
<h3>6. Conditions météorologiques</h3>
<p>Les locations de matériel nautique peuvent être annulées et intégralement remboursées à l'initiative du loueur en cas de conditions de mer défavorables.</p>`;

export const DEMO_LEGAL_NOTICE = `<h2>Mentions légales</h2>
<p><strong>Ar Mor Location</strong> — SARL au capital de 15 000 €</p>
<p>14 quai d'Aiguillon, 29900 Concarneau, France</p>
<p>RCS Quimper 851 204 773 — SIRET 851 204 773 00019</p>
<p>N° TVA intracommunautaire : FR64891204773</p>
<p>Téléphone : 02 98 97 41 62 — E-mail : contact@armor-location.bzh</p>
<p>Directeur de la publication : Gwenaëlle Le Bris</p>
<p>Hébergeur : Scaleway SAS, 8 rue de la Ville l'Évêque, 75008 Paris</p>
<p>Assurance responsabilité civile professionnelle : Groupama Loire Bretagne, contrat n° 41 209 887.</p>`;
