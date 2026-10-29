import { env } from '@/main/env';
import { orLocalDevDefault } from '@/main/localDevServer';

/** The call-token service of the server repo's local stack. */
const LOCAL_LIVEKIT_SERVICE_URL = 'http://localhost:8880';

type CallConfig = {
  /** Base URL of the call-token service the call UI asks for media credentials. Empty when calls are off. */
  livekitServiceUrl: string;
};

const getCallConfig = (): CallConfig => ({
  livekitServiceUrl: orLocalDevDefault(env?.VITE_APP_LIVEKIT_SERVICE_URL?.trim() ?? '', LOCAL_LIVEKIT_SERVICE_URL),
});

/** Calls exist only where the environment names a call-token service; an empty value switches every call surface off. */
const isCallsConfigured = (): boolean => getCallConfig().livekitServiceUrl !== '';

export { getCallConfig, isCallsConfigured };
export type { CallConfig };
