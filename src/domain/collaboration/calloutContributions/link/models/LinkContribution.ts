import { Identifiable } from '@/core/utils/Identifiable';
import { LinkDetails } from './LinkDetails';
import type { Authorizable } from '@/core/utils/Authorizable';

export interface LinkContribution extends Identifiable {
  link?: Identifiable & // Makes id mandatory, in LinkDetails is optional
    Authorizable & // Adds { authorization }
    LinkDetails;

  sortOrder: number;
}
