import type { Locale } from "@/lib/i18n";

export type SurveyPreviewCopy = {
  previewLabel: string;
  progress: string;
  step: string;
  of: string;
  back: string;
  next: string;
  skip: string;
  optional: string;
  required: string;
  chooseOne: string;
  chooseUpToThree: string;
  consentError: string;
  segmentError: string;
  politicalChoiceError: string;
  politicalChoiceTitle: string;
  politicalYes: string;
  politicalNo: string;
  anonymousDetails: string;
  retentionDetails: string;
  selectionLimit: string;
  reviewTitle: string;
  reviewBody: string;
  answeredCount: string;
  restart: string;
  noSubmission: string;
  questionnaireVersion: string;
  consentVersion: string;
};

export const surveyPreviewCopy: Record<Locale, SurveyPreviewCopy> = {
  en: {
    previewLabel: "Interactive development preview",
    progress: "Questionnaire progress",
    step: "Step",
    of: "of",
    back: "Back",
    next: "Next",
    skip: "Skip this optional question",
    optional: "Optional",
    required: "Required",
    chooseOne: "Choose one answer.",
    chooseUpToThree: "Choose up to three answers.",
    consentError: "Confirm the civic preview consent before continuing.",
    segmentError: "Choose one Assembly segment before continuing.",
    politicalChoiceError:
      "Choose whether to preview the optional political-opinion questions.",
    politicalChoiceTitle:
      "Would you like to preview the separate optional political-opinion questions?",
    politicalYes: "Yes, I separately consent to preview them",
    politicalNo: "No, continue without them",
    anonymousDetails: "Anonymous and identifiable responses",
    retentionDetails: "Retention, withdrawal and privacy contact",
    selectionLimit: "You can choose no more than three answers.",
    reviewTitle: "Preview complete",
    reviewBody:
      "Your selections existed only in this browser tab's memory and have not been submitted or saved.",
    answeredCount: "Questions answered in this preview",
    restart: "Clear preview and start again",
    noSubmission:
      "There is deliberately no submit button or submission endpoint.",
    questionnaireVersion: "Questionnaire",
    consentVersion: "Consent",
  },
  pa: {
    previewLabel: "ਇੰਟਰਐਕਟਿਵ ਵਿਕਾਸੀ ਝਲਕ",
    progress: "ਪ੍ਰਸ਼ਨਾਵਲੀ ਦੀ ਪ੍ਰਗਤੀ",
    step: "ਪੜਾਅ",
    of: "ਵਿੱਚੋਂ",
    back: "ਪਿੱਛੇ",
    next: "ਅੱਗੇ",
    skip: "ਇਹ ਵਿਕਲਪਿਕ ਸਵਾਲ ਛੱਡੋ",
    optional: "ਵਿਕਲਪਿਕ",
    required: "ਲਾਜ਼ਮੀ",
    chooseOne: "ਇੱਕ ਜਵਾਬ ਚੁਣੋ।",
    chooseUpToThree: "ਵੱਧ ਤੋਂ ਵੱਧ ਤਿੰਨ ਜਵਾਬ ਚੁਣੋ।",
    consentError: "ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਨਾਗਰਿਕ ਝਲਕ ਲਈ ਸਹਿਮਤੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
    segmentError: "ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਇੱਕ ਵਿਧਾਨ ਸਭਾ ਹਲਕਾ ਚੁਣੋ।",
    politicalChoiceError:
      "ਚੁਣੋ ਕਿ ਤੁਸੀਂ ਵਿਕਲਪਿਕ ਰਾਜਨੀਤਿਕ-ਰਾਏ ਸਵਾਲਾਂ ਦੀ ਝਲਕ ਵੇਖਣੀ ਹੈ ਜਾਂ ਨਹੀਂ।",
    politicalChoiceTitle:
      "ਕੀ ਤੁਸੀਂ ਵੱਖਰੇ ਵਿਕਲਪਿਕ ਰਾਜਨੀਤਿਕ-ਰਾਏ ਸਵਾਲਾਂ ਦੀ ਝਲਕ ਵੇਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    politicalYes: "ਹਾਂ, ਮੈਂ ਉਨ੍ਹਾਂ ਦੀ ਝਲਕ ਲਈ ਵੱਖਰੀ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ",
    politicalNo: "ਨਹੀਂ, ਉਨ੍ਹਾਂ ਤੋਂ ਬਿਨਾਂ ਜਾਰੀ ਰੱਖੋ",
    anonymousDetails: "ਗੁਮਨਾਮ ਅਤੇ ਪਛਾਣਯੋਗ ਜਵਾਬ",
    retentionDetails: "ਸੰਭਾਲ ਮਿਆਦ, ਸਹਿਮਤੀ ਵਾਪਸੀ ਅਤੇ ਨਿੱਜਤਾ ਸੰਪਰਕ",
    selectionLimit: "ਤੁਸੀਂ ਵੱਧ ਤੋਂ ਵੱਧ ਤਿੰਨ ਜਵਾਬ ਚੁਣ ਸਕਦੇ ਹੋ।",
    reviewTitle: "ਝਲਕ ਪੂਰੀ ਹੋਈ",
    reviewBody:
      "ਤੁਹਾਡੀਆਂ ਚੋਣਾਂ ਸਿਰਫ਼ ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਟੈਬ ਦੀ ਯਾਦ ਵਿੱਚ ਸਨ; ਉਹ ਨਾ ਭੇਜੀਆਂ ਗਈਆਂ ਹਨ ਅਤੇ ਨਾ ਸੰਭਾਲੀਆਂ ਗਈਆਂ ਹਨ।",
    answeredCount: "ਇਸ ਝਲਕ ਵਿੱਚ ਦਿੱਤੇ ਜਵਾਬ",
    restart: "ਝਲਕ ਸਾਫ਼ ਕਰਕੇ ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ",
    noSubmission: "ਜਾਣਬੁੱਝ ਕੇ ਕੋਈ ਭੇਜਣ ਵਾਲਾ ਬਟਨ ਜਾਂ ਸਬਮਿਸ਼ਨ ਐਂਡਪੌਇੰਟ ਨਹੀਂ ਹੈ।",
    questionnaireVersion: "ਪ੍ਰਸ਼ਨਾਵਲੀ",
    consentVersion: "ਸਹਿਮਤੀ",
  },
  hi: {
    previewLabel: "इंटरैक्टिव विकास पूर्वावलोकन",
    progress: "प्रश्नावली की प्रगति",
    step: "चरण",
    of: "में से",
    back: "पीछे",
    next: "आगे",
    skip: "यह वैकल्पिक प्रश्न छोड़ें",
    optional: "वैकल्पिक",
    required: "आवश्यक",
    chooseOne: "एक उत्तर चुनें।",
    chooseUpToThree: "अधिकतम तीन उत्तर चुनें।",
    consentError:
      "आगे बढ़ने से पहले नागरिक पूर्वावलोकन की सहमति की पुष्टि करें।",
    segmentError: "आगे बढ़ने से पहले एक विधानसभा क्षेत्र चुनें।",
    politicalChoiceError:
      "चुनें कि आप वैकल्पिक राजनीतिक-राय प्रश्नों का पूर्वावलोकन देखना चाहते हैं या नहीं।",
    politicalChoiceTitle:
      "क्या आप अलग वैकल्पिक राजनीतिक-राय प्रश्नों का पूर्वावलोकन देखना चाहते हैं?",
    politicalYes:
      "हाँ, मैं उनका पूर्वावलोकन देखने के लिए अलग सहमति देता/देती हूँ",
    politicalNo: "नहीं, उनके बिना आगे बढ़ें",
    anonymousDetails: "अनाम और पहचान योग्य उत्तर",
    retentionDetails: "रखने की अवधि, सहमति वापसी और गोपनीयता संपर्क",
    selectionLimit: "आप अधिकतम तीन उत्तर चुन सकते हैं।",
    reviewTitle: "पूर्वावलोकन पूरा हुआ",
    reviewBody:
      "आपके चयन केवल इस ब्राउज़र टैब की स्मृति में थे; वे न भेजे गए हैं और न सहेजे गए हैं।",
    answeredCount: "इस पूर्वावलोकन में दिए गए उत्तर",
    restart: "पूर्वावलोकन साफ़ करके फिर शुरू करें",
    noSubmission: "जानबूझकर कोई भेजने का बटन या सबमिशन एंडपॉइंट नहीं है।",
    questionnaireVersion: "प्रश्नावली",
    consentVersion: "सहमति",
  },
};
