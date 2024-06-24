import { Identifiable } from '../../../../../core/utils/Identifiable';
import { JourneyLevel } from '../../../../../main/routing/resolvers/RouteResolver';

export interface InvitationItem extends Identifiable {
  space: Identifiable & {
    level: JourneyLevel;
    profile: {
      url: string;
      displayName: string;
      tagline: string;
    };
  };
  invitation: {
    createdBy: Identifiable;
    welcomeMessage?: string;
    createdDate: Date | string;
    lifecycle: { state?: string };
  };
}
