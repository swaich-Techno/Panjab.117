import type { Region } from "../data/constituencies";

import type { Locale } from "./i18n";

type RegionText = { name: string; description: string };

export type RegionalDictionary = {
  regionsEyebrow: string;
  regionsTitle: string;
  regionsBody: string;
  classificationNotice: string;
  reviewBadge: string;
  exploreRegion: string;
  provisionalCount: string;
  backHome: string;
  directoryEyebrow: string;
  directoryTitle: string;
  directoryBody: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchButton: string;
  clearSearch: string;
  resultCount: string;
  noResults: string;
  officialNameNote: string;
  scheduledCasteSeat: string;
  sources: string;
  fatehgarhEyebrow: string;
  fatehgarhTitle: string;
  fatehgarhBody: string;
  parliamentaryIndependence: string;
  assemblySegment: string;
  surveyPreview: string;
  surveyEyebrow: string;
  surveyTitle: string;
  surveyBody: string;
  draftStatus: string;
  unavailable: string;
  proposedWindow: string;
  opens: string;
  closes: string;
  timezone: string;
  approvalGate: string;
  noIntake: string;
  regions: Record<Region, RegionText>;
};

export const regionalDictionaries: Record<Locale, RegionalDictionary> = {
  en: {
    regionsEyebrow: "Regional directories",
    regionsTitle: "Four cultural lenses. One official Assembly map.",
    regionsBody:
      "Explore the 117 Assembly constituencies through Majha, Malwa, Doaba and Puadh while keeping cultural identity separate from election boundaries.",
    classificationNotice:
      "Regional assignments are a complete editorial proposal for local review. They are not official election classifications and are not yet verified.",
    reviewBadge: "Human review required",
    exploreRegion: "Explore directory",
    provisionalCount: "provisional entries",
    backHome: "Back to homepage",
    directoryEyebrow: "Provisional cultural directory",
    directoryTitle: "constituencies",
    directoryBody:
      "Names, numbers and reserved-seat status follow the Election Commission delimitation record. Cultural-region assignments remain provisional.",
    searchLabel: "Search this regional directory",
    searchPlaceholder: "Name or constituency number",
    searchButton: "Search",
    clearSearch: "Clear search",
    resultCount: "matching constituencies",
    noResults: "No constituency matches this search.",
    officialNameNote: "Official English name",
    scheduledCasteSeat: "Scheduled Caste reserved seat",
    sources: "Sources and classification status",
    fatehgarhEyebrow: "Parliamentary constituency 8 · Scheduled Caste reserved",
    fatehgarhTitle:
      "Fatehgarh Sahib Parliamentary Constituency — Nine Assembly Segments",
    fatehgarhBody:
      "Fatehgarh Sahib district has three Assembly constituencies: 54 Bassi Pathana (SC), 55 Fatehgarh Sahib and 56 Amloh. This page presents the nine Assembly segments of the wider Fatehgarh Sahib Parliamentary Constituency.",
    parliamentaryIndependence:
      "The district administration source lists the district and parliamentary groupings separately. This official parliamentary grouping is independent of the provisional cultural-region directory.",
    assemblySegment: "Assembly segment",
    surveyPreview: "View survey-readiness preview",
    surveyEyebrow: "Draft survey readiness · no collection",
    surveyTitle: "Fatehgarh Sahib Parliamentary Constituency survey preview",
    surveyBody:
      "Participation dates will be set only after privacy, security, consent, backup and operational-readiness approval. This is a read-only preview, not a survey launch announcement.",
    draftStatus: "Draft · approval required",
    unavailable: "Survey intake is unavailable",
    proposedWindow: "Participation dates",
    opens: "Opens",
    closes: "Closes",
    timezone: "Timezone",
    approvalGate:
      "Launch requires separate approval plus production security, privacy, consent, backup and operational sign-off.",
    noIntake:
      "There is no submission form or survey endpoint. No personal or political-opinion data is being collected.",
    regions: {
      majha: { name: "Majha", description: "North-western cultural region" },
      malwa: {
        name: "Malwa",
        description: "Southern and central cultural region",
      },
      doaba: {
        name: "Doaba",
        description: "Cultural region between the Beas and Sutlej",
      },
      puadh: {
        name: "Puadh",
        description: "South-eastern cultural region with debated edges",
      },
    },
  },
  pa: {
    regionsEyebrow: "ਖੇਤਰੀ ਡਾਇਰੈਕਟਰੀਆਂ",
    regionsTitle: "ਚਾਰ ਸੱਭਿਆਚਾਰਕ ਨਜ਼ਰੀਏ। ਵਿਧਾਨ ਸਭਾ ਦਾ ਇੱਕ ਅਧਿਕਾਰਤ ਨਕਸ਼ਾ।",
    regionsBody:
      "ਸੱਭਿਆਚਾਰਕ ਪਛਾਣ ਨੂੰ ਚੋਣ ਹੱਦਾਂ ਤੋਂ ਵੱਖ ਰੱਖਦਿਆਂ ਮਾਝਾ, ਮਾਲਵਾ, ਦੁਆਬਾ ਅਤੇ ਪੁਆਧ ਰਾਹੀਂ 117 ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਦੀ ਪੜਚੋਲ ਕਰੋ।",
    classificationNotice:
      "ਖੇਤਰੀ ਵੰਡ ਸਥਾਨਕ ਸਮੀਖਿਆ ਲਈ ਪੂਰਾ ਸੰਪਾਦਕੀ ਪ੍ਰਸਤਾਵ ਹੈ। ਇਹ ਅਧਿਕਾਰਤ ਚੋਣ ਵੰਡ ਨਹੀਂ ਅਤੇ ਹਾਲੇ ਤਸਦੀਕਸ਼ੁਦਾ ਨਹੀਂ ਹੈ।",
    reviewBadge: "ਮਨੁੱਖੀ ਸਮੀਖਿਆ ਲੋੜੀਂਦੀ",
    exploreRegion: "ਡਾਇਰੈਕਟਰੀ ਵੇਖੋ",
    provisionalCount: "ਆਰਜ਼ੀ ਇੰਦਰਾਜ਼",
    backHome: "ਮੁੱਖ ਸਫ਼ੇ ਉੱਤੇ ਵਾਪਸ",
    directoryEyebrow: "ਆਰਜ਼ੀ ਸੱਭਿਆਚਾਰਕ ਡਾਇਰੈਕਟਰੀ",
    directoryTitle: "ਵਿਧਾਨ ਸਭਾ ਹਲਕੇ",
    directoryBody:
      "ਨਾਂ, ਨੰਬਰ ਅਤੇ ਰਾਖਵੇਂ ਹਲਕੇ ਦੀ ਸਥਿਤੀ ਚੋਣ ਕਮਿਸ਼ਨ ਦੇ ਹੱਦਬੰਦੀ ਰਿਕਾਰਡ ਅਨੁਸਾਰ ਹਨ। ਸੱਭਿਆਚਾਰਕ ਖੇਤਰ ਦੀ ਵੰਡ ਆਰਜ਼ੀ ਹੈ।",
    searchLabel: "ਇਸ ਖੇਤਰੀ ਡਾਇਰੈਕਟਰੀ ਵਿੱਚ ਲੱਭੋ",
    searchPlaceholder: "ਨਾਂ ਜਾਂ ਹਲਕਾ ਨੰਬਰ",
    searchButton: "ਲੱਭੋ",
    clearSearch: "ਖੋਜ ਸਾਫ਼ ਕਰੋ",
    resultCount: "ਮਿਲਦੇ ਹਲਕੇ",
    noResults: "ਇਸ ਖੋਜ ਨਾਲ ਕੋਈ ਹਲਕਾ ਨਹੀਂ ਮਿਲਿਆ।",
    officialNameNote: "ਅਧਿਕਾਰਤ ਅੰਗਰੇਜ਼ੀ ਨਾਂ",
    scheduledCasteSeat: "ਅਨੁਸੂਚਿਤ ਜਾਤੀ ਲਈ ਰਾਖਵਾਂ ਹਲਕਾ",
    sources: "ਸਰੋਤ ਅਤੇ ਵੰਡ ਦੀ ਸਥਿਤੀ",
    fatehgarhEyebrow: "ਲੋਕ ਸਭਾ ਹਲਕਾ 8 · ਅਨੁਸੂਚਿਤ ਜਾਤੀ ਲਈ ਰਾਖਵਾਂ",
    fatehgarhTitle: "ਫ਼ਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਲੋਕ ਸਭਾ ਹਲਕਾ — ਨੌਂ ਵਿਧਾਨ ਸਭਾ ਹਲਕੇ",
    fatehgarhBody:
      "ਫ਼ਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਜ਼ਿਲ੍ਹੇ ਵਿੱਚ ਤਿੰਨ ਵਿਧਾਨ ਸਭਾ ਹਲਕੇ ਹਨ—54 ਬੱਸੀ ਪਠਾਣਾਂ (ਅਨੁਸੂਚਿਤ ਜਾਤੀ), 55 ਫ਼ਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਅਤੇ 56 ਅਮਲੋਹ। ਇਹ ਸਫ਼ਾ ਫ਼ਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਲੋਕ ਸਭਾ ਹਲਕੇ ਦੇ ਨੌਂ ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ।",
    parliamentaryIndependence:
      "ਜ਼ਿਲ੍ਹਾ ਪ੍ਰਸ਼ਾਸਨ ਦਾ ਸਰੋਤ ਜ਼ਿਲ੍ਹੇ ਅਤੇ ਲੋਕ ਸਭਾ ਹਲਕੇ ਦੀਆਂ ਸੂਚੀਆਂ ਵੱਖ-ਵੱਖ ਦਿੰਦਾ ਹੈ। ਇਹ ਅਧਿਕਾਰਤ ਲੋਕ ਸਭਾ ਸਮੂਹ ਆਰਜ਼ੀ ਸੱਭਿਆਚਾਰਕ ਖੇਤਰੀ ਡਾਇਰੈਕਟਰੀ ਤੋਂ ਵੱਖਰਾ ਹੈ।",
    assemblySegment: "ਵਿਧਾਨ ਸਭਾ ਹਲਕਾ",
    surveyPreview: "ਸਰਵੇਖਣ ਤਿਆਰੀ ਦੀ ਝਲਕ ਵੇਖੋ",
    surveyEyebrow: "ਸਰਵੇਖਣ ਤਿਆਰੀ ਦਾ ਖਰੜਾ · ਕੋਈ ਡਾਟਾ ਇਕੱਠਾ ਨਹੀਂ",
    surveyTitle: "ਫ਼ਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਲੋਕ ਸਭਾ ਹਲਕੇ ਦੇ ਸਰਵੇਖਣ ਦੀ ਝਲਕ",
    surveyBody:
      "ਭਾਗੀਦਾਰੀ ਦੀਆਂ ਮਿਤੀਆਂ ਗੋਪਨੀਯਤਾ, ਸੁਰੱਖਿਆ, ਸਹਿਮਤੀ, ਬੈਕਅੱਪ ਅਤੇ ਸੰਚਾਲਨ ਤਿਆਰੀ ਦੀ ਮਨਜ਼ੂਰੀ ਤੋਂ ਬਾਅਦ ਹੀ ਪੱਕੀਆਂ ਕੀਤੀਆਂ ਜਾਣਗੀਆਂ। ਇਹ ਸਿਰਫ਼ ਪੜ੍ਹਨ ਲਈ ਝਲਕ ਹੈ, ਸਰਵੇਖਣ ਸ਼ੁਰੂ ਹੋਣ ਦਾ ਐਲਾਨ ਨਹੀਂ।",
    draftStatus: "ਖਰੜਾ · ਮਨਜ਼ੂਰੀ ਲੋੜੀਂਦੀ",
    unavailable: "ਸਰਵੇਖਣ ਦੇ ਜਵਾਬ ਸਵੀਕਾਰ ਨਹੀਂ ਕੀਤੇ ਜਾ ਰਹੇ",
    proposedWindow: "ਭਾਗੀਦਾਰੀ ਦੀਆਂ ਮਿਤੀਆਂ",
    opens: "ਸ਼ੁਰੂ",
    closes: "ਸਮਾਪਤ",
    timezone: "ਸਮਾਂ ਖੇਤਰ",
    approvalGate:
      "ਸ਼ੁਰੂਆਤ ਲਈ ਵੱਖਰੀ ਮਨਜ਼ੂਰੀ ਦੇ ਨਾਲ ਉਤਪਾਦਨ ਸੁਰੱਖਿਆ, ਪਰਦੇਦਾਰੀ, ਸਹਿਮਤੀ, ਬੈਕਅੱਪ ਅਤੇ ਸੰਚਾਲਨ ਦੀ ਮਨਜ਼ੂਰੀ ਲਾਜ਼ਮੀ ਹੈ।",
    noIntake:
      "ਕੋਈ ਜਵਾਬ ਫਾਰਮ ਜਾਂ ਸਰਵੇਖਣ ਐਂਡਪੌਇੰਟ ਨਹੀਂ ਹੈ। ਕੋਈ ਨਿੱਜੀ ਜਾਂ ਰਾਜਨੀਤਿਕ ਰਾਏ ਵਾਲਾ ਡਾਟਾ ਇਕੱਠਾ ਨਹੀਂ ਕੀਤਾ ਜਾ ਰਿਹਾ।",
    regions: {
      majha: { name: "ਮਾਝਾ", description: "ਉੱਤਰ-ਪੱਛਮੀ ਸੱਭਿਆਚਾਰਕ ਖੇਤਰ" },
      malwa: { name: "ਮਾਲਵਾ", description: "ਦੱਖਣੀ ਅਤੇ ਕੇਂਦਰੀ ਸੱਭਿਆਚਾਰਕ ਖੇਤਰ" },
      doaba: {
        name: "ਦੁਆਬਾ",
        description: "ਬਿਆਸ ਅਤੇ ਸਤਲੁਜ ਵਿਚਕਾਰਲਾ ਸੱਭਿਆਚਾਰਕ ਖੇਤਰ",
      },
      puadh: {
        name: "ਪੁਆਧ",
        description: "ਵਿਵਾਦਿਤ ਹੱਦਾਂ ਵਾਲਾ ਦੱਖਣ-ਪੂਰਬੀ ਸੱਭਿਆਚਾਰਕ ਖੇਤਰ",
      },
    },
  },
  hi: {
    regionsEyebrow: "क्षेत्रीय निर्देशिकाएँ",
    regionsTitle: "चार सांस्कृतिक दृष्टियाँ। विधानसभा का एक आधिकारिक मानचित्र।",
    regionsBody:
      "सांस्कृतिक पहचान को चुनावी सीमाओं से अलग रखते हुए माझा, मालवा, दोआबा और पुआध के माध्यम से 117 विधानसभा क्षेत्रों को देखें।",
    classificationNotice:
      "क्षेत्रीय वर्गीकरण स्थानीय समीक्षा के लिए पूर्ण संपादकीय प्रस्ताव है। यह आधिकारिक चुनावी वर्गीकरण नहीं है और अभी सत्यापित नहीं है।",
    reviewBadge: "मानवीय समीक्षा आवश्यक",
    exploreRegion: "निर्देशिका देखें",
    provisionalCount: "अस्थायी प्रविष्टियाँ",
    backHome: "मुखपृष्ठ पर वापस",
    directoryEyebrow: "अस्थायी सांस्कृतिक निर्देशिका",
    directoryTitle: "विधानसभा क्षेत्र",
    directoryBody:
      "नाम, संख्या और आरक्षित सीट की स्थिति निर्वाचन आयोग के परिसीमन अभिलेख के अनुसार हैं। सांस्कृतिक-क्षेत्र वर्गीकरण अस्थायी है।",
    searchLabel: "इस क्षेत्रीय निर्देशिका में खोजें",
    searchPlaceholder: "नाम या क्षेत्र संख्या",
    searchButton: "खोजें",
    clearSearch: "खोज साफ़ करें",
    resultCount: "मिलते क्षेत्र",
    noResults: "इस खोज से कोई विधानसभा क्षेत्र नहीं मिला।",
    officialNameNote: "आधिकारिक अंग्रेज़ी नाम",
    scheduledCasteSeat: "अनुसूचित जाति के लिए आरक्षित सीट",
    sources: "स्रोत और वर्गीकरण स्थिति",
    fatehgarhEyebrow: "लोकसभा क्षेत्र 8 · अनुसूचित जाति के लिए आरक्षित",
    fatehgarhTitle: "फ़तेहगढ़ साहिब संसदीय क्षेत्र — नौ विधानसभा खंड",
    fatehgarhBody:
      "फ़तेहगढ़ साहिब ज़िले में तीन विधानसभा क्षेत्र हैं—54 बस्सी पठाना (अनुसूचित जाति), 55 फ़तेहगढ़ साहिब और 56 अमलोह। यह पृष्ठ व्यापक फ़तेहगढ़ साहिब संसदीय क्षेत्र के नौ विधानसभा खंडों को प्रस्तुत करता है।",
    parliamentaryIndependence:
      "ज़िला प्रशासन का स्रोत ज़िले और संसदीय क्षेत्र की सूचियाँ अलग-अलग देता है। यह आधिकारिक संसदीय समूह अस्थायी सांस्कृतिक-क्षेत्र निर्देशिका से स्वतंत्र है।",
    assemblySegment: "विधानसभा क्षेत्र",
    surveyPreview: "सर्वेक्षण-तैयारी का पूर्वावलोकन देखें",
    surveyEyebrow: "सर्वेक्षण तैयारी का प्रारूप · कोई संग्रह नहीं",
    surveyTitle: "फ़तेहगढ़ साहिब संसदीय क्षेत्र का सर्वेक्षण पूर्वावलोकन",
    surveyBody:
      "भागीदारी की तिथियाँ गोपनीयता, सुरक्षा, सहमति, बैकअप और संचालन-तैयारी की स्वीकृति के बाद ही निश्चित की जाएँगी। यह केवल पढ़ने योग्य पूर्वावलोकन है, सर्वेक्षण शुरू होने की घोषणा नहीं।",
    draftStatus: "प्रारूप · स्वीकृति आवश्यक",
    unavailable: "सर्वेक्षण उत्तर स्वीकार नहीं किए जा रहे",
    proposedWindow: "भागीदारी की तिथियाँ",
    opens: "आरंभ",
    closes: "समाप्ति",
    timezone: "समय क्षेत्र",
    approvalGate:
      "शुरुआत के लिए अलग स्वीकृति के साथ उत्पादन सुरक्षा, गोपनीयता, सहमति, बैकअप और संचालन की मंज़ूरी आवश्यक है।",
    noIntake:
      "कोई उत्तर फ़ॉर्म या सर्वेक्षण एंडपॉइंट नहीं है। कोई निजी या राजनीतिक राय का डेटा एकत्र नहीं किया जा रहा।",
    regions: {
      majha: { name: "माझा", description: "उत्तर-पश्चिमी सांस्कृतिक क्षेत्र" },
      malwa: {
        name: "मालवा",
        description: "दक्षिणी और मध्य सांस्कृतिक क्षेत्र",
      },
      doaba: {
        name: "दोआबा",
        description: "ब्यास और सतलुज के बीच का सांस्कृतिक क्षेत्र",
      },
      puadh: {
        name: "पुआध",
        description: "विवादित किनारों वाला दक्षिण-पूर्वी सांस्कृतिक क्षेत्र",
      },
    },
  },
};

export function getRegionalDictionary(locale: Locale): RegionalDictionary {
  return regionalDictionaries[locale];
}
