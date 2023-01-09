import { useMemo } from 'react';
import { useResolvedPath } from 'react-router-dom';

const useRelativeUrls = <Item extends { url: string }>(items: Item[]) => {
  const { pathname: url } = useResolvedPath('.');

  console.log(url);

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
