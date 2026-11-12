import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { ContributorTypeId } from '@/crd/forms/callout/types';

// Only the contributor ActorType subtypes map to a kind; the others (SPACE/ACCOUNT/VIRTUAL_ASSISTANT) do not.
const SERVER_TO_TYPE_ID: Partial<Record<ActorType, ContributorTypeId>> = {
  [ActorType.User]: 'user',
  [ActorType.Organization]: 'organization',
  [ActorType.VirtualContributor]: 'virtualContributor',
};

export const contributorTypeFromActor = (type?: ActorType): ContributorTypeId | undefined =>
  type ? SERVER_TO_TYPE_ID[type] : undefined;
