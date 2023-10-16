import { Identifiable } from '../../../core/utils/Identifiable';

export interface ActivityCalloutValues extends Identifiable {
  nameID: string;
  framing: {
    profile: {
      displayName: string;
    };
  };
}
