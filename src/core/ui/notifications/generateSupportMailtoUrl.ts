import type { TFunction } from 'i18next';

type SupportMailtoOptions = {
  numericCode?: number;
  t: TFunction;
};

/**
 * Generates a mailto URL for contacting support with pre-filled subject and body.
 * When numericCode is provided, includes it in the subject and body for reference.
 */
export const generateSupportMailtoUrl = ({ numericCode, t }: SupportMailtoOptions): string => {
  const email = t('common.supportEmail');

  const subject =
    numericCode !== undefined
      ? t('apollo.errors.support.emailSubject', { code: numericCode })
      : t('apollo.errors.support.emailSubjectGeneric');

  const body =
    numericCode !== undefined
      ? t('apollo.errors.support.emailBody', { code: numericCode })
      : t('apollo.errors.support.emailBodyGeneric');

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
