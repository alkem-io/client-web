import { useNavigate } from 'react-router-dom';

interface Options {
  editRoute?: string;
}

const defaultOptions: Options = {
  editRoute: 'profile',
};

export const useNavigateToEdit = (options: Options = defaultOptions) => {
  const navigate = useNavigate();

  return (id: string) => {
    navigate(`../${id}/${options.editRoute}`, { replace: true });
  };
};
