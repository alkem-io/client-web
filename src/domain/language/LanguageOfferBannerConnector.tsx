/**
 * T007 — Connects the LanguageOfferBanner presentational component to the domain
 * language orchestration (useCrdLanguage). Handles FR-007: banner copy is rendered
 * in the OFFERED language (i18next namespace loaded for that language).
 *
 * Placed in src/domain/language/ because it holds Apollo/i18n business logic;
 * LanguageOfferBanner stays in src/crd/ as a pure presentational primitive.
 */
import { useTranslation } from 'react-i18next';
import { LanguageOfferBanner } from '@/crd/components/language/LanguageOfferBanner';
import { useCrdLanguage } from './useCrdLanguage';

/**
 * Renders the language offer banner when the gate is open. If the gate is closed,
 * renders nothing (null). This component must be mounted inside CurrentUserProvider
 * and ConfigProvider.
 *
 * The banner copy is fetched from the `crd-language` namespace in the OFFERED
 * language (FR-007). The `lng` option on useTranslation forces the offered language
 * even if the UI is still loading the switch.
 */
export function LanguageOfferBannerConnector() {
  const { offeredLanguage, onAcceptLanguageOffer, onDeclineLanguageOffer } = useCrdLanguage();

  // Load banner strings in the offered language (FR-007).
  // `lng` overrides the current i18n language for this translation call.
  const { t } = useTranslation('crd-language', { lng: offeredLanguage ?? undefined });

  if (!offeredLanguage) return null;

  // The keys live under offer.<lang>.*; the offered language is the sub-key.
  // This is the offered-language namespace, so `offer.nl.*` for Dutch.
  // For robustness, fall back gracefully when keys are missing.
  const title = t(`offer.${offeredLanguage}.title`, { defaultValue: offeredLanguage });
  const acceptLabel = t(`offer.${offeredLanguage}.accept`, { defaultValue: 'Yes' });
  const declineLabel = t(`offer.${offeredLanguage}.decline`, { defaultValue: 'No thanks' });
  const dismissLabel = t(`offer.${offeredLanguage}.dismiss`, { defaultValue: 'Dismiss language offer' });

  return (
    <LanguageOfferBanner
      offeredLanguage={offeredLanguage}
      title={title}
      acceptLabel={acceptLabel}
      declineLabel={declineLabel}
      dismissLabel={dismissLabel}
      onAccept={onAcceptLanguageOffer}
      onDecline={onDeclineLanguageOffer}
    />
  );
}
