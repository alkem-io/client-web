import { CountryType } from '../../models/constants';

export interface Location {
  city: string;
  country: CountryType;
}

export const EmptyLocation: Location = { city: '', country: { name: '', code: '' } };
