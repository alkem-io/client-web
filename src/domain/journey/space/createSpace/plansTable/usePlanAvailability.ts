import { useEffect, useState } from 'react';

interface Provided {
  loading: boolean;
  isPlanAvailable: (planName: string) => boolean;
}

export const usePlanAvailability = (): Provided => {
  // TODO: Mocked available plans
  const [availablePlans, setAvailablePlans] = useState<string[]>([]);
  useEffect(() => {
    setAvailablePlans(['FREE', 'PLUS', 'PREMIUM', 'ENTERPRISE']);
  }, []);

  const loading = false;

  const isPlanAvailable = (planName: string): boolean => {
    return availablePlans.includes(planName);
  };

  return {
    loading,
    isPlanAvailable,
  };
};
