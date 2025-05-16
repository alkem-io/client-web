import { RoleName } from '@/core/apollo/generated/graphql-schema';

export type RoleDefinition = {
  name: RoleName;
  organizationPolicy: {
    minimum: number;
    maximum: number;
  };
  userPolicy: {
    minimum: number;
    maximum: number;
  };
};
