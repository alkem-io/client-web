import { createContext } from 'react';

// The Kratos public API base URL, when the app supplies it directly rather than through the legacy
// platform configuration (useKratosClient falls back to that when no provider is mounted).
export const KratosPublicUrlContext = createContext<string | undefined>(undefined);
