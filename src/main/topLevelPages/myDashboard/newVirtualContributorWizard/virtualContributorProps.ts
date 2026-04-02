import type { ReactNode } from 'react';
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

export interface useVirtualContributorWizardProvided {
  startWizard: (initAccount?: UserAccountProps | undefined, accountName?: string) => void;
  virtualContributorWizard: ReactNode;
}
