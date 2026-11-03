export const regions = ["majha", "malwa", "doaba", "puadh"] as const;

export type Region = (typeof regions)[number];

export type Constituency = {
  number: number;
  name: string;
  reservedForScheduledCastes: boolean;
  proposedRegion: Region;
  classificationStatus: "human_review_required";
};

export const constituencySources = {
  officialBoundaries: {
    label: "Election Commission of India, Delimitation Order No. 22",
    url: "https://www.eci.gov.in/146-archive-delimitation-orders",
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
  return {
    number,
    name,
    reservedForScheduledCastes,
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

export function isRegion(value: string): value is Region {
  return regions.includes(value as Region);
}
