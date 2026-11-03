import { fatehgarhSahibSegments } from "@/data/fatehgarh-sahib";
import type { Locale } from "@/lib/i18n";

export const QUESTIONNAIRE_VERSION =
  "fatehgarh-sahib-civic-2026-11-draft-1" as const;

export type LocalizedText = Readonly<Record<Locale, string>>;

export type SurveyOption = {
  id: string;
  label: LocalizedText;
};

export type SurveyQuestion = {
  id: string;
  section: "location" | "civic" | "political_optional";
  prompt: LocalizedText;
  helpText?: LocalizedText;
  responseType: "single_choice" | "multiple_choice";
  required: boolean;
  politicalOpinion: boolean;
  options: readonly SurveyOption[];
};

function text(en: string, pa: string, hi: string): LocalizedText {
  return { en, pa, hi };
}

const fivePointAccessOptions: readonly SurveyOption[] = [
  {
    id: "very_good",
    label: text("Very good", "ਬਹੁਤ ਵਧੀਆ", "बहुत अच्छी"),
  },
  { id: "good", label: text("Good", "ਵਧੀਆ", "अच्छी") },
  { id: "fair", label: text("Fair", "ਠੀਕ-ਠਾਕ", "ठीक-ठाक") },
  { id: "poor", label: text("Poor", "ਕਮਜ਼ੋਰ", "कमज़ोर") },
  {
    id: "very_poor",
    label: text("Very poor", "ਬਹੁਤ ਕਮਜ਼ੋਰ", "बहुत कमज़ोर"),
  },
  {
    id: "prefer_not_to_answer",
    label: text(
      "Prefer not to answer",
      "ਜਵਾਬ ਨਾ ਦੇਣਾ ਪਸੰਦ ਹੈ",
      "उत्तर नहीं देना चाहता/चाहती",
    ),
  },
];

const priorityOptions: readonly SurveyOption[] = [
  {
    id: "roads_transport",
    label: text(
      "Roads and public transport",
      "ਸੜਕਾਂ ਅਤੇ ਜਨਤਕ ਆਵਾਜਾਈ",
      "सड़कें और सार्वजनिक परिवहन",
    ),
  },
  {
    id: "healthcare",
    label: text(
      "Healthcare access",
      "ਸਿਹਤ ਸੇਵਾਵਾਂ ਤੱਕ ਪਹੁੰਚ",
      "स्वास्थ्य सेवाओं तक पहुँच",
    ),
  },
  {
    id: "education",
    label: text("Education", "ਸਿੱਖਿਆ", "शिक्षा"),
  },
  {
    id: "employment",
    label: text(
      "Employment opportunities",
      "ਰੋਜ਼ਗਾਰ ਦੇ ਮੌਕੇ",
      "रोज़गार के अवसर",
    ),
  },
  {
    id: "agriculture_livelihoods",
    label: text(
      "Agriculture and local livelihoods",
      "ਖੇਤੀਬਾੜੀ ਅਤੇ ਸਥਾਨਕ ਰੋਜ਼ੀ-ਰੋਟੀ",
      "कृषि और स्थानीय आजीविका",
    ),
  },
  {
    id: "public_services",
    label: text("Public services", "ਜਨਤਕ ਸੇਵਾਵਾਂ", "सार्वजनिक सेवाएँ"),
  },
  {
    id: "water_sanitation",
    label: text("Water and sanitation", "ਪਾਣੀ ਅਤੇ ਸਫ਼ਾਈ", "पानी और स्वच्छता"),
  },
  {
    id: "safety",
    label: text("Community safety", "ਭਾਈਚਾਰਕ ਸੁਰੱਖਿਆ", "सामुदायिक सुरक्षा"),
  },
  {
    id: "other_structured_review",
    label: text("Another issue", "ਕੋਈ ਹੋਰ ਮੁੱਦਾ", "कोई अन्य मुद्दा"),
  },
  {
    id: "prefer_not_to_answer",
    label: text(
      "Prefer not to answer",
      "ਜਵਾਬ ਨਾ ਦੇਣਾ ਪਸੰਦ ਹੈ",
      "उत्तर नहीं देना चाहता/चाहती",
    ),
  },
];

const localizedSegmentNames: Readonly<Record<number, LocalizedText>> = {
  54: text("Bassi Pathana", "ਬੱਸੀ ਪਠਾਣਾਂ", "बस्सी पठाना"),
  55: text("Fatehgarh Sahib", "ਫ਼ਤਹਿਗੜ੍ਹ ਸਾਹਿਬ", "फ़तेहगढ़ साहिब"),
  56: text("Amloh", "ਅਮਲੋਹ", "अमलोह"),
  57: text("Khanna", "ਖੰਨਾ", "खन्ना"),
  58: text("Samrala", "ਸਮਰਾਲਾ", "समराला"),
  59: text("Sahnewal", "ਸਾਹਨੇਵਾਲ", "साहनेवाल"),
  67: text("Payal", "ਪਾਇਲ", "पायल"),
  69: text("Raikot", "ਰਾਏਕੋਟ", "रायकोट"),
  106: text("Amargarh", "ਅਮਰਗੜ੍ਹ", "अमरगढ़"),
};

