import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';

/**
 * Lightweight organization model for non-verified organizations.
 * These organizations have minimal information and no account/resource management.
 */
export interface OrganizationModelLightweight {
  id: string;
  profile: {
    id: string;
    displayName: string;
    description?: string;
    tagline?: string;
    avatar?: {
      uri: string;
    };
  };
  verification: {
    status: OrganizationVerificationEnum.NotVerified;
  };
}

/**
 * Type guard to check if an organization is lightweight (non-verified).
 */
export const isLightweightOrganization = (
  verification?: { status?: OrganizationVerificationEnum }
): boolean => {
  return verification?.status === OrganizationVerificationEnum.NotVerified;
};

/**
 * Type guard to check if an organization is verified.
 */
export const isVerifiedOrganization = (
  verification?: { status?: OrganizationVerificationEnum }
): boolean => {
  return verification?.status === OrganizationVerificationEnum.VerifiedManualAttestation;
};

/**
 * Get display-friendly verification status label.
 */
export const getVerificationStatusLabel = (
  verification?: { status?: OrganizationVerificationEnum }
): string => {
  if (isVerifiedOrganization(verification)) {
    return 'Verified';
  }
  return 'Not Verified';
};
