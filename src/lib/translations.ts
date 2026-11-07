import type { Locale } from "./i18n";
import { BRAND_NAME, STATE_NAME } from "./branding";

export type Dictionary = {
  siteName: string;
  skipToContent: string;
  navigationLabel: string;
  navExplore: string;
  navSurvey: string;
  navResearch: string;
  navSponsor: string;
  languageLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimary: string;
  heroSecondary: string;
  identityLabel: string;
  identityValue: string;
  identityCaption: string;
  exploreEyebrow: string;
  exploreTitle: string;
  exploreBody: string;
  exploreAction: string;
  exploreNote: string;
  surveyEyebrow: string;
  surveyTitle: string;
  surveyBody: string;
  surveyStatus: string;
  surveyPrivacy: string;
  researchEyebrow: string;
  researchTitle: string;
  researchBody: string;
  principleOneTitle: string;
  principleOneBody: string;
  principleTwoTitle: string;
  principleTwoBody: string;
  principleThreeTitle: string;
  principleThreeBody: string;
  sponsorEyebrow: string;
  sponsorTitle: string;
  sponsorBody: string;
  sponsorAction: string;
  sponsorNote: string;
  footerStatement: string;
  privacy: string;
  contact: string;
  placeholder: string;
  rights: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    siteName: BRAND_NAME,
    skipToContent: "Skip to main content",
    navigationLabel: "Primary navigation",
    navExplore: "Constituencies",
    navSurvey: "Upcoming survey",
    navResearch: "Research",
    navSponsor: "Sponsor enquiry",
    languageLabel: "Language",
    heroEyebrow: `Independent civic research · ${STATE_NAME}`,
    heroTitle: "A clearer view of all 117 constituencies.",
    heroBody: `${BRAND_NAME} is an independent civic research platform being built to make constituency-level information easier to find, understand and question.`,
    heroPrimary: "Explore regions",
    heroSecondary: "Read our approach",
    identityLabel: `${STATE_NAME} Legislative Assembly`,
    identityValue: "117",
    identityCaption: "constituencies · one shared public record",
    exploreEyebrow: "Constituency exploration",
    exploreTitle: "Local context, organised constituency by constituency.",
    exploreBody:
      "Browse all 117 official constituency names through a provisional cultural-region index. Regional assignments remain open to documented local review.",
    exploreAction: "Open the regional directory",
    exploreNote: "Cultural regions are not official election boundaries.",
    surveyEyebrow: "Upcoming survey",
    surveyTitle: "A public-interest survey is in preparation.",
    surveyBody:
      "We are designing a transparent survey process with clear consent, limited data collection and published methodology. Responses are not being collected yet.",
    surveyStatus: "Status · Research design",
    surveyPrivacy:
      "No personal or political survey data is collected on this site.",
    researchEyebrow: "Research & methodology",
    researchTitle:
      "Evidence should be traceable, cautious and open to scrutiny.",
    researchBody:
      "Our methodology will explain where information comes from, when it was checked and what remains uncertain. Editorial independence and corrections will be treated as core infrastructure.",
    principleOneTitle: "Source clearly",
    principleOneBody:
      "Cite primary material and distinguish evidence from interpretation.",
    principleTwoTitle: "Verify locally",
    principleTwoBody:
      "Review records consistently before any constituency profile is published.",
    principleThreeTitle: "Correct openly",
    principleThreeBody:
      "Record meaningful revisions and make uncertainty visible to readers.",
    sponsorEyebrow: "Support the work",
    sponsorTitle: "Interested in supporting independent civic research?",
    sponsorBody:
      "A future sponsorship programme will use clear boundaries: support will not purchase editorial influence, favourable coverage or access to survey responses.",
    sponsorAction: "Sponsor enquiry coming soon",
    sponsorNote: "No sponsors are represented or implied at this stage.",
    footerStatement: `Independent civic research for ${STATE_NAME}.`,
    privacy: "Privacy",
    contact: "Contact",
    placeholder: "Verified details are not yet available in this preview",
    rights: "Foundation phase",
  },
  pa: {
    siteName: "ਪੰਜਾਬ 117",
    skipToContent: "ਮੁੱਖ ਸਮੱਗਰੀ ਵੱਲ ਜਾਓ",
    navigationLabel: "ਮੁੱਖ ਨੈਵੀਗੇਸ਼ਨ",
    navExplore: "ਵਿਧਾਨ ਸਭਾ ਹਲਕੇ",
    navSurvey: "ਆਉਣ ਵਾਲਾ ਸਰਵੇਖਣ",
    navResearch: "ਖੋਜ",
    navSponsor: "ਸਹਿਯੋਗ ਬਾਰੇ ਪੁੱਛਗਿੱਛ",
    languageLabel: "ਭਾਸ਼ਾ",
    heroEyebrow: "ਸੁਤੰਤਰ ਨਾਗਰਿਕ ਖੋਜ · ਪੰਜਾਬ",
    heroTitle: "ਸਾਰੇ 117 ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਦੀ ਸਪਸ਼ਟ ਤਸਵੀਰ।",
    heroBody:
      "ਪੰਜਾਬ 117 ਇੱਕ ਸੁਤੰਤਰ, ਬਹੁਭਾਸ਼ੀ ਮੰਚ ਹੈ। ਇਸ ਦਾ ਮਕਸਦ ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਬਾਰੇ ਨਾਗਰਿਕ ਖੋਜ ਨੂੰ ਲੱਭਣਾ, ਸਮਝਣਾ ਅਤੇ ਉਸ ਉੱਤੇ ਸਵਾਲ ਕਰਨਾ ਸੌਖਾ ਬਣਾਉਣਾ ਹੈ।",
    heroPrimary: "ਖੇਤਰਾਂ ਦੀ ਪੜਚੋਲ ਕਰੋ",
    heroSecondary: "ਸਾਡਾ ਤਰੀਕਾ ਪੜ੍ਹੋ",
    identityLabel: "ਪੰਜਾਬ ਵਿਧਾਨ ਸਭਾ",
    identityValue: "117",
    identityCaption: "ਵਿਧਾਨ ਸਭਾ ਹਲਕੇ · ਇੱਕ ਸਾਂਝਾ ਜਨਤਕ ਰਿਕਾਰਡ",
    exploreEyebrow: "ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਦੀ ਪੜਚੋਲ",
    exploreTitle: "ਸਥਾਨਕ ਜਾਣਕਾਰੀ, ਹਰ ਹਲਕੇ ਅਨੁਸਾਰ ਵਿਵਸਥਿਤ।",
    exploreBody:
      "ਸਾਰੇ 117 ਅਧਿਕਾਰਤ ਹਲਕਿਆਂ ਦੇ ਨਾਂ ਆਰਜ਼ੀ ਸੱਭਿਆਚਾਰਕ ਖੇਤਰੀ ਸੂਚੀ ਰਾਹੀਂ ਵੇਖੋ। ਖੇਤਰੀ ਵੰਡ ਲਿਖਤੀ ਸਥਾਨਕ ਸਮੀਖਿਆ ਲਈ ਖੁੱਲ੍ਹੀ ਹੈ।",
    exploreAction: "ਖੇਤਰੀ ਡਾਇਰੈਕਟਰੀ ਖੋਲ੍ਹੋ",
    exploreNote: "ਸੱਭਿਆਚਾਰਕ ਖੇਤਰ ਅਧਿਕਾਰਤ ਚੋਣ ਹੱਦਾਂ ਨਹੀਂ ਹਨ।",
    surveyEyebrow: "ਆਉਣ ਵਾਲਾ ਸਰਵੇਖਣ",
    surveyTitle: "ਜਨਤਕ ਹਿੱਤ ਲਈ ਇੱਕ ਸਰਵੇਖਣ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।",
    surveyBody:
      "ਅਸੀਂ ਸਪਸ਼ਟ ਸਹਿਮਤੀ, ਸੀਮਤ ਡਾਟਾ ਇਕੱਠਾ ਕਰਨ ਅਤੇ ਪ੍ਰਕਾਸ਼ਿਤ ਕਾਰਜ-ਵਿਧੀ ਵਾਲੀ ਪਾਰਦਰਸ਼ੀ ਸਰਵੇਖਣ ਪ੍ਰਕਿਰਿਆ ਤਿਆਰ ਕਰ ਰਹੇ ਹਾਂ। ਹਾਲੇ ਜਵਾਬ ਇਕੱਠੇ ਨਹੀਂ ਕੀਤੇ ਜਾ ਰਹੇ।",
    surveyStatus: "ਸਥਿਤੀ · ਖੋਜ ਦੀ ਰੂਪ-ਰੇਖਾ",
    surveyPrivacy:
      "ਇਸ ਵੈੱਬਸਾਈਟ ਉੱਤੇ ਕੋਈ ਨਿੱਜੀ ਜਾਂ ਰਾਜਨੀਤਿਕ ਸਰਵੇਖਣ ਡਾਟਾ ਇਕੱਠਾ ਨਹੀਂ ਹੁੰਦਾ।",
    researchEyebrow: "ਖੋਜ ਅਤੇ ਕਾਰਜ-ਵਿਧੀ",
    researchTitle:
      "ਸਬੂਤ ਦਾ ਸਰੋਤ ਲੱਭਣਯੋਗ, ਪੇਸ਼ਕਾਰੀ ਸਾਵਧਾਨ ਅਤੇ ਜਾਂਚ ਲਈ ਖੁੱਲ੍ਹੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।",
    researchBody:
      "ਸਾਡੀ ਕਾਰਜ-ਵਿਧੀ ਦੱਸੇਗੀ ਕਿ ਜਾਣਕਾਰੀ ਕਿੱਥੋਂ ਆਈ, ਉਸ ਦੀ ਜਾਂਚ ਕਦੋਂ ਹੋਈ ਅਤੇ ਕੀ ਅਜੇ ਵੀ ਅਨਿਸ਼ਚਿਤ ਹੈ। ਸੰਪਾਦਕੀ ਸੁਤੰਤਰਤਾ ਅਤੇ ਸੋਧਾਂ ਨੂੰ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦਾ ਹਿੱਸਾ ਮੰਨਿਆ ਜਾਵੇਗਾ।",
    principleOneTitle: "ਸਰੋਤ ਸਪਸ਼ਟ ਕਰੋ",
    principleOneBody:
      "ਮੂਲ ਸਮੱਗਰੀ ਦਾ ਹਵਾਲਾ ਦਿਓ ਅਤੇ ਸਬੂਤ ਨੂੰ ਵਿਆਖਿਆ ਤੋਂ ਵੱਖ ਰੱਖੋ।",
    principleTwoTitle: "ਸਥਾਨਕ ਪੱਧਰ ਉੱਤੇ ਤਸਦੀਕ ਕਰੋ",
    principleTwoBody:
      "ਕਿਸੇ ਹਲਕੇ ਦਾ ਪ੍ਰੋਫ਼ਾਈਲ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਰਿਕਾਰਡ ਦੀ ਇਕਸਾਰ ਜਾਂਚ ਕਰੋ।",
    principleThreeTitle: "ਸੋਧਾਂ ਖੁੱਲ੍ਹ ਕੇ ਕਰੋ",
    principleThreeBody:
      "ਮਹੱਤਵਪੂਰਨ ਤਬਦੀਲੀਆਂ ਦਰਜ ਕਰੋ ਅਤੇ ਅਨਿਸ਼ਚਿਤਤਾ ਪਾਠਕਾਂ ਸਾਹਮਣੇ ਰੱਖੋ।",
    sponsorEyebrow: "ਕੰਮ ਵਿੱਚ ਸਹਿਯੋਗ",
    sponsorTitle: "ਕੀ ਤੁਸੀਂ ਸੁਤੰਤਰ ਨਾਗਰਿਕ ਖੋਜ ਦਾ ਸਹਿਯੋਗ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    sponsorBody:
      "ਭਵਿੱਖ ਦੇ ਸਹਿਯੋਗ ਪ੍ਰੋਗਰਾਮ ਦੀਆਂ ਹੱਦਾਂ ਸਪਸ਼ਟ ਹੋਣਗੀਆਂ: ਸਹਿਯੋਗ ਦੇ ਬਦਲੇ ਸੰਪਾਦਕੀ ਪ੍ਰਭਾਵ, ਹੱਕ ਵਿੱਚ ਕਵਰੇਜ ਜਾਂ ਸਰਵੇਖਣ ਜਵਾਬਾਂ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਮਿਲੇਗੀ।",
    sponsorAction: "ਸਹਿਯੋਗ ਬਾਰੇ ਪੁੱਛਗਿੱਛ ਜਲਦੀ ਸ਼ੁਰੂ ਹੋਵੇਗੀ",
    sponsorNote:
      "ਇਸ ਪੜਾਅ ਉੱਤੇ ਕਿਸੇ ਸਹਿਯੋਗੀ ਦੀ ਨੁਮਾਇੰਦਗੀ ਜਾਂ ਸੰਕੇਤ ਨਹੀਂ ਦਿੱਤਾ ਗਿਆ।",
    footerStatement: "ਪੰਜਾਬ ਲਈ ਸੁਤੰਤਰ ਬਹੁਭਾਸ਼ੀ ਨਾਗਰਿਕ ਖੋਜ।",
    privacy: "ਪਰਦੇਦਾਰੀ",
    contact: "ਸੰਪਰਕ",
    placeholder: "ਜਾਣਕਾਰੀ ਜਲਦੀ ਉਪਲਬਧ ਹੋਵੇਗੀ",
    rights: "ਮੁੱਢਲਾ ਪੜਾਅ",
  },
  hi: {
    siteName: "पंजाब 117",
    skipToContent: "मुख्य सामग्री पर जाएँ",
    navigationLabel: "मुख्य नेविगेशन",
    navExplore: "विधानसभा क्षेत्र",
    navSurvey: "आगामी सर्वेक्षण",
    navResearch: "शोध",
    navSponsor: "सहयोग संबंधी पूछताछ",
    languageLabel: "भाषा",
    heroEyebrow: "स्वतंत्र नागरिक शोध · पंजाब",
    heroTitle: "सभी 117 विधानसभा क्षेत्रों की स्पष्ट तस्वीर।",
    heroBody:
      "पंजाब 117 एक स्वतंत्र, बहुभाषी मंच है। इसका उद्देश्य विधानसभा-स्तरीय नागरिक शोध को खोजना, समझना और उस पर सवाल करना आसान बनाना है।",
    heroPrimary: "क्षेत्रों को देखें",
    heroSecondary: "हमारा दृष्टिकोण पढ़ें",
    identityLabel: "पंजाब विधानसभा",
    identityValue: "117",
    identityCaption: "विधानसभा क्षेत्र · एक साझा सार्वजनिक अभिलेख",
    exploreEyebrow: "विधानसभा क्षेत्रों की जानकारी",
    exploreTitle: "स्थानीय संदर्भ, हर विधानसभा क्षेत्र के अनुसार व्यवस्थित।",
    exploreBody:
      "सभी 117 आधिकारिक विधानसभा क्षेत्र नामों को एक अस्थायी सांस्कृतिक-क्षेत्र सूची से देखें। क्षेत्रीय वर्गीकरण लिखित स्थानीय समीक्षा के लिए खुला है।",
    exploreAction: "क्षेत्रीय निर्देशिका खोलें",
    exploreNote: "सांस्कृतिक क्षेत्र आधिकारिक चुनावी सीमाएँ नहीं हैं।",
    surveyEyebrow: "आगामी सर्वेक्षण",
    surveyTitle: "जनहित का एक सर्वेक्षण तैयार किया जा रहा है।",
    surveyBody:
      "हम स्पष्ट सहमति, सीमित डेटा संग्रह और प्रकाशित कार्यप्रणाली वाली पारदर्शी सर्वेक्षण प्रक्रिया तैयार कर रहे हैं। अभी उत्तर एकत्र नहीं किए जा रहे हैं।",
    surveyStatus: "स्थिति · शोध प्रारूप",
    surveyPrivacy:
      "इस वेबसाइट पर कोई निजी या राजनीतिक सर्वेक्षण डेटा एकत्र नहीं किया जाता।",
    researchEyebrow: "शोध और कार्यप्रणाली",
    researchTitle:
      "साक्ष्य का स्रोत पता लगाने योग्य, प्रस्तुति सावधान और जाँच के लिए खुली होनी चाहिए।",
    researchBody:
      "हमारी कार्यप्रणाली बताएगी कि जानकारी कहाँ से आई, उसकी जाँच कब हुई और क्या अब भी अनिश्चित है। संपादकीय स्वतंत्रता और सुधारों को बुनियादी ढाँचे का हिस्सा माना जाएगा।",
    principleOneTitle: "स्रोत स्पष्ट रखें",
    principleOneBody:
      "प्राथमिक सामग्री का संदर्भ दें और साक्ष्य को व्याख्या से अलग रखें।",
    principleTwoTitle: "स्थानीय स्तर पर सत्यापन करें",
    principleTwoBody:
      "किसी क्षेत्र की प्रोफ़ाइल प्रकाशित करने से पहले अभिलेखों की एक समान जाँच करें।",
    principleThreeTitle: "सुधार खुले रूप से करें",
    principleThreeBody:
      "महत्त्वपूर्ण बदलाव दर्ज करें और अनिश्चितता पाठकों के सामने रखें।",
    sponsorEyebrow: "इस कार्य में सहयोग",
    sponsorTitle: "क्या आप स्वतंत्र नागरिक शोध का सहयोग करना चाहते हैं?",
    sponsorBody:
      "भविष्य के सहयोग कार्यक्रम की सीमाएँ स्पष्ट होंगी: सहयोग के बदले संपादकीय प्रभाव, पक्ष में कवरेज या सर्वेक्षण के उत्तरों तक पहुँच नहीं मिलेगी।",
    sponsorAction: "सहयोग संबंधी पूछताछ जल्द शुरू होगी",
    sponsorNote:
      "इस चरण में किसी सहयोगी का प्रतिनिधित्व या संकेत नहीं किया गया है।",
    footerStatement: "पंजाब के लिए स्वतंत्र बहुभाषी नागरिक शोध।",
    privacy: "गोपनीयता",
    contact: "संपर्क",
    placeholder: "जानकारी जल्द उपलब्ध होगी",
    rights: "आधारभूत चरण",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
