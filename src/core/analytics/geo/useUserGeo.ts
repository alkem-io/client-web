import { useContext, useMemo } from 'react';
import { UserGeoContext, UserGeoContextProps } from './UserGeoProvider';

export const useUserGeo = () => {
  const { data, error, loading } = useContext(UserGeoContext);
  return useMemo<UserGeoContextProps>(() => ({ data, loading, error }), [data, error, loading]);
};
