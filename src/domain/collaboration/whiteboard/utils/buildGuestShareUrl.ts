const GUEST_SHARE_LINK_PLACEHOLDER = 'https://guest-link-placeholder.invalid';
const GUEST_SHARE_PATH = '/guest/whiteboard';

export const buildGuestShareUrl = (whiteboardId?: string) => {
  if (!whiteboardId) {
    return undefined;
  }

  if (typeof window === 'undefined') {
    return `${GUEST_SHARE_LINK_PLACEHOLDER}/${whiteboardId}`;
  }

  return `${window.location.origin}${GUEST_SHARE_PATH}/${whiteboardId}`;
};

export default buildGuestShareUrl;
