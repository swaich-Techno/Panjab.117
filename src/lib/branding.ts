export const BRAND_WORD = "PANJAB" as const;
export const BRAND_NUMBER = "117" as const;
export const BRAND_NAME = `${BRAND_WORD} ${BRAND_NUMBER}` as const;
export const STATE_NAME = "PUNJAB" as const;

export const BRAND_HEADLINE =
  `${BRAND_NAME} — Understanding ${STATE_NAME}, Constituency by Constituency` as const;

export const BRAND_DESCRIPTION =
  `Independent civic research covering all 117 Assembly constituencies of ${STATE_NAME}.` as const;
