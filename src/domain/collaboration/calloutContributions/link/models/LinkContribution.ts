import type { Authorizable } from '@/core/utils/Authorizable';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { LinkDetails } from './LinkDetails';

export interface LinkContribution extends Identifiable {
  link?: Identifiable & // Makes id mandatory, in LinkDetails is optional
    Authorizable & // Adds { authorization }
    LinkDetails;

  sortOrder: number;
}
