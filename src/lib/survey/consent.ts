import { createHmac } from "node:crypto";

import type { Locale } from "@/lib/i18n";

import type { LocalizedText } from "./questionnaire";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";

export const CONSENT_NOTICE_VERSION =
  "fatehgarh-sahib-consent-2026-11-draft-1" as const;

function text(en: string, pa: string, hi: string): LocalizedText {
  return { en, pa, hi };
}

export type ConsentNotice = {
  version: typeof CONSENT_NOTICE_VERSION;
  translationStatus: "human_linguistic_and_legal_review_required";
  title: LocalizedText;
  voluntary: LocalizedText;
  purpose: LocalizedText;
  dataCollected: LocalizedText;
  dataNotCollectedInPreview: LocalizedText;
  anonymousExplanation: LocalizedText;
  identifiableExplanation: LocalizedText;
  retention: LocalizedText;
  withdrawal: LocalizedText;
  privacyContact: LocalizedText;
  coreConsentLabel: LocalizedText;
  politicalTitle: LocalizedText;
  politicalExplanation: LocalizedText;
  politicalConsentLabel: LocalizedText;
  politicalDeclineLabel: LocalizedText;
  nonRepresentativeNotice: LocalizedText;
  reviewRequired: LocalizedText;
};

export const consentNotice: ConsentNotice = {
  version: CONSENT_NOTICE_VERSION,
  translationStatus: "human_linguistic_and_legal_review_required",
  title: text(
    "Participant information and consent",
    "ਭਾਗੀਦਾਰ ਜਾਣਕਾਰੀ ਅਤੇ ਸਹਿਮਤੀ",
    "प्रतिभागी जानकारी और सहमति",
  ),
  voluntary: text(
    "Taking part is voluntary. You may skip optional questions or stop at any time without penalty. Choosing not to participate will not affect any public service, benefit or relationship.",
    "ਹਿੱਸਾ ਲੈਣਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਵੈਛਿਕ ਹੈ। ਤੁਸੀਂ ਵਿਕਲਪਿਕ ਸਵਾਲ ਛੱਡ ਸਕਦੇ ਹੋ ਜਾਂ ਬਿਨਾਂ ਕਿਸੇ ਨੁਕਸਾਨ ਦੇ ਕਿਸੇ ਵੀ ਵੇਲੇ ਰੁਕ ਸਕਦੇ ਹੋ। ਹਿੱਸਾ ਨਾ ਲੈਣ ਨਾਲ ਕਿਸੇ ਜਨਤਕ ਸੇਵਾ, ਲਾਭ ਜਾਂ ਸੰਬੰਧ 'ਤੇ ਅਸਰ ਨਹੀਂ ਪਵੇਗਾ।",
    "भाग लेना पूरी तरह स्वैच्छिक है। आप वैकल्पिक प्रश्न छोड़ सकते हैं या बिना किसी नुकसान के किसी भी समय रुक सकते हैं। भाग न लेने से किसी सार्वजनिक सेवा, लाभ या संबंध पर असर नहीं पड़ेगा।",
  ),
  purpose: text(
    "The proposed survey would study local civic priorities across the nine Assembly segments of the Fatehgarh Sahib parliamentary constituency. It is not an election, campaign or representative opinion poll.",
    "ਪ੍ਰਸਤਾਵਿਤ ਸਰਵੇਖਣ ਦਾ ਮਕਸਦ ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ ਲੋਕ ਸਭਾ ਹਲਕੇ ਦੇ ਨੌਂ ਵਿਧਾਨ ਸਭਾ ਹਲਕਿਆਂ ਵਿੱਚ ਸਥਾਨਕ ਨਾਗਰਿਕ ਤਰਜੀਹਾਂ ਦਾ ਅਧਿਐਨ ਕਰਨਾ ਹੈ। ਇਹ ਕੋਈ ਚੋਣ, ਚੋਣ ਪ੍ਰਚਾਰ ਜਾਂ ਪ੍ਰਤੀਨਿਧਕ ਰਾਏ-ਸਰਵੇਖਣ ਨਹੀਂ ਹੈ।",
    "प्रस्तावित सर्वेक्षण का उद्देश्य फतेहगढ़ साहिब लोकसभा क्षेत्र के नौ विधानसभा क्षेत्रों में स्थानीय नागरिक प्राथमिकताओं का अध्ययन करना है। यह कोई चुनाव, चुनाव प्रचार या प्रतिनिधि जनमत सर्वेक्षण नहीं है।",
  ),
  dataCollected: text(
    "If separately approved for launch, the civic path would collect your selected Assembly segment and structured answers about local services and priorities. Optional political-opinion answers would be collected only after separate consent.",
    "ਜੇ ਲਾਂਚ ਲਈ ਵੱਖਰੀ ਮਨਜ਼ੂਰੀ ਮਿਲਦੀ ਹੈ, ਤਾਂ ਨਾਗਰਿਕ ਭਾਗ ਤੁਹਾਡਾ ਚੁਣਿਆ ਵਿਧਾਨ ਸਭਾ ਹਲਕਾ ਅਤੇ ਸਥਾਨਕ ਸੇਵਾਵਾਂ ਤੇ ਤਰਜੀਹਾਂ ਬਾਰੇ ਬਣਤਰਬੱਧ ਜਵਾਬ ਇਕੱਠੇ ਕਰੇਗਾ। ਵਿਕਲਪਿਕ ਰਾਜਨੀਤਿਕ ਰਾਏ ਵਾਲੇ ਜਵਾਬ ਸਿਰਫ਼ ਵੱਖਰੀ ਸਹਿਮਤੀ ਤੋਂ ਬਾਅਦ ਹੀ ਲਏ ਜਾਣਗੇ।",
    "यदि लॉन्च के लिए अलग मंज़ूरी मिलती है, तो नागरिक भाग आपका चुना विधानसभा क्षेत्र और स्थानीय सेवाओं व प्राथमिकताओं पर संरचित उत्तर एकत्र करेगा। वैकल्पिक राजनीतिक राय के उत्तर केवल अलग सहमति के बाद लिए जाएँगे।",
  ),
  dataNotCollectedInPreview: text(
    "This development preview does not transmit or save answers, identity, contact details, IP-derived identifiers or political opinions.",
    "ਇਹ ਵਿਕਾਸੀ ਝਲਕ ਜਵਾਬ, ਪਛਾਣ, ਸੰਪਰਕ ਵੇਰਵੇ, IP ਤੋਂ ਬਣੇ ਪਛਾਣਕਰਤਾ ਜਾਂ ਰਾਜਨੀਤਿਕ ਰਾਏ ਨਾ ਭੇਜਦੀ ਹੈ ਅਤੇ ਨਾ ਸੰਭਾਲਦੀ ਹੈ।",
    "यह विकास पूर्वावलोकन उत्तर, पहचान, संपर्क विवरण, IP से बने पहचानकर्ता या राजनीतिक राय न भेजता है और न सहेजता है।",
  ),
  anonymousExplanation: text(
    "Anonymous response means no name or contact detail is attached. A one-time withdrawal code would be needed to locate it later; without that code, deletion of a specific anonymous response may be impossible by design.",
    "ਗੁਮਨਾਮ ਜਵਾਬ ਦਾ ਅਰਥ ਹੈ ਕਿ ਨਾਮ ਜਾਂ ਸੰਪਰਕ ਵੇਰਵਾ ਨਾਲ ਨਹੀਂ ਜੋੜਿਆ ਜਾਂਦਾ। ਬਾਅਦ ਵਿੱਚ ਜਵਾਬ ਲੱਭਣ ਲਈ ਇੱਕ ਵਾਰ ਦਿੱਤਾ ਵਾਪਸੀ ਕੋਡ ਲੋੜੀਂਦਾ ਹੋਵੇਗਾ; ਇਸ ਕੋਡ ਤੋਂ ਬਿਨਾਂ ਕਿਸੇ ਖਾਸ ਗੁਮਨਾਮ ਜਵਾਬ ਨੂੰ ਮਿਟਾਉਣਾ ਬਣਤਰ ਅਨੁਸਾਰ ਸੰਭਵ ਨਾ ਹੋ ਸਕਦਾ ਹੈ।",
    "अनाम उत्तर का अर्थ है कि नाम या संपर्क विवरण उससे नहीं जोड़ा जाता। बाद में उत्तर खोजने के लिए एक बार दिया गया वापसी कोड आवश्यक होगा; इस कोड के बिना किसी विशेष अनाम उत्तर को मिटाना व्यवस्था के अनुसार संभव नहीं हो सकता।",
  ),
  identifiableExplanation: text(
    "An identifiable response would use optional contact details stored separately from answers and retained for a shorter approved period. This option is not implemented in the preview.",
    "ਪਛਾਣਯੋਗ ਜਵਾਬ ਵਿੱਚ ਵਿਕਲਪਿਕ ਸੰਪਰਕ ਵੇਰਵੇ ਜਵਾਬਾਂ ਤੋਂ ਵੱਖ ਰੱਖੇ ਜਾਣਗੇ ਅਤੇ ਘੱਟ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਮਿਆਦ ਲਈ ਸੰਭਾਲੇ ਜਾਣਗੇ। ਇਹ ਵਿਕਲਪ ਝਲਕ ਵਿੱਚ ਲਾਗੂ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।",
    "पहचान योग्य उत्तर में वैकल्पिक संपर्क विवरण उत्तरों से अलग रखे जाएँगे और कम स्वीकृत अवधि तक रखे जाएँगे। यह विकल्प पूर्वावलोकन में लागू नहीं है।",
  ),
  retention: text(
    "Proposed limits: survey answers for no more than 12 months after collection closes; optional contact details for 30–90 days; deletion and consent evidence only for an approved compliance period. Exact periods require legal and privacy approval before launch.",
    "ਪ੍ਰਸਤਾਵਿਤ ਹੱਦਾਂ: ਸਰਵੇਖਣ ਬੰਦ ਹੋਣ ਤੋਂ ਬਾਅਦ ਜਵਾਬ ਵੱਧ ਤੋਂ ਵੱਧ 12 ਮਹੀਨੇ; ਵਿਕਲਪਿਕ ਸੰਪਰਕ ਵੇਰਵੇ 30–90 ਦਿਨ; ਮਿਟਾਉਣ ਅਤੇ ਸਹਿਮਤੀ ਦਾ ਘੱਟੋ-ਘੱਟ ਸਬੂਤ ਸਿਰਫ਼ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਪਾਲਣਾ ਮਿਆਦ ਲਈ। ਸਹੀ ਮਿਆਦਾਂ ਲਈ ਲਾਂਚ ਤੋਂ ਪਹਿਲਾਂ ਕਾਨੂੰਨੀ ਅਤੇ ਨਿੱਜਤਾ ਮਨਜ਼ੂਰੀ ਲਾਜ਼ਮੀ ਹੈ।",
    "प्रस्तावित सीमाएँ: सर्वेक्षण बंद होने के बाद उत्तर अधिकतम 12 महीने; वैकल्पिक संपर्क विवरण 30–90 दिन; मिटाने और सहमति का न्यूनतम प्रमाण केवल स्वीकृत अनुपालन अवधि तक। सही अवधियों के लिए लॉन्च से पहले कानूनी और गोपनीयता मंज़ूरी आवश्यक है।",
  ),
  withdrawal: text(
    "You would be able to withdraw consent through a verified privacy-request channel as easily as consent was given. Future processing would stop and an approved deletion workflow would begin. Processing already completed lawfully before withdrawal would not be undone.",
    "ਤੁਸੀਂ ਇੱਕ ਤਸਦੀਕਸ਼ੁਦਾ ਨਿੱਜਤਾ-ਬੇਨਤੀ ਮਾਧਿਅਮ ਰਾਹੀਂ ਸਹਿਮਤੀ ਉਨੀ ਹੀ ਆਸਾਨੀ ਨਾਲ ਵਾਪਸ ਲੈ ਸਕੋਗੇ ਜਿੰਨੀ ਆਸਾਨੀ ਨਾਲ ਦਿੱਤੀ ਸੀ। ਭਵਿੱਖ ਦੀ ਕਾਰਵਾਈ ਰੁਕ ਜਾਵੇਗੀ ਅਤੇ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਮਿਟਾਉਣ ਦੀ ਪ੍ਰਕਿਰਿਆ ਸ਼ੁਰੂ ਹੋਵੇਗੀ। ਵਾਪਸੀ ਤੋਂ ਪਹਿਲਾਂ ਕਾਨੂੰਨੀ ਤੌਰ 'ਤੇ ਪੂਰੀ ਹੋਈ ਕਾਰਵਾਈ ਵਾਪਸ ਨਹੀਂ ਮੁੜੇਗੀ।",
    "आप सत्यापित गोपनीयता-अनुरोध माध्यम से सहमति उतनी ही आसानी से वापस ले सकेंगे जितनी आसानी से दी थी। आगे की प्रक्रिया रुक जाएगी और स्वीकृत मिटाने की प्रक्रिया शुरू होगी। वापसी से पहले कानूनी रूप से पूरी हुई प्रक्रिया वापस नहीं होगी।",
  ),
  privacyContact: text(
    "Privacy contact: verified details must be published before launch. No request channel is open in this preview.",
    "ਨਿੱਜਤਾ ਸੰਪਰਕ: ਲਾਂਚ ਤੋਂ ਪਹਿਲਾਂ ਤਸਦੀਕਸ਼ੁਦਾ ਵੇਰਵੇ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਨੇ ਲਾਜ਼ਮੀ ਹਨ। ਇਸ ਝਲਕ ਵਿੱਚ ਕੋਈ ਬੇਨਤੀ ਮਾਧਿਅਮ ਖੁੱਲ੍ਹਾ ਨਹੀਂ ਹੈ।",
    "गोपनीयता संपर्क: लॉन्च से पहले सत्यापित विवरण प्रकाशित करना आवश्यक है। इस पूर्वावलोकन में कोई अनुरोध माध्यम खुला नहीं है।",
  ),
  coreConsentLabel: text(
    "I have read the participant notice and voluntarily agree to preview the civic questionnaire. I understand that nothing is transmitted or saved.",
    "ਮੈਂ ਭਾਗੀਦਾਰ ਜਾਣਕਾਰੀ ਪੜ੍ਹ ਲਈ ਹੈ ਅਤੇ ਨਾਗਰਿਕ ਪ੍ਰਸ਼ਨਾਵਲੀ ਦੀ ਝਲਕ ਵੇਖਣ ਲਈ ਸਵੈਛਿਕ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ। ਮੈਂ ਸਮਝਦਾ/ਸਮਝਦੀ ਹਾਂ ਕਿ ਕੁਝ ਵੀ ਭੇਜਿਆ ਜਾਂ ਸੰਭਾਲਿਆ ਨਹੀਂ ਜਾਂਦਾ।",
    "मैंने प्रतिभागी जानकारी पढ़ ली है और नागरिक प्रश्नावली का पूर्वावलोकन देखने के लिए स्वेच्छा से सहमति देता/देती हूँ। मैं समझता/समझती हूँ कि कुछ भी भेजा या सहेजा नहीं जाता।",
  ),
  politicalTitle: text(
    "Separate optional political-opinion consent",
    "ਵੱਖਰੀ ਵਿਕਲਪਿਕ ਰਾਜਨੀਤਿਕ-ਰਾਏ ਸਹਿਮਤੀ",
    "अलग वैकल्पिक राजनीतिक-राय सहमति",
  ),
  politicalExplanation: text(
    "These questions concern elected representatives and public decision-making. They are optional, more sensitive than the civic questions, and may be skipped without affecting the rest of the survey.",
    "ਇਹ ਸਵਾਲ ਚੁਣੇ ਹੋਏ ਨੁਮਾਇੰਦਿਆਂ ਅਤੇ ਜਨਤਕ ਫ਼ੈਸਲਾ-ਪ੍ਰਕਿਰਿਆ ਨਾਲ ਸੰਬੰਧਿਤ ਹਨ। ਇਹ ਵਿਕਲਪਿਕ ਹਨ, ਨਾਗਰਿਕ ਸਵਾਲਾਂ ਨਾਲੋਂ ਵੱਧ ਸੰਵੇਦਨਸ਼ੀਲ ਹਨ ਅਤੇ ਬਾਕੀ ਸਰਵੇਖਣ 'ਤੇ ਅਸਰ ਪਾਏ ਬਿਨਾਂ ਛੱਡੇ ਜਾ ਸਕਦੇ ਹਨ।",
    "ये प्रश्न निर्वाचित प्रतिनिधियों और सार्वजनिक निर्णय-प्रक्रिया से संबंधित हैं। ये वैकल्पिक हैं, नागरिक प्रश्नों से अधिक संवेदनशील हैं और बाकी सर्वेक्षण को प्रभावित किए बिना छोड़े जा सकते हैं।",
  ),
  politicalConsentLabel: text(
    "I separately agree to preview the optional political-opinion questions.",
    "ਮੈਂ ਵਿਕਲਪਿਕ ਰਾਜਨੀਤਿਕ-ਰਾਏ ਸਵਾਲਾਂ ਦੀ ਝਲਕ ਵੇਖਣ ਲਈ ਵੱਖਰੀ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ।",
    "मैं वैकल्पिक राजनीतिक-राय प्रश्नों का पूर्वावलोकन देखने के लिए अलग सहमति देता/देती हूँ।",
  ),
  politicalDeclineLabel: text(
    "Continue without political-opinion questions",
    "ਰਾਜਨੀਤਿਕ-ਰਾਏ ਸਵਾਲਾਂ ਤੋਂ ਬਿਨਾਂ ਜਾਰੀ ਰੱਖੋ",
    "राजनीतिक-राय प्रश्नों के बिना आगे बढ़ें",
  ),
  nonRepresentativeNotice: text(
    "Any future results would describe voluntary responses only. They must not be presented as representative polling or an election prediction.",
    "ਭਵਿੱਖ ਦੇ ਕੋਈ ਵੀ ਨਤੀਜੇ ਸਿਰਫ਼ ਸਵੈਛਿਕ ਜਵਾਬਾਂ ਦਾ ਵਰਣਨ ਕਰਨਗੇ। ਉਨ੍ਹਾਂ ਨੂੰ ਪ੍ਰਤੀਨਿਧਕ ਰਾਏ-ਸਰਵੇਖਣ ਜਾਂ ਚੋਣੀ ਭਵਿੱਖਬਾਣੀ ਵਜੋਂ ਪੇਸ਼ ਨਹੀਂ ਕੀਤਾ ਜਾਣਾ ਚਾਹੀਦਾ।",
    "भविष्य के कोई भी परिणाम केवल स्वैच्छिक उत्तरों का वर्णन करेंगे। उन्हें प्रतिनिधि जनमत सर्वेक्षण या चुनावी भविष्यवाणी के रूप में प्रस्तुत नहीं किया जाना चाहिए।",
  ),
  reviewRequired: text(
    "Draft translation: human linguistic and legal review is required before publication.",
    "ਮਸੌਦਾ ਅਨੁਵਾਦ: ਪ੍ਰਕਾਸ਼ਨ ਤੋਂ ਪਹਿਲਾਂ ਮਨੁੱਖੀ ਭਾਸ਼ਾਈ ਅਤੇ ਕਾਨੂੰਨੀ ਸਮੀਖਿਆ ਲਾਜ਼ਮੀ ਹੈ।",
    "मसौदा अनुवाद: प्रकाशन से पहले मानवीय भाषाई और कानूनी समीक्षा आवश्यक है।",
  ),
};

