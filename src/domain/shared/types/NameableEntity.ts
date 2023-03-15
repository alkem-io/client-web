import { Identifiable } from './Identifiable';

export interface NameableEntity extends Identifiable {
  nameID: string;
  displayName: string;
}
