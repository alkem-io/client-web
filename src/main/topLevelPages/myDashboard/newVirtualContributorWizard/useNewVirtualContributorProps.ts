import { ComponentType } from 'react';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';

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
    profile: {
      id: string;
      displayName: string;
      url: string;
    };
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

interface NewVirtualContributorWizardProps {}

export interface useNewVirtualContributorWizardProvided {
  startWizard: (initAccount?: UserAccountProps | undefined, accountName?: string) => void;
  NewVirtualContributorWizard: ComponentType<NewVirtualContributorWizardProps>;
}

export type SelectableSpace = {
  id: string;
  profile: {
    displayName: string;
    url: string;
  };
  community: {
    roleSet: {
      id: string;
    };
  };
  subspaces?: SelectableSpace[];
};

export interface SelectableKnowledgeSpace {
  id: string;
  name: string;
  url: string | undefined;
  roleSetId?: string;
  parentRoleSetIds?: string[];
}
