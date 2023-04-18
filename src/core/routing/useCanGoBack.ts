import { useLocation } from 'react-router-dom';

const useCanGoBack = () => {
  const location = useLocation();
  const canGoBack = location.key !== 'default';
  return canGoBack;
};

export default useCanGoBack;
