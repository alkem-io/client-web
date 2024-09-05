import { compact } from 'lodash';

export interface Location {
  city?: string | undefined;
  country?: string | undefined;
}

const getLocationString = ({ city, country }: Location) => compact([city, country]).join(', ');

export default getLocationString;
