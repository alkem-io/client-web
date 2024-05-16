import { useEffect, useState } from 'react';
import { Plan } from './Plan';

interface Provided {
  loading: boolean;
  isPlanAvailable: (plan: Plan) => boolean;
}

export const usePlanAvailability = (): Provided => {
  // TODO: Mocked available plans
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  useEffect(() => {
    setAvailablePlans([Plan.FREE, Plan.PLUS, Plan.PREMIUM, Plan.ENTERPRISE]);
  }, []);

  const loading = false;

  const isPlanAvailable = (plan: Plan): boolean => {
    return availablePlans.includes(plan);
  };

  return {
    loading,
    isPlanAvailable,
  };
};
