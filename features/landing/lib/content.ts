import type { Diet } from '@/features/dishes/schemas/diet';
import { defaultCity } from '@/features/geo/schemas/city';
import type { Sentiment } from '@/features/ratings/schemas/sentiment';
import type { VerdictShares } from '@/features/ratings/lib/verdict-shares';
import type { TrustLevel } from './score-xray';
import type { ContextChipId } from '@/features/search/schemas/context-chips';

/*
  Illustrative content for the landing page (ARCHITECTURE D28).
  - Places use the fictional brand names of the sample catalogue, so no real business is given
    invented verdicts. Dish and place names are data; sentences and labels live in i18n under `landing.*`.
  - Numbers are illustrative; they are not read from the database.
*/

export type DemoPlace = { name: string; area: string; slug: string };

const place = (name: string, area: string, slug: string): DemoPlace => ({ name, area, slug });

export const places = {
  deccanOldCity: place('Deccan Degh House', 'Old City', 'deccan-degh-house-old-city'),
  deccanBanjara: place('Deccan Degh House', 'Banjara Hills', 'deccan-degh-house-banjara-hills'),
  noorOldCity: place('Noor-e-Deccan Kitchen', 'Old City', 'noor-e-deccan-kitchen-old-city'),
  qamarOldCity: place('Qamar Irani Café', 'Old City', 'qamar-irani-cafe-old-city'),
  qamarMadhapur: place('Qamar Irani Café', 'Madhapur', 'qamar-irani-cafe-madhapur'),
  raatKiRasoi: place('Raat Ki Rasoi', 'Banjara Hills', 'raat-ki-rasoi-banjara-hills'),
  hitechBiryani: place('Hitech Biryani Co.', 'Madhapur', 'hitech-biryani-co-madhapur'),
  gulmohar: place('Gulmohar Tiffins', 'Banjara Hills', 'gulmohar-tiffins-banjara-hills'),
  pesarattuCo: place('Pesarattu & Co.', 'Madhapur', 'pesarattu-and-co-madhapur'),
  mandiOldCity: place('Mandi Majlis', 'Old City', 'mandi-majlis-old-city'),
  mandiTolichowki: place('Mandi Majlis', 'Tolichowki', 'mandi-majlis-tolichowki'),
  shahi: place('Shahi Dastarkhwan', 'Banjara Hills', 'shahi-dastarkhwan-banjara-hills'),
  kebabMadhapur: place('Kebab Karkhana', 'Madhapur', 'kebab-karkhana-madhapur'),
  abidsChai: place('Abids Chai Adda', 'Abids', 'abids-chai-adda-abids'),
  velvetSpoon: place('Velvet Spoon Desserts', 'Banjara Hills', 'velvet-spoon-desserts-banjara-hills'),
} satisfies Record<string, DemoPlace>;

export const branchPath = (p: DemoPlace) => `/r/${p.slug}`;

/* Hero: each chip swaps the live proof card. */

export const proofSetIds = ['open', 'under300', 'late', 'biryani', 'veg'] as const;
export type ProofSetId = (typeof proofSetIds)[number];

export type ProofSet = {
  place: DemoPlace;
  dish: string;
  diet: Diet;
  distanceKm: number;
  openTill: string;
  shares: VerdictShares;
  ratings: number;
  pricePaise: number;
  route: string;
};

