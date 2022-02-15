import { Tagset } from '../models/Profile';

export const toTagsetTitle = (tagset: Tagset, title?: string): string => {
  return title ?? `${tagset.name.slice(0, 1).toUpperCase()}${tagset.name.slice(1)}`;
};
