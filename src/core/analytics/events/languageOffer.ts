/**
 * T009 — Language offer analytics events (DL-9 / SC-006a).
 *
 * Inherits the existing analysis-consent gating through the same Sentry `info`
 * pipeline that `trackChatOpen` uses — no new analytics surface.
 */
import { info, TagCategoryValues } from '@/core/logging/sentry/log';

const EVENT_NAMESPACE = 'languageOffer';

export const trackLanguageOfferShown = (offeredLanguage: string) => {
  info(`${EVENT_NAMESPACE}.shown`, {
    category: TagCategoryValues.LANGUAGE,
    label: offeredLanguage,
  });
};

export const trackLanguageOfferAccepted = (offeredLanguage: string) => {
  info(`${EVENT_NAMESPACE}.accepted`, {
    category: TagCategoryValues.LANGUAGE,
    label: offeredLanguage,
  });
};

export const trackLanguageOfferDeclined = (offeredLanguage: string) => {
  info(`${EVENT_NAMESPACE}.declined`, {
    category: TagCategoryValues.LANGUAGE,
    label: offeredLanguage,
  });
};
