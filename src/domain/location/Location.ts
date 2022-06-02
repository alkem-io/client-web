import { CountryType } from '../../models/constants';

export interface Location {
  id: string;
  city: string;
  country: CountryType;
}

export const EmptyLocation: Location = { id: '', city: '', country: { name: '', code: '' } };
