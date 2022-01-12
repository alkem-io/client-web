import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigateToEdit = () => {
  const url = '';
  const navigate = useNavigate();

  return useCallback(
    (id: string) => {
      navigate(`../${id}/edit`, { replace: true });
    },
    [url, navigate]
  );
};
