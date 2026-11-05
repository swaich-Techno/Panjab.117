import type { Locale } from "@/lib/i18n";

export type RegistrationPreviewCopy = {
  entryLink: string;
  backLink: string;
  eyebrow: string;
  title: string;
  introduction: string;
  syntheticOnly: string;
  draftTranslation: string;
  segmentLegend: string;
  segmentPrompt: string;
  partyLegend: string;
  partyPrompt: string;
  othersPrompt: string;
  allianceUnavailable: string;
  organisationNotice: string;
  candidateHeading: string;
  candidateNotAnnounced: string;
  candidateStatus: string;
  candidateStatusOfficial: string;
  candidateStatusReported: string;
  source: string;
  lastVerified: string;
  capacityHeading: string;
  capacityNotice: string;
  privacyNotice: string;
  noPublicCounters: string;
  notRepresentative: string;
  consentHeading: string;
  registrationConsent: string;
  politicalConsent: string;
  opinionChoicesHeading: string;
  opinionChoicesNotice: string;
  generateConfirmation: string;
  reset: string;
  errorMissingSegment: string;
  errorMissingParty: string;
  errorMissingOther: string;
  errorMissingConsent: string;
  confirmationHeading: string;
  confirmationBody: string;
};

export const registrationPreviewDictionaries: Record<
  Locale,
  RegistrationPreviewCopy
