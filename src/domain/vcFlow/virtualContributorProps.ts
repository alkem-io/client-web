import { ComponentType } from 'react';
import {
  AiPersonaBodyOfKnowledgeType,
  AiPersonaEngine,
  AuthorizationPrivilege,
  LicenseEntitlementType,
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

interface virtualContributorWizardProps {}

export interface useVirtualContributorWizardProvided {
  startWizard: (initAccount?: UserAccountProps | undefined, accountName?: string) => void;
  VirtualContributorWizard: ComponentType<virtualContributorWizardProps>;
}

export interface SelectableSpace {
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
}

export interface SelectableKnowledgeSpace {
  id: string;
  name: string;
  url: string | undefined;
  roleSetId?: string;
  parentRoleSetIds?: string[];
}

export interface CreateVcFromProps {
  name: string;
  tagline: string;
  description: string;
  externalConfig?: {
    apiKey?: string;
    assistantId?: string;
  };
  engine: AiPersonaEngine;
  bodyOfKnowledgeType: AiPersonaBodyOfKnowledgeType;
}
