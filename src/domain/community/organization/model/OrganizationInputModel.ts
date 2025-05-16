import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { ProfileModel } from '@/domain/common/profile/ProfileModel';

export interface OrganizationInputModel {
  nameID: string;
  profile: ProfileModel;
  contactEmail: string | undefined;
  domain: string | undefined;
  legalEntityName: string | undefined;
  website: string | undefined;
  verified: OrganizationVerificationEnum;
}
