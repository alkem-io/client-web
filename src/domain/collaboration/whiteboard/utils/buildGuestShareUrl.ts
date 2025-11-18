import { env } from '@/main/env';

export interface BuildGuestShareUrlOptions {
  spaceSlug: string;
  whiteboardNameID: string;
  originOverride?: string;
}

const stripSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

const resolveOrigin = (override?: string) => {
  if (override && override.length > 0) {
    return override.replace(/\/$/, '');
  }
  const configured = env?.VITE_APP_ALKEMIO_DOMAIN;
  if (configured && configured.length > 0) {
    return configured.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  throw new Error('Unable to resolve platform origin for guest share URL');
};

export const buildGuestShareUrl = ({ spaceSlug, whiteboardNameID, originOverride }: BuildGuestShareUrlOptions) => {
  if (!spaceSlug || !spaceSlug.trim()) {
    throw new Error('Space slug is required to build the guest share URL');
  }
  if (!whiteboardNameID || !whiteboardNameID.trim()) {
    throw new Error('Whiteboard nameID is required to build the guest share URL');
  }

  const origin = resolveOrigin(originOverride);
  const normalizedSpaceSlug = stripSlashes(spaceSlug.trim());
  const normalizedNameID = stripSlashes(whiteboardNameID.trim());

  return `${origin}/guest/whiteboard/${normalizedSpaceSlug}/${normalizedNameID}`;
};

export default buildGuestShareUrl;
