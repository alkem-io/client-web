import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { ProfileModel } from '@/domain/common/profile/ProfileModel';
import { OrgVerificationLifecycleEvents } from '@/domain/platform/admin/organizations/useAdminGlobalOrganizationsList';

export interface OrganizationModel {
  id: string;
  profile: ProfileModel;
  nameID?: string;
  contactEmail?: string;
  domain?: string;
  legalEntityName?: string;
  website?: string;
  verification?: {
    id: string;
    lifecycle: {
      id: string;
    };
    status: OrganizationVerificationEnum;
    isFinalized: boolean;
    nextEvents: OrgVerificationLifecycleEvents[];
    state: string;
  };
  settings?: {
    privacy: {
      contributionRolesPubliclyVisible: boolean;
    };
    membership: {
      allowUsersMatchingDomainToJoin: boolean;
    };
  };
}

export const EmptyOrganization: OrganizationModel = {
  id: '',
  nameID: '',
  contactEmail: undefined,
  domain: '',
  legalEntityName: '',
  website: '',
  verification: {
    id: '',
    lifecycle: {
      id: '',
    },
    status: OrganizationVerificationEnum.NotVerified,
    isFinalized: false,
    nextEvents: [OrgVerificationLifecycleEvents.VERIFICATION_REQUEST],
    state: 'notVerified',
  },
  profile: {
    id: '',
    displayName: '',
    tagline: '',
    description: '',
    url: '',
    tagsets: undefined,
    references: [],
    location: {
      id: '',
      city: '',
      country: '',
    },
  },
  settings: {
    privacy: {
      contributionRolesPubliclyVisible: false,
    },
    membership: {
      allowUsersMatchingDomainToJoin: false,
    },
  },
};
