import type { ReactNode } from 'react';
import { Trans, type TransProps, useTranslation } from 'react-i18next';
import { kratosMessageTranslationKeys } from '@/core/auth/authentication/components/Kratos/messages';
import { socialProviderCustomizations } from '@/core/auth/authentication/socialProviderCustomizations';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import type { KratosFlowDescriptor, KratosMessage } from '@/crd/components/auth/flowDescriptor';

/** HTML tags Alkemio's Kratos copy uses; mirrors the MUI `useKratosT` mapping. */
const TRANS_COMPONENTS = { strong: <strong />, li: <li />, br: <br /> };

const MESSAGE_CODE_CLAIM_MISSING = 4000002;

/**
 * Kratos sends id 4000002 ("Property X is missing.") for *two* scenarios:
 * 1. A required form field is empty — `context.property` is the field's leaf
 *    path (e.g. "last", "first", "email"). We rewrite the text to a friendly
 *    "<label> is required" using the field's user-facing label.
 * 2. The Cleverbase claim-missing scenario — `context.property` is not a
 *    form-field name. We fall through to the existing `claim-missing` copy.
 */
const PROPERTY_TO_LABEL_KEY: Record<string, string> = {
  email: 'kratos.fields.E-Mail',
  'traits.email': 'kratos.fields.E-Mail',
  first: 'kratos.fields.First Name',
  'traits.name.first': 'kratos.fields.First Name',
  last: 'kratos.fields.Last Name',
  'traits.name.last': 'kratos.fields.Last Name',
  password: 'kratos.fields.Password',
};

/** Replaces a lower-cased `context.provider` with its brand-cased display name
 *  from `socialProviderCustomizations` (the single source of truth). */
function withProviderDisplayName(context: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (typeof context?.provider !== 'string') {
    return context;
  }
  const displayName = socialProviderCustomizations[context.provider.toLowerCase()]?.displayName;
  return { ...context, provider: displayName ?? context.provider };
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
      // Field-level "Property X is missing." — substitute the field's friendly
      // label so the user sees "Last Name is required." instead of "Property last
      // is missing." Falls through to the existing claim-missing override when
      // the property isn't a known form field (Cleverbase scenario).
      if (message.id === MESSAGE_CODE_CLAIM_MISSING && typeof message.context?.property === 'string') {
        const labelKey = PROPERTY_TO_LABEL_KEY[message.context.property];
        if (labelKey) {
          const label = translate(labelKey);
          const text = translate('kratos.messages.property-missing', {
            field: label,
            defaultValue: message.text,
          });
          return { ...message, text };
        }
      }

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

/**
 * Translates every message exposed by the descriptor — the top-level flow
 * messages, each field-level input's messages, and the accept-terms checkbox's
 * messages — through `useKratosMessageCopy`. Also localises submit-button and
 * anchor labels (e.g. "Sign in with password" → "Iniciar sesión") via the
 * `kratos.fields.<label>` lookup, mirroring the MUI `getNodeTitle` helper —
 * Kratos returns those labels in a fixed locale, so the UI has to translate
 * them client-side.
 */
export function useTranslateDescriptor() {
  const { t } = useTranslation();
  const translateMessages = useKratosMessageCopy();
  const translate = t as unknown as (key: string, options?: Record<string, unknown>) => string;

  const translateButtonLabel = (label: string): string =>
    label ? translate(`kratos.fields.${label}`, { defaultValue: label }) : label;

  return (descriptor: KratosFlowDescriptor): KratosFlowDescriptor => {
    const translateInputMessages = <T extends { messages: KratosMessage[] }>(node: T): T => ({
      ...node,
      messages: translateMessages(node.messages),
    });

    return {
      ...descriptor,
      messages: translateMessages(descriptor.messages),
      acceptTerms: descriptor.acceptTerms
        ? { ...descriptor.acceptTerms, messages: translateMessages(descriptor.acceptTerms.messages) }
        : undefined,
      groups: {
        ...descriptor.groups,
        default: descriptor.groups.default.map(translateInputMessages),
        password: descriptor.groups.password.map(translateInputMessages),
        rest: descriptor.groups.rest.map(translateInputMessages),
        submit: descriptor.groups.submit.map(node => ({ ...node, label: translateButtonLabel(node.label) })),
        anchors: descriptor.groups.anchors.map(node => ({ ...node, label: translateButtonLabel(node.label) })),
      },
    };
  };
}
