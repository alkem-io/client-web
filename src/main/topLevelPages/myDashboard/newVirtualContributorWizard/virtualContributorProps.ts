import { ComponentType } from 'react';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutMinimalModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface UserAccountProps {
  id: string;
  host?: {
    id: string;
  };
  spaces: Array<{
    id: string;
    community: {
      id: string;
      roleSet: {
        id: string;
      };
    };
    about: SpaceAboutMinimalModel;
    license: {
      id: string;
      myEntitlements?: LicenseEntitlementType[] | undefined;
    };
    authorization?: {
      id: string;
      myPrivileges?: AuthorizationPrivilege[] | undefined;
    };
  }>;
}

interface VirtualContributorWizardProps {}

export interface useVirtualContributorWizardProvided {
  startWizard: (initAccount?: UserAccountProps | undefined, accountName?: string) => void;
  VirtualContributorWizard: ComponentType<VirtualContributorWizardProps>;
}
