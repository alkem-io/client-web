import { ReactNode } from 'react';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useTranslation, Trans, TransProps } from 'react-i18next';
import { UiText } from '@ory/kratos-client/api';
import { has } from 'lodash';

/**
 * A message from Kratos is received in the form of an object with an id property. Kratos docs say:
 * This ID will not change and can be used to translate the message or use your own message content.
 * See https://www.ory.sh/docs/kratos/concepts/ui-user-interface
 */

const messages: Record<string, string> = {
  '1060001': 'successfully-recovered-password',
  '1060002': 'request-recover-password',
  '1060003': 'request-recover-password',
  '4070005': 'verification-flow-expired',
  '4060005': 'recovery-flow-expired',
  '1070009': 'verification-flow-continue',
  '4000007': 'login-flow-account-exists',
  '4000006': 'invalid-credentials',
  '4000002': 'claim-missing',
  '1040009': 'pick-password',
};

export const useKratosT = () => {
  const { i18n } = useTranslation();

  const kratosT = (kratosMessage: UiText): ReactNode | string => {
    if (has(messages, kratosMessage.id)) {
      const label = messages[kratosMessage.id];
      const replacement = kratosMessage.context as Record<string, string | number>;

      // It's hard to convince t() that the constructed label is a valid translation key
      return (
        <Trans
          i18nKey={`kratos.messages.${label}` as unknown as TransProps<TranslationKey>['i18nKey']}
          components={{ strong: <strong />, li: <li />, br: <br /> }}
          default={replacement}
        />
      );
    }
    return kratosMessage.text;
  };

  return {
    t: kratosT,
    i18n,
  };
};
