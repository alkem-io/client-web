import { ComponentType } from 'react';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

export interface UserAccountProps {
  id: string;
  host?: {
    id: string;
  };
  spaces: Array<{
    id: string;
    about: SpaceAboutLightModel;
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
