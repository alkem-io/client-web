import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import CardDetails from '@/core/ui/card/CardDetails';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '@/core/ui/card/CardDescription';
import { Caption } from '@/core/ui/typography';
import CardSegmentCaption from '@/core/ui/card/CardSegmentCaption';
import InnovationPackIcon from '@/domain/InnovationPack/InnovationPackIcon';
import CardTags from '@/core/ui/card/CardTags';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { TemplateCardProps } from './TemplateCard';

interface CalloutTemplateCardProps extends TemplateCardProps {
  template: CalloutTemplate;
}

const CalloutTemplateCard: FC<CalloutTemplateCardProps> = ({
  template,
  innovationPack,
  loading,
  isSelected,
  ...props
}) => {
  const tags = template?.profile.defaultTagset?.tags ?? [];
  const footerHeight = tags.length > 0 ? 2 : 0;
  const descriptionHeightGutters = DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS - footerHeight;

  return (
    <ContributeCard {...props}>
      <CardHeader title={template?.profile.displayName} contrast={isSelected}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={innovationPack?.provider?.profile.avatar?.uri} contrast={isSelected}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={descriptionHeightGutters}>{template?.profile.description}</CardDescription>
      </CardDetails>
      <CardDetails>
        <CardTags tags={tags} marginY={1} hideIfEmpty />
      </CardDetails>
      {innovationPack?.profile.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default CalloutTemplateCard;