> = {
  en: {
    entryLink: "View synthetic party-registration prototype",
    backLink: "Back to Fatehgarh Sahib",
    eyebrow: "Local development prototype · no registration collection",
    title: "Party-registration and candidate-directory prototype",
    introduction:
      "Explore a proposed nine-segment registration flow using public candidate records and synthetic interaction only.",
    syntheticOnly:
      "Nothing entered here is transmitted, stored or accepted as a real registration. It does not create party membership or a formal election nomination. There is no submission API or production database.",
    draftTranslation: "English source copy",
    segmentLegend: "1. Select an Assembly segment",
    segmentPrompt: "Choose one of the nine pilot segments",
    partyLegend: "2. Choose a party or political organisation",
    partyPrompt: "Choose a top-level registration category",
    othersPrompt: "Choose the specific option under Others",
    allianceUnavailable:
      "Unavailable until a formal alliance and constituency arrangements are verified by an administrator.",
    organisationNotice:
      "Akali Dal (Waris Punjab De) is described as a political organisation because ECI party-registration status is unresolved.",
    candidateHeading: "Candidate information",
    candidateNotAnnounced: "Candidate not yet announced",
    candidateStatus: "Announcement status",
    candidateStatusOfficial: "Officially announced by party",
    candidateStatusReported: "Reported/proposed, not confirmed",
    source: "Source",
    lastVerified: "Last verified",
    capacityHeading: "3. Review the provisional capacity policy",
    capacityNotice:
      "Maximum 100 eligible confirmed registrations per active top-level category across all nine Assembly segments—not 100 per segment.",
    privacyNotice:
      "Party selection may reveal political opinion and requires separate voluntary consent and stronger privacy controls before any real use.",
    noPublicCounters:
      "Private category counts and registration details must never be published.",
    notRepresentative:
      "A quota-balanced registration group is not public support, vote share, a representative sample or an election prediction.",
    consentHeading: "4. Review the synthetic consent preview",
    registrationConsent:
      "I understand this is a synthetic prototype and does not create a real registration.",
    politicalConsent:
      "I voluntarily agree to use a synthetic party choice for this local preview. I understand a real political-opinion choice would require separate consent.",
    opinionChoicesHeading: "Optional opinion questions are separate",
    opinionChoicesNotice:
      "Undecided, None and Prefer not to say belong only to optional opinion questions. They are not registration categories.",
    generateConfirmation: "Generate synthetic confirmation",
    reset: "Reset prototype",
    errorMissingSegment: "Select an Assembly segment to continue.",
    errorMissingParty: "Select an available party category to continue.",
    errorMissingOther: "Choose a specific option under Others.",
    errorMissingConsent: "Both synthetic consent statements are required.",
    confirmationHeading: "Synthetic confirmation only",
    confirmationBody:
      "This demonstration confirmation exists only in page memory and is not a registration receipt.",
  },
  pa: {
    entryLink: "ਪਾਰਟੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਦਾ ਸਿੰਥੈਟਿਕ ਨਮੂਨਾ ਵੇਖੋ",
    backLink: "ਫ਼ਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਵੱਲ ਵਾਪਸ",
    eyebrow: "ਸਥਾਨਕ ਵਿਕਾਸ ਨਮੂਨਾ · ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਇਕੱਠੀ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ",
    title: "ਪਾਰਟੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਉਮੀਦਵਾਰ ਡਾਇਰੈਕਟਰੀ ਦਾ ਨਮੂਨਾ",
    introduction:
      "ਸਿਰਫ਼ ਜਨਤਕ ਉਮੀਦਵਾਰ ਰਿਕਾਰਡ ਅਤੇ ਸਿੰਥੈਟਿਕ ਕਿਰਿਆਵਾਂ ਨਾਲ ਨੌਂ ਹਲਕਿਆਂ ਲਈ ਪ੍ਰਸਤਾਵਿਤ ਪ੍ਰਕਿਰਿਆ ਵੇਖੋ।",
    syntheticOnly:
      "ਇੱਥੇ ਚੁਣੀ ਕੋਈ ਜਾਣਕਾਰੀ ਭੇਜੀ, ਸੰਭਾਲੀ ਜਾਂ ਅਸਲੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਵਜੋਂ ਸਵੀਕਾਰ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ। ਇਹ ਪਾਰਟੀ ਮੈਂਬਰਸ਼ਿਪ ਜਾਂ ਰਸਮੀ ਚੋਣ ਨਾਮਜ਼ਦਗੀ ਨਹੀਂ ਬਣਾਉਂਦੀ। ਕੋਈ ਸਬਮਿਸ਼ਨ API ਜਾਂ ਉਤਪਾਦਨ ਡਾਟਾਬੇਸ ਨਹੀਂ ਹੈ।",
    draftTranslation: "ਪੰਜਾਬੀ ਖਰੜਾ · ਮਨੁੱਖੀ ਭਾਸ਼ਾਈ ਸਮੀਖਿਆ ਬਾਕੀ",
    segmentLegend: "1. ਵਿਧਾਨ ਸਭਾ ਹਲਕਾ ਚੁਣੋ",
    segmentPrompt: "ਨੌਂ ਪਾਇਲਟ ਹਲਕਿਆਂ ਵਿੱਚੋਂ ਇੱਕ ਚੁਣੋ",
    partyLegend: "2. ਪਾਰਟੀ ਜਾਂ ਰਾਜਨੀਤਿਕ ਸੰਗਠਨ ਚੁਣੋ",
    partyPrompt: "ਮੁੱਖ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸ਼੍ਰੇਣੀ ਚੁਣੋ",
    othersPrompt: "‘ਹੋਰ’ ਹੇਠ ਖਾਸ ਚੋਣ ਕਰੋ",
    allianceUnavailable:
      "ਰਸਮੀ ਗਠਜੋੜ ਅਤੇ ਹਲਕਾ-ਵਾਰ ਸਮਝੌਤੇ ਦੀ ਪ੍ਰਸ਼ਾਸਕੀ ਤਸਦੀਕ ਤੱਕ ਉਪਲਬਧ ਨਹੀਂ।",
    organisationNotice:
      "ਅਕਾਲੀ ਦਲ (ਵਾਰਿਸ ਪੰਜਾਬ ਦੇ) ਨੂੰ ਰਾਜਨੀਤਿਕ ਸੰਗਠਨ ਕਿਹਾ ਗਿਆ ਹੈ ਕਿਉਂਕਿ ECI ਪਾਰਟੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਦੀ ਸਥਿਤੀ ਅਸਪਸ਼ਟ ਹੈ।",
    candidateHeading: "ਉਮੀਦਵਾਰ ਜਾਣਕਾਰੀ",
    candidateNotAnnounced: "ਉਮੀਦਵਾਰ ਦਾ ਹਾਲੇ ਐਲਾਨ ਨਹੀਂ ਹੋਇਆ",
    candidateStatus: "ਐਲਾਨ ਦੀ ਸਥਿਤੀ",
    candidateStatusOfficial: "ਪਾਰਟੀ ਵੱਲੋਂ ਅਧਿਕਾਰਤ ਐਲਾਨ",
    candidateStatusReported: "ਰਿਪੋਰਟ ਕੀਤਾ/ਪ੍ਰਸਤਾਵਿਤ, ਪੁਸ਼ਟੀ ਨਹੀਂ",
    source: "ਸਰੋਤ",
    lastVerified: "ਆਖ਼ਰੀ ਤਸਦੀਕ",
    capacityHeading: "3. ਆਰਜ਼ੀ ਸਮਰੱਥਾ ਨੀਤੀ ਪੜ੍ਹੋ",
    capacityNotice:
      "ਸਾਰੇ ਨੌਂ ਹਲਕਿਆਂ ਵਿੱਚ ਹਰ ਸਰਗਰਮ ਮੁੱਖ ਸ਼੍ਰੇਣੀ ਲਈ ਵੱਧ ਤੋਂ ਵੱਧ 100 ਯੋਗ ਪੁਸ਼ਟੀਸ਼ੁਦਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ—ਹਰ ਹਲਕੇ ਲਈ 100 ਨਹੀਂ।",
    privacyNotice:
      "ਪਾਰਟੀ ਚੋਣ ਰਾਜਨੀਤਿਕ ਰਾਏ ਦੱਸ ਸਕਦੀ ਹੈ; ਅਸਲੀ ਵਰਤੋਂ ਤੋਂ ਪਹਿਲਾਂ ਵੱਖਰੀ ਸਵੈਛਿਕ ਸਹਿਮਤੀ ਅਤੇ ਮਜ਼ਬੂਤ ਪਰਦੇਦਾਰੀ ਲਾਜ਼ਮੀ ਹੈ।",
    noPublicCounters:
      "ਨਿੱਜੀ ਸ਼੍ਰੇਣੀ ਗਿਣਤੀਆਂ ਅਤੇ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਵੇਰਵੇ ਜਨਤਕ ਨਹੀਂ ਕੀਤੇ ਜਾਣੇ।",
    notRepresentative:
      "ਕੋਟਾ-ਅਧਾਰਿਤ ਸਮੂਹ ਲੋਕ ਸਮਰਥਨ, ਵੋਟ ਹਿੱਸਾ, ਨੁਮਾਇੰਦਾ ਨਮੂਨਾ ਜਾਂ ਚੋਣ ਅਨੁਮਾਨ ਨਹੀਂ ਹੈ।",
    consentHeading: "4. ਸਿੰਥੈਟਿਕ ਸਹਿਮਤੀ ਦੀ ਝਲਕ ਪੜ੍ਹੋ",
    registrationConsent:
      "ਮੈਂ ਸਮਝਦਾ/ਸਮਝਦੀ ਹਾਂ ਕਿ ਇਹ ਸਿੰਥੈਟਿਕ ਨਮੂਨਾ ਹੈ ਅਤੇ ਅਸਲੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਬਣਾਉਂਦਾ।",
    politicalConsent:
      "ਮੈਂ ਇਸ ਸਥਾਨਕ ਝਲਕ ਲਈ ਸਿੰਥੈਟਿਕ ਪਾਰਟੀ ਚੋਣ ਲਈ ਸਵੈਛਿਕ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ। ਅਸਲੀ ਰਾਜਨੀਤਿਕ ਰਾਏ ਲਈ ਵੱਖਰੀ ਸਹਿਮਤੀ ਲੋੜੀਂਦੀ ਹੋਵੇਗੀ।",
    opinionChoicesHeading: "ਚੋਣਵੀਂ ਰਾਏ ਵਾਲੇ ਸਵਾਲ ਵੱਖਰੇ ਹਨ",
    opinionChoicesNotice:
      "ਅਣਫ਼ੈਸਲਾ, ਕੋਈ ਨਹੀਂ ਅਤੇ ਦੱਸਣਾ ਨਹੀਂ ਚਾਹੁੰਦਾ/ਚਾਹੁੰਦੀ ਸਿਰਫ਼ ਚੋਣਵੀਂ ਰਾਏ ਦੇ ਸਵਾਲਾਂ ਲਈ ਹਨ। ਇਹ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸ਼੍ਰੇਣੀਆਂ ਨਹੀਂ ਹਨ।",
    generateConfirmation: "ਸਿੰਥੈਟਿਕ ਪੁਸ਼ਟੀ ਬਣਾਓ",
    reset: "ਨਮੂਨਾ ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ",
    errorMissingSegment: "ਅੱਗੇ ਵਧਣ ਲਈ ਵਿਧਾਨ ਸਭਾ ਹਲਕਾ ਚੁਣੋ।",
    errorMissingParty: "ਅੱਗੇ ਵਧਣ ਲਈ ਉਪਲਬਧ ਪਾਰਟੀ ਸ਼੍ਰੇਣੀ ਚੁਣੋ।",
    errorMissingOther: "‘ਹੋਰ’ ਹੇਠ ਖਾਸ ਚੋਣ ਕਰੋ।",
    errorMissingConsent: "ਦੋਵੇਂ ਸਿੰਥੈਟਿਕ ਸਹਿਮਤੀ ਬਿਆਨ ਲਾਜ਼ਮੀ ਹਨ।",
    confirmationHeading: "ਸਿਰਫ਼ ਸਿੰਥੈਟਿਕ ਪੁਸ਼ਟੀ",
    confirmationBody:
      "ਇਹ ਨਮੂਨਾ ਪੁਸ਼ਟੀ ਸਿਰਫ਼ ਸਫ਼ੇ ਦੀ ਮੈਮਰੀ ਵਿੱਚ ਹੈ ਅਤੇ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਰਸੀਦ ਨਹੀਂ ਹੈ।",
  },
  hi: {
    entryLink: "पार्टी पंजीकरण का सिंथेटिक नमूना देखें",
    backLink: "फ़तेहगढ़ साहिब पर वापस जाएँ",
    eyebrow: "स्थानीय विकास नमूना · कोई पंजीकरण संग्रह नहीं",
    title: "पार्टी पंजीकरण और उम्मीदवार निर्देशिका का नमूना",
    introduction:
      "केवल सार्वजनिक उम्मीदवार अभिलेख और सिंथेटिक क्रिया के साथ नौ क्षेत्रों के प्रस्तावित प्रवाह को देखें।",
    syntheticOnly:
      "यहाँ चुनी गई कोई जानकारी भेजी, सहेजी या वास्तविक पंजीकरण के रूप में स्वीकार नहीं की जाती। इससे पार्टी सदस्यता या औपचारिक चुनाव नामांकन नहीं बनता। कोई सबमिशन API या उत्पादन डेटाबेस नहीं है।",
    draftTranslation: "हिन्दी प्रारूप · मानवीय भाषा समीक्षा लंबित",
    segmentLegend: "1. विधानसभा क्षेत्र चुनें",
    segmentPrompt: "नौ पायलट क्षेत्रों में से एक चुनें",
    partyLegend: "2. पार्टी या राजनीतिक संगठन चुनें",
    partyPrompt: "मुख्य पंजीकरण श्रेणी चुनें",
    othersPrompt: "‘अन्य’ के अंतर्गत स्पष्ट विकल्प चुनें",
    allianceUnavailable:
      "औपचारिक गठबंधन और क्षेत्रवार व्यवस्था की प्रशासकीय पुष्टि होने तक अनुपलब्ध।",
    organisationNotice:
      "अकाली दल (वारिस पंजाब दे) को राजनीतिक संगठन कहा गया है क्योंकि ECI पार्टी-पंजीकरण स्थिति की पुष्टि नहीं हुई है।",
    candidateHeading: "उम्मीदवार जानकारी",
    candidateNotAnnounced: "उम्मीदवार की घोषणा अभी नहीं हुई",
    candidateStatus: "घोषणा की स्थिति",
    candidateStatusOfficial: "पार्टी द्वारा आधिकारिक घोषणा",
    candidateStatusReported: "रिपोर्ट/प्रस्तावित, पुष्टि नहीं",
    source: "स्रोत",
    lastVerified: "अंतिम सत्यापन",
    capacityHeading: "3. अस्थायी क्षमता नीति पढ़ें",
    capacityNotice:
      "सभी नौ क्षेत्रों में प्रत्येक सक्रिय मुख्य श्रेणी के लिए अधिकतम 100 पात्र पुष्ट पंजीकरण—हर क्षेत्र के लिए 100 नहीं।",
    privacyNotice:
      "पार्टी चयन राजनीतिक राय प्रकट कर सकता है; वास्तविक उपयोग से पहले अलग स्वैच्छिक सहमति और मजबूत गोपनीयता नियंत्रण आवश्यक हैं।",
    noPublicCounters:
      "निजी श्रेणी गणना और पंजीकरण विवरण सार्वजनिक नहीं किए जाने चाहिए।",
    notRepresentative:
      "कोटा-संतुलित समूह जन समर्थन, मत प्रतिशत, प्रतिनिधि नमूना या चुनाव पूर्वानुमान नहीं है।",
    consentHeading: "4. सिंथेटिक सहमति पूर्वावलोकन पढ़ें",
    registrationConsent:
      "मैं समझता/समझती हूँ कि यह सिंथेटिक नमूना है और वास्तविक पंजीकरण नहीं बनाता।",
    politicalConsent:
      "मैं इस स्थानीय पूर्वावलोकन के लिए सिंथेटिक पार्टी चयन पर स्वेच्छा से सहमत हूँ। वास्तविक राजनीतिक राय के लिए अलग सहमति आवश्यक होगी।",
    opinionChoicesHeading: "वैकल्पिक राय प्रश्न अलग हैं",
    opinionChoicesNotice:
      "अनिर्णीत, कोई नहीं और बताना नहीं चाहता/चाहती केवल वैकल्पिक राय प्रश्नों के लिए हैं। ये पंजीकरण श्रेणियाँ नहीं हैं।",
    generateConfirmation: "सिंथेटिक पुष्टि बनाएँ",
    reset: "नमूना फिर शुरू करें",
    errorMissingSegment: "आगे बढ़ने के लिए विधानसभा क्षेत्र चुनें।",
    errorMissingParty: "आगे बढ़ने के लिए उपलब्ध पार्टी श्रेणी चुनें।",
    errorMissingOther: "‘अन्य’ के अंतर्गत स्पष्ट विकल्प चुनें।",
    errorMissingConsent: "दोनों सिंथेटिक सहमति कथन आवश्यक हैं।",
    confirmationHeading: "केवल सिंथेटिक पुष्टि",
    confirmationBody:
      "यह प्रदर्शन पुष्टि केवल पृष्ठ की स्मृति में रहती है और पंजीकरण रसीद नहीं है।",
  },
};

export function getRegistrationPreviewCopy(
  locale: Locale,
): RegistrationPreviewCopy {
  return registrationPreviewDictionaries[locale];
}
