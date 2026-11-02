import { env } from '@/main/env';

type CallConfig = {
  /** Base URL of the call-token service the call UI asks for media credentials. Empty when calls are off. */
  livekitServiceUrl: string;
};

const getCallConfig = (): CallConfig => ({
  livekitServiceUrl: env?.VITE_APP_LIVEKIT_SERVICE_URL?.trim() ?? '',
});

/** Calls exist only where the environment names a call-token service; an empty value switches every call surface off. */
const isCallsConfigured = (): boolean => getCallConfig().livekitServiceUrl !== '';

export { getCallConfig, isCallsConfigured };
export type { CallConfig };
