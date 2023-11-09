import { Paper, Skeleton, SvgIconProps } from '@mui/material';
import React, { ComponentType, FC } from 'react';
import CardHeader from '../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../core/ui/card/ContributeCard';
import { Caption } from '../../../core/ui/typography/components';
import InnovationPackIcon from '../../collaboration/InnovationPack/InnovationPackIcon';
import { WhiteboardIcon } from '../../collaboration/whiteboard/icon/WhiteboardIcon';
import {
  TemplateBase,
  TemplateCardBaseProps,
} from '../../collaboration/templates/CollaborationTemplatesLibrary/TemplateBase';
import { CalloutContributionType, CalloutState, CalloutType } from '../../../core/apollo/generated/graphql-schema';
import SwapColors from '../../../core/ui/palette/SwapColors';
import { ReferenceIcon } from '../../shared/components/References/icons/ReferenceIcon';
import { PostIcon } from '../../collaboration/post/icon/PostIcon';
import { BlockOutlined, DesignServicesOutlined, ForumOutlined } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import Gutters from '../../../core/ui/grid/Gutters';
import CardDetails from '../../../core/ui/card/CardDetails';
import CardDescriptionWithTags from '../../../core/ui/card/CardDescriptionWithTags';

export interface CalloutTemplate extends TemplateBase {
  contributionPolicy: {
    allowedContributionTypes: CalloutContributionType[];
    state: CalloutState;
  };
  type: CalloutType;
}

interface CalloutTemplateCardProps extends TemplateCardBaseProps<CalloutTemplate> {}

const CONTRIBUTION_ICON: Record<CalloutContributionType, ComponentType<SvgIconProps>> = {
  [CalloutContributionType.Link]: ReferenceIcon,
  [CalloutContributionType.Post]: PostIcon,
  [CalloutContributionType.Whiteboard]: WhiteboardIcon,
};

const getCalloutTypeIcon = (template: CalloutTemplate) => {
  switch (template.type) {
    case CalloutType.Post:
      return template.contributionPolicy.state === CalloutState.Open ? ForumOutlined : BlockOutlined;
    case CalloutType.Whiteboard:
    case CalloutType.WhiteboardRt:
      return WhiteboardIcon;
  }
};

const CalloutTemplateCard: FC<CalloutTemplateCardProps> = ({ template, innovationPack, loading, onClick }) => {
  const CalloutTypeIcon = template && getCalloutTypeIcon(template);

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={DesignServicesOutlined}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={template?.profile.tagset?.tags}>
          {template?.profile.description}
        </CardDescriptionWithTags>
      </CardDetails>
      <SwapColors>
        <Gutters row component={Paper} height={gutters(2)} alignItems="center" justifyContent="center" square>
          {CalloutTypeIcon && <CalloutTypeIcon />}
          {template?.contributionPolicy.allowedContributionTypes.map(type => {
            const Icon = CONTRIBUTION_ICON[type];
            return <Icon key={type} />;
          })}
        </Gutters>
      </SwapColors>
      {innovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default CalloutTemplateCard;
