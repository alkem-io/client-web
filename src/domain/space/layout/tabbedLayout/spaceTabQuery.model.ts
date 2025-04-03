import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

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
          states: Array<{
            displayName: string;
            description: string;
          }>;
          currentState: {
            displayName: string;
            description: string;
          };
        };
        calloutsSet: {
          id: string;
        };
      };
    };
  };
};
