import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';

const RedirectDocumentation = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname.startsWith('/documentation')) {
      const newPath = pathname.replace('/documentation', '/docs');
      navigate(`${newPath}${search}`, { replace: true }); // Perform a full-page reload
    }
  }, [pathname]);

  return null; // Render nothing
};

export default RedirectDocumentation;
