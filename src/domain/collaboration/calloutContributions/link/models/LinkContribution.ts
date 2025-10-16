import { Identifiable } from '@/core/utils/Identifiable';
import { LinkDetails } from './LinkDetails';
import type { Authorizable } from '@/core/utils/Authorizable';

export interface LinkContribution extends Identifiable {
  link?: LinkDetails & Identifiable & Authorizable;
  sortOrder: number;
}
