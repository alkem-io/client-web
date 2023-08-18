import { Identifiable } from '../../../core/utils/Identifiable';

export interface NameableEntity extends Identifiable {
  nameID: string;
  profile: {
    displayName: string;
  };
}
