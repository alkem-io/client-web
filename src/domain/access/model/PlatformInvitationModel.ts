import type { RoleName } from '@/core/apollo/generated/graphql-schema';

export type PlatformInvitationModel = {
  id: string;
  createdDate?: Date;
  email: string;
  // Roles the invitation offers beyond the base role; empty when none.
  roleSetExtraRoles: RoleName[];
};
