import { useEffect } from 'react';
import { UserMetadata } from '../context/UserProvider';
import { setUserScope } from '../sentry/scope';

export const useUserScope = (metadata: UserMetadata | undefined) => {
  useEffect(() => {
    setUserScope((metadata || {}).user);
  }, [metadata]);
};
