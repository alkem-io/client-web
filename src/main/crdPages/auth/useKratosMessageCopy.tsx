import type { ReactNode } from 'react';
import { Trans, type TransProps, useTranslation } from 'react-i18next';
import { kratosMessageTranslationKeys } from '@/core/auth/authentication/components/Kratos/messages';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import type { KratosMessage } from '@/crd/components/auth/flowDescriptor';

/** HTML tags Alkemio's Kratos copy uses; mirrors the MUI `useKratosT` mapping. */
const TRANS_COMPONENTS = { strong: <strong />, li: <li />, br: <br /> };

/** Kratos sends OIDC provider keys lower-cased; show them with their brand casing. */
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  microsoft: 'Microsoft',
  apple: 'Apple',
  cleverbase: 'Cleverbase',
};

/** Replaces a lower-cased `context.provider` with its brand-cased display name. */
function withProviderDisplayName(context: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (typeof context?.provider !== 'string') {
    return context;
  }
  return { ...context, provider: PROVIDER_DISPLAY_NAMES[context.provider.toLowerCase()] ?? context.provider };
}

/**
 * Re-localises Kratos flow messages with Alkemio's own copy, mirroring the MUI
 * `useKratosT` overrides (`src/core/auth/authentication/components/Kratos/messages.tsx`).
 *
 * Kratos already returns translated text, but for a known set of message ids
 * Alkemio prefers its own wording — e.g. the OIDC account-linking conflict
 * (id 1010016) or the recovery "email sent" block. The message's `context`
 * (e.g. `{ provider: 'GitHub' }`) supplies interpolation values.
 *
 * Plain copy is returned as `text`. Copy that carries HTML markup is rendered
 * via `<Trans>` into the `content` field, so the CRD banner never displays
 * literal `<strong>`/`<li>` tags.
 */
export function useKratosMessageCopy() {
  const { t } = useTranslation();
  // The translation key is built at runtime from a Kratos message id, so it
  // cannot satisfy the typed-resource key union — translate via a plain signature.
  const translate = t as unknown as (key: string, options?: Record<string, unknown>) => string;

  return (messages: KratosMessage[]): KratosMessage[] =>
    messages.map(message => {
      const key = kratosMessageTranslationKeys[String(message.id)];
      if (!key) {
        return message;
      }
      const i18nKey = `kratos.messages.${key}`;
      const values = withProviderDisplayName(message.context);
      const text = translate(i18nKey, { ...values, defaultValue: message.text });
      if (!text.includes('<')) {
        return { ...message, text };
      }
      // Markup copy — render the tags as real elements via `<Trans>`.
      const content: ReactNode = (
        <Trans
          key={i18nKey}
          i18nKey={i18nKey as unknown as TransProps<TranslationKey>['i18nKey']}
          components={TRANS_COMPONENTS}
          values={values}
        />
      );
      return { ...message, content };
    });
}
