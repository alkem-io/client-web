import { Tagset } from '../profile/Profile';

export const toTagsetTitle = (tagset: Tagset, title?: string): string =>
  title ?? `${tagset.name.slice(0, 1).toUpperCase()}${tagset.name.slice(1)}`;
