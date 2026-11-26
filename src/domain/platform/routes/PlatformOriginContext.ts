import { createContext } from 'react';

// The platform's apex origin with scheme (e.g. https://alkem.io), when the app supplies it directly rather than through
// the legacy platform configuration (usePlatformOrigin falls back to that when no provider is mounted).
export const PlatformOriginContext = createContext<string | undefined>(undefined);
