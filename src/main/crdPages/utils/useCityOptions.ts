import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CityOption } from '@/crd/components/common/CityAutocompleteInput';
import { COUNTRIES_BY_CODE } from '@/domain/common/location/countries.constants';

const CITIES_NS = 'crd-cities';

/** `{ [countryCode]: { [cityId]: localizedName } }` — see `src/crd/i18n/cities/`. */
type CitiesBundle = Record<string, Record<string, string>>;

/**
 * City suggestions for every profile Location field (spec 097 city-autocomplete).
 * Nothing is fetched until `onRequest` is first called (the City input's focus);
 * after that the options follow the UI language, falling back to English for
 * any missing name. A failed load leaves `options` undefined — the input then
 * works as plain text.
 */
export const useCityOptions = () => {
  const { i18n } = useTranslation();
  const [requested, setRequested] = useState(false);
  const [options, setOptions] = useState<CityOption[]>();
  const language = i18n.language;

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;
    i18n.loadNamespaces(CITIES_NS).then(() => {
      // English is the canonical key set; names come from the active language when present.
      const en = i18n.getResourceBundle('en', CITIES_NS) as CitiesBundle | undefined;
      if (cancelled || !en) return;
      const localized = (i18n.getResourceBundle(language, CITIES_NS) ?? {}) as Partial<CitiesBundle>;
      setOptions(
        Object.entries(en).flatMap(([countryCode, cities]) =>
          Object.entries(cities).map(([cityId, enName]) => ({
            id: `${countryCode}.${cityId}`,
            name: localized[countryCode]?.[cityId] ?? enName,
            countryCode,
            countryName: COUNTRIES_BY_CODE[countryCode] ?? countryCode,
          }))
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [requested, language, i18n]);

  return { options, onRequest: () => setRequested(true) };
};
