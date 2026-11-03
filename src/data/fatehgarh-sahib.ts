import { constituencies } from "./constituencies";

export const fatehgarhSahibParliamentaryGroup = {
  number: 8,
  name: "Fatehgarh Sahib",
  reservedForScheduledCastes: true,
  source: {
    label: "District Administration Fatehgarh Sahib, Constituencies",
    url: "https://fatehgarhsahib.nic.in/constituencies/",
    lastChecked: "2026-11-03",
  },
  assemblyConstituencyNumbers: [54, 55, 56, 57, 58, 59, 67, 69, 106],
} as const;

export const fatehgarhSahibSegments =
  fatehgarhSahibParliamentaryGroup.assemblyConstituencyNumbers.map((number) => {
    const constituency = constituencies.find((item) => item.number === number);

    if (!constituency) {
      throw new Error(`Missing Assembly constituency ${number}`);
    }

    return constituency;
  });
