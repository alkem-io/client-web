import { AuthStatus } from '../reducers/auth/types';

export const isAuthenticated = (status: AuthStatus) =>
  status === 'done' || status === 'refreshing' || status === 'userRegistration';
