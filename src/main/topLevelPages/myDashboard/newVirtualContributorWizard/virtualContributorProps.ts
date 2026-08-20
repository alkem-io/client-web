import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

export interface UserAccountProps {
  id: string;
  host?: {
    id: string;
  };
  spaces: Array<{
    id: string;
    about: SpaceAboutLightModel;
    authorization?: {
      id: string;
      myPrivileges?: AuthorizationPrivilege[] | undefined;
    };
  }>;
}
