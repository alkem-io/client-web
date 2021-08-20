import { useCallback } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

export const useNavigateToEdit = () => {
  const { url } = useRouteMatch();
  const history = useHistory();

  return useCallback(
    (id: string) => {
      const newUrl = url.replace('/new', `/${id}/edit`);
      history.replace(newUrl);
    },
    [url, history]
  );
};
