export const regions = ["majha", "malwa", "doaba", "puadh"] as const;

export type Region = (typeof regions)[number];

export const parliamentaryConstituencies = [
  {
    number: 1,
    name: "Gurdaspur",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [1, 2, 3, 4, 5, 6, 7, 9, 10],
  },
  {
    number: 2,
    name: "Amritsar",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [11, 12, 13, 15, 16, 17, 18, 19, 20],
  },
  {
    number: 3,
    name: "Khadoor Sahib",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [14, 21, 22, 23, 24, 25, 27, 28, 75],
  },
  {
    number: 4,
    name: "Jalandhar",
    reservedForScheduledCastes: true,
    assemblyConstituencyNumbers: [30, 31, 32, 33, 34, 35, 36, 37, 38],
  },
  {
    number: 5,
    name: "Hoshiarpur",
    reservedForScheduledCastes: true,
    assemblyConstituencyNumbers: [8, 26, 29, 39, 40, 41, 42, 43, 44],
  },
  {
    number: 6,
    name: "Anandpur Sahib",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [45, 46, 47, 48, 49, 50, 51, 52, 53],
  },
  {
    number: 7,
    name: "Ludhiana",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [60, 61, 62, 63, 64, 65, 66, 68, 70],
  },
  {
    number: 8,
    name: "Fatehgarh Sahib",
    reservedForScheduledCastes: true,
    assemblyConstituencyNumbers: [54, 55, 56, 57, 58, 59, 67, 69, 106],
  },
  {
    number: 9,
    name: "Faridkot",
    reservedForScheduledCastes: true,
    assemblyConstituencyNumbers: [71, 72, 73, 74, 84, 87, 88, 89, 90],
  },
  {
    number: 10,
    name: "Firozpur",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [76, 77, 78, 79, 80, 81, 82, 85, 86],
  },
  {
    number: 11,
    name: "Bathinda",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [83, 91, 92, 93, 94, 95, 96, 97, 98],
  },
  {
    number: 12,
    name: "Sangrur",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [99, 100, 101, 102, 103, 104, 105, 107, 108],
  },
  {
    number: 13,
    name: "Patiala",
    reservedForScheduledCastes: false,
    assemblyConstituencyNumbers: [109, 110, 111, 112, 113, 114, 115, 116, 117],
  },
] as const;

export type ParliamentaryConstituencyNumber =
  (typeof parliamentaryConstituencies)[number]["number"];

export type Constituency = {
  number: number;
  name: string;
  slug: string;
  reservedForScheduledCastes: boolean;
  parliamentaryConstituencyNumber: ParliamentaryConstituencyNumber;
  proposedRegion: Region;
  classificationStatus: "human_review_required";
};

export function createConstituencySlug(number: number, name: string): string {
  const normalizedName = name
    .normalize("NFKD")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return `${number}-${normalizedName}`;
}

export const constituencySources = {
  officialBoundaries: {
    label: "Election Commission of India, Delimitation Order No. 22",
    url: "https://www.eci.gov.in/delimitation/",
    orderNumber: 22,
    notificationDate: "2006-06-19",
    recordVersion: "eci-delimitation-order-22-2006",
    lastChecked: "2026-11-07",
  },
  threeRegionOverview: {
    label: "Government of Punjab, Know Punjab",
    url: "https://punjab.gov.in/know-punjab/",
  },
  fourRegionContext: {
    label: "PUDA, Greater Mohali Regional Plan 2008–2058",
    url: "https://puda.punjab.gov.in/sites/default/files/Regional_rpt_2011.pdf",
  },
} as const;

function constituency(
  number: number,
  name: string,
  proposedRegion: Region,
  reservedForScheduledCastes = false,
): Constituency {
  const parliamentaryConstituency = parliamentaryConstituencies.find(
    ({ assemblyConstituencyNumbers }) =>
      assemblyConstituencyNumbers.some((candidate) => candidate === number),
  );
  if (!parliamentaryConstituency) {
    throw new Error(
      `Missing parliamentary association for Assembly constituency ${number}`,
    );
  }
  return {
    number,
    name,
    slug: createConstituencySlug(number, name),
    reservedForScheduledCastes,
    parliamentaryConstituencyNumber: parliamentaryConstituency.number,
    proposedRegion,
    classificationStatus: "human_review_required",
  };
}

