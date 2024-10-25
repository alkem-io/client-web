import React from 'react';
import { Skeleton } from '@mui/material';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import InnovationPackIcon from '../../../InnovationPack/InnovationPackIcon';
import { SubspaceIcon } from '../../../journey/subspace/icon/SubspaceIcon2';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../../../../core/ui/card/CardDescription';
import CardContent from '../../../../core/ui/card/CardContent';
import CardTags from '../../../../core/ui/card/CardTags';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import { TemplateCardProps } from './TemplateCard';
import { CollaborationTemplate } from '../../models/CollaborationTemplate';

interface CollaborationTemplateCardProps extends TemplateCardProps {
  template: CollaborationTemplate;
}

const CollaborationTemplateCard = ({ template, innovationPack, loading, ...props }: CollaborationTemplateCardProps) => {
  const innovationFlowStates = template?.collaboration?.innovationFlow?.states;

  const hasTags = (template?.profile.defaultTagset?.tags ?? []).length > 0;
  const descriptionHeightGutters = hasTags
    ? DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS - 2
    : DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS;

  return (
    <ContributeCard {...props}>
      <CardHeader title={template?.profile.displayName} iconComponent={SubspaceIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={descriptionHeightGutters}>{template?.profile.description}</CardDescription>
      </CardDetails>
      <CardDetails>
        <CardContent>
          <Caption sx={webkitLineClamp(2, { keepMinHeight: true })}>
            {innovationFlowStates?.map(state => state.displayName)?.join(' · ')}
          </Caption>
        </CardContent>
      </CardDetails>
      <CardDetails>
        <CardTags tags={template?.profile.defaultTagset?.tags ?? []} marginY={1} hideIfEmpty />
      </CardDetails>
      {innovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default CollaborationTemplateCard;
