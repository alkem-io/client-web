import { Skeleton } from '@mui/material';
import React, { ReactNode } from 'react';
import CardHeader from '@/core/ui/card/CardHeader';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import { DesignServicesOutlined } from '@mui/icons-material';
import CardDetails from '@/core/ui/card/CardDetails';
import CardDescriptionWithTags from '@/core/ui/card/CardDescriptionWithTags';
import { Visual } from '@/domain/common/visual/Visual';
import { GenericCalloutIcon } from '../icons/calloutIcons';
import RouterLink from '@/core/ui/link/RouterLink';

export interface CalloutCardCallout {
  framing: {
    profile: {
      displayName: string;
      description?: string;
      tagset?: {
        tags: string[];
      };
      url: string;
    };
  };
}

interface Author {
  profile: {
    displayName: string;
    avatar?: Visual;
  };
}

interface CalloutCardProps extends ContributeCardProps {
  callout: CalloutCardCallout | undefined;
  author?: Author;
  loading?: boolean;
  footer?: ReactNode;
  template?: boolean;
}

const CalloutCard = ({
  callout,
  author,
  loading = false,
  template = false,
  footer,
  ...cardProps
}: CalloutCardProps) => {
  const CalloutIcon = !template && callout ? GenericCalloutIcon : DesignServicesOutlined;

  const LinkCardHeader = callout?.framing.profile.url ? RouterLink : React.Fragment;
  return (
    <ContributeCard {...cardProps}>
      <LinkCardHeader to={callout?.framing.profile.url!}>
        <CardHeader title={callout?.framing.profile.displayName} iconComponent={CalloutIcon}>
          {loading && <Skeleton />}
          <CardHeaderCaption logoUrl={author?.profile.avatar?.uri}>{author?.profile.displayName}</CardHeaderCaption>
        </CardHeader>
      </LinkCardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={callout?.framing.profile.tagset?.tags}>
          {callout?.framing.profile.description}
        </CardDescriptionWithTags>
      </CardDetails>
      {footer}
    </ContributeCard>
  );
};

export default CalloutCard;
