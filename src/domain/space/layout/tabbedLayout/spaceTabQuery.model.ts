import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

export type SpaceTabQueryModel = {
  lookup: {
    space?: {
      id: string;
      authorization?: {
        id: string;
        myPrivileges?: AuthorizationPrivilege[];
      };
      about: SpaceAboutLightModel;
      collaboration: {
        id: string;
        innovationFlow: {
          id: string;
          states: InnovationFlowStateModel[];
        };
        calloutsSet: {
          id: string;
        };
      };
    };
  };
};
