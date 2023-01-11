import { useMemo } from 'react';
import { useResolvedPath } from 'react-router-dom';

const useRelativeUrls = <Item extends { url: string }>(items: Item[]) => {
  const { pathname: url } = useResolvedPath('.');

  return useMemo(
    () =>
      items.map(item => ({
        ...item,
        url: `${url}/${item.url}`,
      })),
    [items, url]
  );
};

export default useRelativeUrls;
