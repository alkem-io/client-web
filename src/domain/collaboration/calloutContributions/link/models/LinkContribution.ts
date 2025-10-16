import { Identifiable } from '@/core/utils/Identifiable';
import { LinkDetails } from './LinkDetails';

export interface LinkContribution extends Identifiable {
  link?: LinkDetails & Identifiable & { authorization?: { myPrivileges?: string[] } };
  sortOrder: number;
}
