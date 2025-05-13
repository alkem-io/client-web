import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';

// handles SPA navigation to the stand-alone /documentation path which is not part of the SPA
const RedirectDocumentation = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname.startsWith('/documentation')) {
      const newPath = pathname.replace('/documentation', '/docs');
      navigate(`${newPath}${search}`, { replace: true });
    }
  }, [pathname]);

  return null;
};

export default RedirectDocumentation;
