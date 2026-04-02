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

  const handleBackToWhiteboard = () => {
    if (whiteboardUrl) {
      navigate(whiteboardUrl);
    }
  };

  const handleGoToWebsite = () => {
    window.location.assign('https://alkem.io');
  };

  const clearSession = () => {
    clearGuestWhiteboardUrl();
  };

  return {
    shouldShowNotification,
    whiteboardUrl,
    handleBackToWhiteboard,
    handleGoToWebsite,
    clearSession,
  };
};