export type ConsentRecord = {
  questionnaireVersion: typeof QUESTIONNAIRE_VERSION;
  noticeVersion: typeof CONSENT_NOTICE_VERSION;
  recordedAt: string;
  civicParticipation: true;
  politicalOpinion: boolean;
  locale: Locale;
  status: "synthetic_preview_only";
};

export function createSyntheticConsentRecord(input: {
  locale: Locale;
  politicalOpinion: boolean;
  recordedAt: string;
}): ConsentRecord {
  return {
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    noticeVersion: CONSENT_NOTICE_VERSION,
    recordedAt: input.recordedAt,
    civicParticipation: true,
    politicalOpinion: input.politicalOpinion,
    locale: input.locale,
    status: "synthetic_preview_only",
  };
}

export const withdrawalStates = [
  "received",
  "verification_pending",
  "verified",
  "approved",
  "live_data_deleted",
  "backup_ledger_recorded",
  "completed",
  "unable_to_locate",
  "rejected",
] as const;

export type WithdrawalState = (typeof withdrawalStates)[number];

export type WithdrawalCase = {
  caseId: string;
  mode: "anonymous_withdrawal_code" | "verified_optional_contact";
  locatorDigest: string;
  state: WithdrawalState;
  receivedAt: string;
  history: readonly { state: WithdrawalState; occurredAt: string }[];
  syntheticOnly: true;
};

