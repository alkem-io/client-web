
export interface LocationModel {
  id?: string;
  city?: string;
  country?: string;
}

export const EmptyLocation: LocationModel = { id: '', city: '', country: '' };
