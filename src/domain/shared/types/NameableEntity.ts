import { Identifiable } from './Identifiable';

export interface NameableEntityOld extends Identifiable {
  nameID: string;
  displayName: string;
}

export interface NameableEntity extends Identifiable {
  nameID: string;
  profile: {
    displayName: string;
  };
}
