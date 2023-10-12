import { useContext } from 'react';
import { UserGeoContext } from './UserGeoProvider';

export const useUserGeo = () => {
  const { data, error, loading } = useContext(UserGeoContext);
  return { data, loading, error };
};
