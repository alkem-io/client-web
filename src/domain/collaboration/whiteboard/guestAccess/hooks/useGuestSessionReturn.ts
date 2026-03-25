import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearGuestWhiteboardUrl, getGuestName, getGuestWhiteboardUrl } from '../utils/sessionStorage';

interface UseGuestSessionReturnResult {
  shouldShowNotification: boolean;
  whiteboardUrl: string | null;
  handleBackToWhiteboard: () => void;
  handleGoToWebsite: () => void;
  clearSession: () => void;
}

export const useGuestSessionReturn = (): UseGuestSessionReturnResult => {
  const navigate = useNavigate();

  const guestName = getGuestName();
  const whiteboardUrl = getGuestWhiteboardUrl();
  const shouldShowNotification = Boolean(guestName && whiteboardUrl);

  const handleBackToWhiteboard = useCallback(() => {
    if (whiteboardUrl) {
      navigate(whiteboardUrl);
    }
  }, [whiteboardUrl, navigate]);

  const handleGoToWebsite = useCallback(() => {
    window.location.assign('https://alkem.io');
  }, []);

  const clearSession = useCallback(() => {
    clearGuestWhiteboardUrl();
  }, []);

  return {
    shouldShowNotification,
    whiteboardUrl,
    handleBackToWhiteboard,
    handleGoToWebsite,
    clearSession,
  };
};