export const proofSets: Record<ProofSetId, ProofSet> = {
  open: {
    place: places.deccanOldCity,
    dish: 'Mutton dum biryani',
    diet: 'nonveg',
    distanceKm: 1.8,
    openTill: '23:30',
    shares: { loved: 78, good: 16, okay: 4, skip: 2 },
    ratings: 318,
    pricePaise: 36_000,
    route: branchPath(places.deccanOldCity),
  },
  under300: {
    place: places.qamarOldCity,
    dish: 'Irani chai with Osmania biscuits',
    diet: 'veg',
    distanceKm: 3.1,
    openTill: '23:00',
    shares: { loved: 71, good: 21, okay: 6, skip: 2 },
    ratings: 942,
    pricePaise: 6_000,
    route: branchPath(places.qamarOldCity),
  },
  late: {
    place: places.raatKiRasoi,
    dish: 'Paya with sheermal',
    diet: 'nonveg',
    distanceKm: 0.9,
    openTill: '03:00',
    shares: { loved: 69, good: 22, okay: 7, skip: 2 },
    ratings: 187,
    pricePaise: 23_000,
    route: branchPath(places.raatKiRasoi),
  },
  biryani: {
    place: places.shahi,
    dish: 'Kachchi gosht biryani',
    diet: 'nonveg',
    distanceKm: 5.4,
    openTill: '23:30',
    shares: { loved: 82, good: 13, okay: 3, skip: 2 },
    ratings: 1_204,
    pricePaise: 42_000,
    route: '/hyderabad/dish/mutton-dum-biryani',
  },
  veg: {
    place: places.gulmohar,
    dish: 'Pesarattu upma',
    diet: 'veg',
    distanceKm: 2.6,
    openTill: '21:30',
    shares: { loved: 73, good: 19, okay: 6, skip: 2 },
    ratings: 406,
    pricePaise: 10_000,
    route: branchPath(places.gulmohar),
  },
};

export const heroBattle = {
  sides: [
    { id: 'a', place: places.deccanOldCity },
    { id: 'b', place: places.hitechBiryani },
  ],
} as const;

/* Section 2A: the six steps of one dinner decision, and the app each one sends people to. */

export const journeyStepIds = ['discover', 'dish', 'distance', 'price', 'trust', 'call'] as const;
export type JourneyStepId = (typeof journeyStepIds)[number];

/** Minutes each step costs today; they add up to the 25-minute decision in the copy. */
export const journeyMinutes: Record<JourneyStepId, number> = {
  discover: 6,
  dish: 5,
  distance: 4,
  price: 4,
  trust: 4,
  call: 2,
};

/* Section 2B: four ways in. */

export const modeIds = ['xray', 'board', 'mood', 'area'] as const;
export type ModeId = (typeof modeIds)[number];

export const xray = {
  place: places.deccanOldCity,
  cuisines: 'Hyderabadi, Mughlai',
  priceBand: '₹₹',
  distanceKm: 1.8,
  openTill: '23:30',
  rows: [
    { dish: 'Mutton dum biryani', lovedPct: 78, pricePaise: 36_000, diet: 'nonveg', seasonal: false },
    { dish: 'Mutton haleem', lovedPct: 74, pricePaise: 28_000, diet: 'nonveg', seasonal: true },
    { dish: 'Chicken 65', lovedPct: 66, pricePaise: 29_000, diet: 'nonveg', seasonal: false },
    { dish: 'Double ka meetha', lovedPct: 61, pricePaise: 12_000, diet: 'veg', seasonal: false },
    { dish: 'Qubani ka meetha', lovedPct: 58, pricePaise: 14_000, diet: 'veg', seasonal: false },
  ] satisfies { dish: string; lovedPct: number; pricePaise: number; diet: Diet; seasonal: boolean }[],
  skip: { dish: 'Burani raita', skipPct: 41, ratings: 212 },
};

export const leaderboardFilters = ['open', 'cheap', 'near'] as const;
export type LeaderboardFilter = (typeof leaderboardFilters)[number];

export type LeaderboardEntry = {
  place: DemoPlace;
  pricePaise: number;
  distanceKm: number;
  /** null when open now, else the next opening time. */
  opensAt: string | null;
  lovedPct: number;
  trend: number;
  matches: Record<LeaderboardFilter, boolean>;
};

export const haleemBoard: { route: string; entries: LeaderboardEntry[] } = {
  route: '/hyderabad/dish/mutton-haleem',
  entries: [
    {
      place: places.noorOldCity,
      pricePaise: 28_000,
      distanceKm: 6.2,
      opensAt: null,
      lovedPct: 84,
      trend: 1,
      matches: { open: true, cheap: true, near: false },
    },
    {
      place: places.deccanOldCity,
      pricePaise: 28_000,
      distanceKm: 1.8,
      opensAt: null,
      lovedPct: 81,
      trend: -1,
      matches: { open: true, cheap: true, near: true },
    },
    {
      place: places.deccanBanjara,
      pricePaise: 32_000,
      distanceKm: 4,
      opensAt: '18:00',
      lovedPct: 72,
      trend: 0,
      matches: { open: false, cheap: false, near: false },
    },
    {
      place: places.raatKiRasoi,
      pricePaise: 27_000,
      distanceKm: 2.3,
      opensAt: null,
      lovedPct: 69,
      trend: 3,
      matches: { open: true, cheap: true, near: true },
    },
  ],
};

