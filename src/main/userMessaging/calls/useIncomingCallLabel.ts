import { useTranslation } from 'react-i18next';
import { useIncomingCallRooms } from './incomingCallStore';

/** Names the call the user has not dealt with yet ("Maria is calling you", "Call in Design team"), if there is one. */
export const useIncomingCallLabel = (): string | undefined => {
  const { t } = useTranslation('crd-chat');
  const call = [...useIncomingCallRooms().values()].find(incoming => incoming !== null);
  return call ? t(call.isGroup ? 'call.groupCall' : 'call.callingYou', { name: call.name }) : undefined;
};
