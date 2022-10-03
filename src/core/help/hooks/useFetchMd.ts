import { useEffect, useState } from 'react';

export const useFetchMd = (path: string) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    fetch(path)
      .then(
        x => x.text(),
        reason => {
          throw new Error(reason);
        }
      )
      .then(x => setData(x))
      .catch((x: Error) => setError(x))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
