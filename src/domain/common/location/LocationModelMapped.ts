import type { CountryType } from './countries.constants';

export interface LocationModelMapped {
  id: string;
  city?: string;
  country?: CountryType;
}
