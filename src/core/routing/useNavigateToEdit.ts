import useNavigate from './useNavigate';

export const useNavigateToEdit = () => {
  const navigate = useNavigate();

  return (id: string) => {
    navigate(`../${id}/profile`, { replace: true });
  };
};
