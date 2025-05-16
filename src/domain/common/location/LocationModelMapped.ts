import { CountryType } from './countries.constants';

export interface LocationModelMapped {
  id: string;
  city?: string;
  country?: CountryType;
}

export const EmptyLocationMapped: LocationModelMapped = {
  id: '',
  city: '',
  country: {
    code: '',
    name: '',
  },
};
