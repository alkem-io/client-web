import { useCallback } from 'react';
import { useNavigate, useResolvedPath } from 'react-router-dom';

export const useNavigateToEdit = () => {
  const { pathname: url } = useResolvedPath('./');
  const navigate = useNavigate();

  return useCallback(
    (id: string) => {
      navigate(`../${id}/edit`, { replace: true });
    },
    [url, navigate]
  );
};
