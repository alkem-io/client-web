import { ComponentType } from 'react';
import {
  AuthorizationPrivilege,
  LicenseEntitlementDataType,
  LicenseEntitlementType,
  SpaceType,
} from '@/core/apollo/generated/graphql-schema';

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
        authorization?: {
          id: string;
          myPrivileges?: AuthorizationPrivilege[] | undefined;
        };
      };
    };
    profile: {
      id: string;
      displayName: string;
      url: string;
    };
    license: {
      id: string;
      entitlements: Array<{
        id: string;
        type: LicenseEntitlementType;
        enabled: boolean;
        limit: number;
        usage: number;
        isAvailable: boolean;
        dataType: LicenseEntitlementDataType;
      }>;
    };
    authorization?: {
      id: string;
      myPrivileges?: AuthorizationPrivilege[] | undefined;
    };
    subspaces: Array<{
      id: string;
      type: SpaceType;
      profile: {
        id: string;
        displayName: string;
        url: string;
      };
      community: {
        id: string;
        roleSet: {
          id: string;
          authorization?: {
            myPrivileges?: AuthorizationPrivilege[] | undefined;
          };
        };
      };
    }>;
  }>;
}

interface NewVirtualContributorWizardProps {}

export interface useNewVirtualContributorWizardProvided {
  startWizard: (initAccount?: UserAccountProps | undefined) => void;
  NewVirtualContributorWizard: ComponentType<NewVirtualContributorWizardProps>;
}
