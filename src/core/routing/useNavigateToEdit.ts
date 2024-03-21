import { useNavigate } from 'react-router-dom';

export const useNavigateToEdit = () => {
  const navigate = useNavigate();

  return (id: string) => {
    navigate(`../${id}/profile`, { replace: true });
  };
};
