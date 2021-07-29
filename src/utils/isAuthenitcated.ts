import { AuthStatus } from '../store/auth/types';

export const isAuthenticated = (status: AuthStatus) =>
  status === 'done' || status === 'refreshing' || status === 'userRegistration';