const segmentOptions: readonly SurveyOption[] = fatehgarhSahibSegments.map(
  (segment) => {
    const names = localizedSegmentNames[segment.number];
    if (!names) {
      throw new Error(
        `Missing localized name for Assembly segment ${segment.number}`,
      );
    }
    return {
      id: String(segment.number),
      label: text(
        `${segment.number} ${names.en}${segment.reservedForScheduledCastes ? " (SC)" : ""}`,
        `${segment.number} ${names.pa}${segment.reservedForScheduledCastes ? " (ਅਨੁਸੂਚਿਤ ਜਾਤੀ)" : ""}`,
        `${segment.number} ${names.hi}${segment.reservedForScheduledCastes ? " (अनुसूचित जाति)" : ""}`,
      ),
    };
  },
);

export const fatehgarhSahibQuestionnaire = {
  id: "fatehgarh-sahib-civic-survey",
  version: QUESTIONNAIRE_VERSION,
  status: "development_preview_only",
  translationStatus: "human_linguistic_and_legal_review_required",
  inferenceBasis: "voluntary_responses_not_representative_polling",
  questions: [
    {
      id: "assembly_segment",
      section: "location",
      prompt: text(
        "Which Assembly segment do you live in or know best?",
        "ਤੁਸੀਂ ਕਿਹੜੇ ਵਿਧਾਨ ਸਭਾ ਹਲਕੇ ਵਿੱਚ ਰਹਿੰਦੇ ਹੋ ਜਾਂ ਕਿਸ ਹਲਕੇ ਨੂੰ ਸਭ ਤੋਂ ਚੰਗੀ ਤਰ੍ਹਾਂ ਜਾਣਦੇ ਹੋ?",
        "आप किस विधानसभा क्षेत्र में रहते हैं या किस क्षेत्र को सबसे अच्छी तरह जानते हैं?",
      ),
      helpText: text(
        "Choose one of the nine segments in the Fatehgarh Sahib parliamentary constituency.",
        "ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਲੋਕ ਸਭਾ ਹਲਕੇ ਦੇ ਨੌਂ ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਵਿੱਚੋਂ ਇੱਕ ਚੁਣੋ।",
        "फतेहगढ़ साहिब लोकसभा क्षेत्र के नौ विधानसभा क्षेत्रों में से एक चुनें।",
      ),
      responseType: "single_choice",
      required: true,
      politicalOpinion: false,
      options: segmentOptions,
    },
    {
      id: "local_infrastructure",
      section: "civic",
      prompt: text(
        "How would you rate local infrastructure in this area?",
        "ਤੁਸੀਂ ਇਸ ਇਲਾਕੇ ਦੇ ਸਥਾਨਕ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप इस क्षेत्र के स्थानीय बुनियादी ढाँचे को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: fivePointAccessOptions,
    },
    {
      id: "roads_transport",
      section: "civic",
      prompt: text(
        "How would you rate roads and public transport in this area?",
        "ਤੁਸੀਂ ਇਸ ਇਲਾਕੇ ਦੀਆਂ ਸੜਕਾਂ ਅਤੇ ਜਨਤਕ ਆਵਾਜਾਈ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप इस क्षेत्र की सड़कों और सार्वजनिक परिवहन को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: fivePointAccessOptions,
    },
    {
      id: "healthcare_access",
      section: "civic",
      prompt: text(
        "How would you rate access to healthcare services?",
        "ਤੁਸੀਂ ਸਿਹਤ ਸੇਵਾਵਾਂ ਤੱਕ ਪਹੁੰਚ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप स्वास्थ्य सेवाओं तक पहुँच को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: fivePointAccessOptions,
    },
    {
      id: "education_access",
      section: "civic",
      prompt: text(
        "How would you rate access to education and skills training?",
        "ਤੁਸੀਂ ਸਿੱਖਿਆ ਅਤੇ ਹੁਨਰ ਸਿਖਲਾਈ ਤੱਕ ਪਹੁੰਚ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप शिक्षा और कौशल प्रशिक्षण तक पहुँच को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: fivePointAccessOptions,
    },
    {
      id: "employment_opportunities",
      section: "civic",
      prompt: text(
        "How would you rate local employment opportunities?",
        "ਤੁਸੀਂ ਸਥਾਨਕ ਰੋਜ਼ਗਾਰ ਦੇ ਮੌਕਿਆਂ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप स्थानीय रोज़गार के अवसरों को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: fivePointAccessOptions,
    },
    {
      id: "agriculture_livelihoods",
      section: "civic",
      prompt: text(
        "How would you rate support for agriculture and local livelihoods?",
        "ਤੁਸੀਂ ਖੇਤੀਬਾੜੀ ਅਤੇ ਸਥਾਨਕ ਰੋਜ਼ੀ-ਰੋਟੀ ਲਈ ਸਹਾਇਤਾ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप कृषि और स्थानीय आजीविका के लिए सहायता को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: [
        ...fivePointAccessOptions.slice(0, 5),
        {
          id: "not_applicable",
          label: text(
            "Not applicable to me",
            "ਮੇਰੇ ਲਈ ਲਾਗੂ ਨਹੀਂ",
            "मुझ पर लागू नहीं",
          ),
        },
        fivePointAccessOptions[5]!,
      ],
    },
    {
      id: "public_services",
      section: "civic",
      prompt: text(
        "How would you rate access to everyday public services?",
        "ਤੁਸੀਂ ਰੋਜ਼ਾਨਾ ਜਨਤਕ ਸੇਵਾਵਾਂ ਤੱਕ ਪਹੁੰਚ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप रोज़मर्रा की सार्वजनिक सेवाओं तक पहुँच को कैसे आँकेंगे?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: fivePointAccessOptions,
    },
    {
      id: "community_priority",
      section: "civic",
      prompt: text(
        "Which one issue should receive the most attention locally?",
        "ਸਥਾਨਕ ਪੱਧਰ 'ਤੇ ਕਿਹੜੇ ਇੱਕ ਮੁੱਦੇ ਨੂੰ ਸਭ ਤੋਂ ਵੱਧ ਧਿਆਨ ਮਿਲਣਾ ਚਾਹੀਦਾ ਹੈ?",
        "स्थानीय स्तर पर किस एक मुद्दे को सबसे अधिक ध्यान मिलना चाहिए?",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: false,
      options: priorityOptions,
    },
    {
      id: "representative_responsiveness",
      section: "political_optional",
      prompt: text(
        "How would you rate the responsiveness of elected representatives to local concerns?",
        "ਤੁਸੀਂ ਸਥਾਨਕ ਚਿੰਤਾਵਾਂ ਪ੍ਰਤੀ ਚੁਣੇ ਹੋਏ ਨੁਮਾਇੰਦਿਆਂ ਦੀ ਜਵਾਬਦੇਹੀ ਨੂੰ ਕਿਵੇਂ ਦਰਜਾ ਦਿਓਗੇ?",
        "आप स्थानीय चिंताओं के प्रति निर्वाचित प्रतिनिधियों की जवाबदेही को कैसे आँकेंगे?",
      ),
      helpText: text(
        "This optional political-opinion question is shown only after separate consent.",
        "ਇਹ ਵਿਕਲਪਿਕ ਰਾਜਨੀਤਿਕ-ਰਾਏ ਵਾਲਾ ਸਵਾਲ ਵੱਖਰੀ ਸਹਿਮਤੀ ਤੋਂ ਬਾਅਦ ਹੀ ਦਿਖਾਇਆ ਜਾਂਦਾ ਹੈ।",
        "यह वैकल्पिक राजनीतिक-राय प्रश्न अलग सहमति के बाद ही दिखाया जाता है।",
      ),
      responseType: "single_choice",
      required: false,
      politicalOpinion: true,
      options: fivePointAccessOptions,
    },
    {
      id: "public_decision_factors",
      section: "political_optional",
      prompt: text(
        "Which public issues matter most when you assess elected representatives? Select up to three.",
        "ਚੁਣੇ ਹੋਏ ਨੁਮਾਇੰਦਿਆਂ ਦਾ ਮੁਲਾਂਕਣ ਕਰਦੇ ਸਮੇਂ ਤੁਹਾਡੇ ਲਈ ਕਿਹੜੇ ਜਨਤਕ ਮੁੱਦੇ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਹਨ? ਵੱਧ ਤੋਂ ਵੱਧ ਤਿੰਨ ਚੁਣੋ।",
        "निर्वाचित प्रतिनिधियों का आकलन करते समय आपके लिए कौन-से सार्वजनिक मुद्दे सबसे महत्वपूर्ण हैं? अधिकतम तीन चुनें।",
      ),
      responseType: "multiple_choice",
      required: false,
      politicalOpinion: true,
      options: priorityOptions.filter(
        ({ id }) => id !== "prefer_not_to_answer",
      ),
    },
  ] as const satisfies readonly SurveyQuestion[],
} as const;

export type QuestionnaireQuestionId =
  (typeof fatehgarhSahibQuestionnaire.questions)[number]["id"];

export function getQuestionnaireQuestions(
  includePoliticalOpinion: boolean,
): readonly SurveyQuestion[] {
  return fatehgarhSahibQuestionnaire.questions.filter(
    (question) => includePoliticalOpinion || !question.politicalOpinion,
  );
}
