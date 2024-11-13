import { Identifiable } from '@core/utils/Identifiable';

export interface ActivityCalloutValues extends Identifiable {
  framing: {
    profile: {
      displayName: string;
      url: string;
    };
  };
}
