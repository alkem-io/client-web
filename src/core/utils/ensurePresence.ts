import { useNotification } from '../ui/notifications/useNotification';

const useEnsurePresence = () => {
  const notify = useNotification();
  const ensurePresence = <Value>(value: Value | undefined | null, label: string = 'Value'): Value => {
    if (!value) {
      notify(`${label} is not present.`, 'error');
      // TODO: Maybe notify Sentry?
      throw new Error(`${label} is not present.`);
    }
    return value;
  };
  return ensurePresence;
}

export default useEnsurePresence;