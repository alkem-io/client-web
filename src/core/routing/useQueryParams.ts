import { useLocation } from 'react-router-dom';

export const useQueryParams = () => {
  const { search } = useLocation();
  return new URLSearchParams(search);
};

export const useMemoizedQueryParams = () => {
  const { search } = useLocation();

  const params = new URLSearchParams(search);

  const entries = Array.from(params.entries()).reduce<Record<string, string[]>>((acc, [key, value]) => {
    if (!acc[key]) acc[key] = [];
    acc[key].push(value);

    return acc;
  }, {});

  return entries;
};