export const moodIds = ['rainy-day', 'date-night', 'family-sunday', 'late-night', 'under-300'] as const;
export type MoodId = (typeof moodIds)[number];

const moodChip: Record<MoodId, ContextChipId> = {
  'rainy-day': 'rainy-day',
  'date-night': 'date-night',
  'family-sunday': 'family',
  'late-night': 'late-night',
  'under-300': 'under-300',
};

export const moodRoute = (mood: MoodId) => `/${defaultCity}/search?chip=${moodChip[mood]}`;

export type MoodPick = { dish: string; place: DemoPlace; pricePaise: number; diet: Diet };

const pick = (dish: string, p: DemoPlace, rupees: number, diet: Diet): MoodPick => ({
  dish,
  place: p,
  pricePaise: rupees * 100,
  diet,
});

export const moodPicks: Record<MoodId, MoodPick[]> = {
  'rainy-day': [
    pick('Mirchi bajji and chai', places.abidsChai, 60, 'veg'),
    pick('Paya nihari', places.noorOldCity, 220, 'nonveg'),
    pick('Irani chai and samosa', places.qamarOldCity, 45, 'veg'),
    pick('Pathar ka gosht', places.shahi, 340, 'nonveg'),
  ],
  'date-night': [
    pick('Kachchi gosht biryani', places.shahi, 520, 'nonveg'),
    pick('Qubani ka meetha', places.velvetSpoon, 260, 'veg'),
    pick('Haleem tasting plate', places.noorOldCity, 520, 'nonveg'),
    pick('Filter coffee and Mysore bajji', places.gulmohar, 95, 'veg'),
  ],
  'family-sunday': [
    pick('Mutton mandi for four', places.mandiTolichowki, 1_200, 'nonveg'),
    pick('South Indian tiffin spread', places.pesarattuCo, 320, 'veg'),
    pick('Biryani family pack', places.hitechBiryani, 1_100, 'nonveg'),
    pick('Veg biryani and bagara baingan', places.deccanBanjara, 380, 'veg'),
  ],
  'late-night': [
    pick('Paya with sheermal', places.raatKiRasoi, 230, 'nonveg'),
    pick('Midnight chicken biryani', places.raatKiRasoi, 310, 'nonveg'),
    pick('Irani chai', places.raatKiRasoi, 30, 'veg'),
    pick('Mutton seekh kebab', places.kebabMadhapur, 320, 'nonveg'),
  ],
  'under-300': [
    pick('Irani chai and bun maska', places.qamarOldCity, 60, 'veg'),
    pick('Chicken 65, half', places.hitechBiryani, 240, 'nonveg'),
    pick('Pesarattu', places.pesarattuCo, 110, 'veg'),
    pick('Egg puff', places.qamarOldCity, 35, 'egg'),
  ],
};

export const area = {
  slug: 'old-city',
  stats: { open: 31, rated: 214, busiest: '21:00' },
  topDishes: [
    { dish: 'Mutton haleem', place: places.noorOldCity, lovedPct: 81, diet: 'nonveg' },
    { dish: 'Mutton mandi', place: places.mandiOldCity, lovedPct: 77, diet: 'nonveg' },
    { dish: 'Double ka meetha', place: places.deccanOldCity, lovedPct: 73, diet: 'veg' },
    { dish: 'Osmania biscuit', place: places.qamarOldCity, lovedPct: 70, diet: 'veg' },
  ] satisfies { dish: string; place: DemoPlace; lovedPct: number; diet: Diet }[],
};

/* Section 3: community. */

export type TickerId = 't1' | 't2' | 't3' | 't4' | 't5' | 't6';

export const tickerItems: { id: TickerId; user: string; verdict?: Sentiment }[] = [
  { id: 't1', user: '@priya.k', verdict: 'loved' },
  { id: 't2', user: '@arjun_hyd' },
  { id: 't3', user: '@fz_khan' },
  { id: 't4', user: '@meher', verdict: 'good' },
  { id: 't5', user: '@sana.eats' },
  { id: 't6', user: '@kiran.r' },
];

