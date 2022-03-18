import { UiText } from '@ory/kratos-client/api';
import { has } from 'lodash';

/**
 * A message from Kratos is received in the form of an object with an id property. Kratos docs say:
 * This ID will not change and can be used to translate the message or use your own message content.
 * See https://www.ory.sh/docs/kratos/concepts/ui-user-interface
 */

const messages = {
  '4070005': 'verification-flow-expired',
  '4060005': 'recovery-flow-expired',
};

export default messages;

interface T {
  (
    path: string,
    replacement?:
      | {
          [key: string]: string | number;
        }
      | undefined
  ): string;
}

export const KratosFriendlierMessageMapper =
  (t: T) =>
  (kratosMessage: UiText): string => {
    if (has(messages, kratosMessage.id)) {
      const label = messages[kratosMessage.id];
      const replacement = kratosMessage.context as Record<string, string | number>;
      return t(`kratos.messages.${label}`, replacement);
    }
    return kratosMessage.text;
  };