// Names, numbers and SC reservations follow ECI Delimitation Order No. 22.
// The cultural-region field is a complete editorial proposal, not an official
// electoral classification. Every assignment remains subject to local review.
export const constituencies = [
  constituency(1, "Sujanpur", "majha"),
  constituency(2, "Bhoa", "majha", true),
  constituency(3, "Pathankot", "majha"),
  constituency(4, "Gurdaspur", "majha"),
  constituency(5, "Dina Nagar", "majha", true),
  constituency(6, "Qadian", "majha"),
  constituency(7, "Batala", "majha"),
  constituency(8, "Sri Hargobindpur", "majha", true),
  constituency(9, "Fatehgarh Churian", "majha"),
  constituency(10, "Dera Baba Nanak", "majha"),
  constituency(11, "Ajnala", "majha"),
  constituency(12, "Raja Sansi", "majha"),
  constituency(13, "Majitha", "majha"),
  constituency(14, "Jandiala", "majha", true),
  constituency(15, "Amritsar North", "majha"),
  constituency(16, "Amritsar West", "majha", true),
  constituency(17, "Amritsar Central", "majha"),
  constituency(18, "Amritsar East", "majha"),
  constituency(19, "Amritsar South", "majha"),
  constituency(20, "Attari", "majha", true),
  constituency(21, "Tarn Taran", "majha"),
  constituency(22, "Khem Karan", "majha"),
  constituency(23, "Patti", "majha"),
  constituency(24, "Khadoor Sahib", "majha"),
  constituency(25, "Baba Bakala", "majha", true),
  constituency(26, "Bholath", "doaba"),
  constituency(27, "Kapurthala", "doaba"),
  constituency(28, "Sultanpur Lodhi", "doaba"),
  constituency(29, "Phagwara", "doaba", true),
  constituency(30, "Phillaur", "doaba", true),
  constituency(31, "Nakodar", "doaba"),
  constituency(32, "Shahkot", "doaba"),
  constituency(33, "Kartarpur", "doaba", true),
  constituency(34, "Jalandhar West", "doaba", true),
  constituency(35, "Jalandhar Central", "doaba"),
  constituency(36, "Jalandhar North", "doaba"),
  constituency(37, "Jalandhar Cantt.", "doaba"),
  constituency(38, "Adampur", "doaba", true),
  constituency(39, "Mukerian", "doaba"),
  constituency(40, "Dasuya", "doaba"),
  constituency(41, "Urmar", "doaba"),
  constituency(42, "Sham Chaurasi", "doaba", true),
  constituency(43, "Hoshiarpur", "doaba"),
  constituency(44, "Chabbewal", "doaba", true),
  constituency(45, "Garhshankar", "doaba"),
  constituency(46, "Banga", "doaba", true),
  constituency(47, "Nawan Shahr", "doaba"),
  constituency(48, "Balachaur", "doaba"),
  constituency(49, "Anandpur Sahib", "puadh"),
  constituency(50, "Rupnagar", "puadh"),
  constituency(51, "Chamkaur Sahib", "puadh", true),
  constituency(52, "Kharar", "puadh"),
  constituency(53, "S.A.S. Nagar", "puadh"),
  constituency(54, "Bassi Pathana", "puadh", true),
  constituency(55, "Fatehgarh Sahib", "puadh"),
  constituency(56, "Amloh", "puadh"),
  constituency(57, "Khanna", "malwa"),
  constituency(58, "Samrala", "malwa"),
  constituency(59, "Sahnewal", "malwa"),
  constituency(60, "Ludhiana East", "malwa"),
  constituency(61, "Ludhiana South", "malwa"),
  constituency(62, "Atam Nagar", "malwa"),
  constituency(63, "Ludhiana Central", "malwa"),
  constituency(64, "Ludhiana West", "malwa"),
  constituency(65, "Ludhiana North", "malwa"),
  constituency(66, "Gill", "malwa", true),
  constituency(67, "Payal", "malwa", true),
  constituency(68, "Dakha", "malwa"),
  constituency(69, "Raikot", "malwa", true),
  constituency(70, "Jagraon", "malwa", true),
  constituency(71, "Nihal Singhwala", "malwa", true),
  constituency(72, "Bhagha Purana", "malwa"),
  constituency(73, "Moga", "malwa"),
  constituency(74, "Dharamkot", "malwa"),
  constituency(75, "Zira", "malwa"),
  constituency(76, "Firozpur City", "malwa"),
  constituency(77, "Firozpur Rural", "malwa", true),
  constituency(78, "Guru Har Sahai", "malwa"),
  constituency(79, "Jalalabad", "malwa"),
  constituency(80, "Fazilka", "malwa"),
  constituency(81, "Abohar", "malwa"),
  constituency(82, "Balluana", "malwa", true),
  constituency(83, "Lambi", "malwa"),
  constituency(84, "Gidderbaha", "malwa"),
  constituency(85, "Malout", "malwa", true),
  constituency(86, "Muktsar", "malwa"),
  constituency(87, "Faridkot", "malwa"),
  constituency(88, "Kotkapura", "malwa"),
  constituency(89, "Jaitu", "malwa", true),
  constituency(90, "Rampura Phul", "malwa"),
  constituency(91, "Bhucho Mandi", "malwa", true),
  constituency(92, "Bathinda Urban", "malwa"),
  constituency(93, "Bathinda Rural", "malwa", true),
  constituency(94, "Talwandi Sabo", "malwa"),
  constituency(95, "Maur", "malwa"),
  constituency(96, "Mansa", "malwa"),
  constituency(97, "Sardulgarh", "malwa"),
  constituency(98, "Budhlada", "malwa", true),
  constituency(99, "Lehra", "malwa"),
  constituency(100, "Dirba", "malwa", true),
  constituency(101, "Sunam", "malwa"),
  constituency(102, "Bhadaur", "malwa", true),
  constituency(103, "Barnala", "malwa"),
  constituency(104, "Mehal Kalan", "malwa", true),
  constituency(105, "Malerkotla", "malwa"),
  constituency(106, "Amargarh", "malwa"),
  constituency(107, "Dhuri", "malwa"),
  constituency(108, "Sangrur", "malwa"),
  constituency(109, "Nabha", "puadh", true),
  constituency(110, "Patiala Rural", "puadh"),
  constituency(111, "Rajpura", "puadh"),
  constituency(112, "Dera Bassi", "puadh"),
  constituency(113, "Ghanaur", "puadh"),
  constituency(114, "Sanour", "puadh"),
  constituency(115, "Patiala", "puadh"),
  constituency(116, "Samana", "puadh"),
  constituency(117, "Shutrana", "puadh", true),
] as const satisfies readonly Constituency[];

export function getConstituenciesByRegion(region: Region) {
  return constituencies.filter((item) => item.proposedRegion === region);
}

export function getConstituencyBySlug(slug: string) {
  return constituencies.find((item) => item.slug === slug);
}

export function getParliamentaryConstituency(
  number: ParliamentaryConstituencyNumber,
) {
  return parliamentaryConstituencies.find((item) => item.number === number);
}

export function isRegion(value: string): value is Region {
  return regions.includes(value as Region);
}