export const experiencePost = {
  author: '@sana.eats',
  votes: 412,
  comments: 86,
  ratings: [
    { place: places.noorOldCity, verdict: 'loved' },
    { place: places.deccanOldCity, verdict: 'loved' },
    { place: places.raatKiRasoi, verdict: 'good' },
    { place: places.deccanBanjara, verdict: 'okay' },
  ] satisfies { place: DemoPlace; verdict: Sentiment }[],
};

export const questionPost = { answers: 23, answerer: '@fz_khan', distanceKm: 0.9 };

export const chaiList = {
  author: '@meher',
  saves: 1_204,
  route: '/hyderabad/dish/irani-chai',
  rows: [
    { place: places.qamarOldCity, pricePaise: 3_000 },
    { place: places.abidsChai, pricePaise: 2_500 },
    { place: places.qamarMadhapur, pricePaise: 3_000 },
  ],
};

export const receipt = {
  place: places.raatKiRasoi,
  author: '@rahul_k',
  totalPaise: 114_000,
  lines: [
    { dish: 'Midnight chicken biryani', verdict: 'loved' },
    { dish: 'Mutton haleem', verdict: 'loved' },
    { dish: 'Egg biryani', verdict: 'good' },
    { dish: 'Irani chai', verdict: 'skip' },
  ] satisfies { dish: string; verdict: Sentiment }[],
};

export const closedBattle = {
  votes: 2_318,
  winner: { place: places.kebabMadhapur, pct: 61 },
  loser: { place: places.deccanOldCity, pct: 39 },
};

export const factsToday = { checked: 142, confirmers: 4 };

export type CommunitySlug = 'biryani' | 'haleem-ramzan' | 'budget-eats' | 'veg-hyderabad' | 'street-food';

export const communities: { slug: CommunitySlug; members: number }[] = [
  { slug: 'biryani', members: 12_400 },
  { slug: 'haleem-ramzan', members: 8_100 },
  { slug: 'budget-eats', members: 6_700 },
  { slug: 'veg-hyderabad', members: 5_200 },
  { slug: 'street-food', members: 4_900 },
];

/* Section 4: Score X-Ray. The prior is an illustrative city mean for haleem; weights are in score-xray.ts. */

export type XrayRating = {
  handle: string;
  trust: TrustLevel;
  verdict: Sentiment;
  ageDays: number;
  disclosed?: boolean;
  held?: boolean;
};

export const xrayDish = { dish: 'Mutton haleem', place: places.noorOldCity, cityPrior: 0.72 };

export const xraySeed: XrayRating[] = [
  { handle: 'sana.eats', trust: 'FOUNDING', verdict: 'loved', ageDays: 12 },
  { handle: 'arjun_hyd', trust: 'T2', verdict: 'loved', ageDays: 40 },
  { handle: 'meher', trust: 'T1', verdict: 'good', ageDays: 5 },
  { handle: 'fz_khan', trust: 'T1', verdict: 'loved', ageDays: 200 },
  { handle: 'kiran.r', trust: 'T1', verdict: 'okay', ageDays: 90 },
  { handle: 'newbie_221', trust: 'T0', verdict: 'skip', ageDays: 2 },
  { handle: 'haleemhub', trust: 'T1', verdict: 'loved', ageDays: 3, disclosed: true },
  { handle: 'old_timer', trust: 'T1', verdict: 'loved', ageDays: 700 },
];

/** A burst of brand-new accounts all saying Loved within minutes (spec §7.3). */
export const burstHandles = [
  'user4821',
  'user7302',
  'user1957',
  'user6640',
  'user3018',
  'user9275',
  'user5531',
  'user2486',
];

/* Section 5: FAQ, ordered by votes. */

export const faqIds = ['account', 'words', 'fakes', 'pay', 'battles', 'location', 'wrong', 'delete'] as const;
export type FaqId = (typeof faqIds)[number];

export const faqVotes: Record<FaqId, number> = {
  account: 318,
  words: 276,
  fakes: 241,
  pay: 198,
  battles: 164,
  location: 129,
  wrong: 97,
  delete: 71,
};
