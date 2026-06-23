import type { ReactNode } from 'react';
import type { ActorType } from '@/core/apollo/generated/graphql-schema';

type ContributorCardTooltip = {
  tags: string[];
  roleName?: string;
  city?: string;
  country?: string;
};

export interface ContributorCardSquareProps {
  id: string;
  avatar: string | undefined;
  avatarAltText?: string;
  displayName: string;
  tooltip?: ContributorCardTooltip;
  url: string;
  isContactable?: boolean;
  contributorType: ActorType;
  roleName?: ReactNode;
}
