import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { EmptyLocationMapped } from '@/domain/common/location/LocationModelMapped';
import { ProfileModelFull } from '@/domain/common/profile/ProfileModel';
import { EmptyTagset } from '@/domain/common/tagset/TagsetModel';
import { OrgVerificationLifecycleEvents } from '@/domain/platform/admin/organizations/useAdminGlobalOrganizationsList';

export interface OrganizationModel {
  id: string;
  profile: ProfileModelFull;
  nameID?: string;
  contactEmail?: string;
  domain?: string;
  legalEntityName?: string;
  website?: string;
  verification?: {
    id?: string;
    lifecycle?: {
      id: string;
    };
    status?: OrganizationVerificationEnum;
    isFinalized?: boolean;
    nextEvents?: OrgVerificationLifecycleEvents[];
    state?: string;
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

export const EmptyOrganizationModel: OrganizationModel = {
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
    tagsets: [EmptyTagset],
    references: [],
    location: EmptyLocationMapped,
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
