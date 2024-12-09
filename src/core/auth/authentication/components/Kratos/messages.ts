import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UiText } from '@ory/kratos-client/api';
import { has } from 'lodash';

/**
 * A message from Kratos is received in the form of an object with an id property. Kratos docs say:
 * This ID will not change and can be used to translate the message or use your own message content.
 * See https://www.ory.sh/docs/kratos/concepts/ui-user-interface
 */

const messages: Record<string, string> = {
  '1060001': 'successfully-recovered-password',
  '4070005': 'verification-flow-expired',
  '4060005': 'recovery-flow-expired',
  '1070009': 'verification-flow-continue',
  '4000007': 'login-flow-account-exists',
  '4000006': 'invalid-credentials',
};

export const useKratosT = () => {
  const { t, i18n } = useTranslation();

  const kratosT = useCallback(
    (kratosMessage: UiText): string => {
      if (has(messages, kratosMessage.id)) {
        const label = messages[kratosMessage.id];
        const replacement = kratosMessage.context as Record<string, string | number>;
        // It's hard to convince t() that the constructed label is a valid translation key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return t(`kratos.messages.${label}` as any, replacement);
      }
      return kratosMessage.text;
    },
    [t]
  );

  return {
    t: kratosT,
    i18n,
  };
};
