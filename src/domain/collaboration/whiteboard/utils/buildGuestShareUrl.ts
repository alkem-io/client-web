const GUEST_SHARE_PATH = '/public/whiteboard';

export const buildGuestShareUrl = (whiteboardId?: string) => {
  if (!whiteboardId) {
    return undefined;
  }

  if (typeof window === 'undefined') {
    return '/';
  }

  return `${window.location.origin}${GUEST_SHARE_PATH}/${whiteboardId}`;
};

export default buildGuestShareUrl;