const allowedTransitions: Readonly<
  Record<WithdrawalState, readonly WithdrawalState[]>
> = {
  received: ["verification_pending"],
  verification_pending: ["verified", "unable_to_locate", "rejected"],
  verified: ["approved", "rejected"],
  approved: ["live_data_deleted"],
  live_data_deleted: ["backup_ledger_recorded"],
  backup_ledger_recorded: ["completed"],
  completed: [],
  unable_to_locate: [],
  rejected: [],
};

export function createSyntheticWithdrawalCase(
  input: {
    caseId: string;
    mode: WithdrawalCase["mode"];
    locator: string;
    receivedAt: string;
  },
  syntheticHmacKey: Buffer,
): WithdrawalCase {
  if (syntheticHmacKey.length < 32) {
    throw new Error("Withdrawal locator HMAC key must be at least 256 bits");
  }

  return {
    caseId: input.caseId,
    mode: input.mode,
    locatorDigest: createHmac("sha256", syntheticHmacKey)
      .update(input.locator, "utf8")
      .digest("base64url"),
    state: "received",
    receivedAt: input.receivedAt,
    history: [{ state: "received", occurredAt: input.receivedAt }],
    syntheticOnly: true,
  };
}

export function transitionWithdrawalCase(
  withdrawalCase: WithdrawalCase,
  nextState: WithdrawalState,
  occurredAt: string,
): WithdrawalCase {
  if (!allowedTransitions[withdrawalCase.state].includes(nextState)) {
    throw new Error(
      `Invalid withdrawal transition: ${withdrawalCase.state} -> ${nextState}`,
    );
  }

  return {
    ...withdrawalCase,
    state: nextState,
    history: [...withdrawalCase.history, { state: nextState, occurredAt }],
  };
}

export function getConsentNotice(locale: Locale) {
  return Object.fromEntries(
    Object.entries(consentNotice).map(([key, value]) => [
      key,
      typeof value === "object" ? value[locale] : value,
    ]),
  ) as Omit<ConsentNotice, keyof ConsentNotice> & {
    [Key in keyof ConsentNotice]: ConsentNotice[Key] extends LocalizedText
      ? string
      : ConsentNotice[Key];
  };
}
