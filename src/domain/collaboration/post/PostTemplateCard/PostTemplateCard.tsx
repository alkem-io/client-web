import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import InnovationPackIcon from '../../InnovationPack/InnovationPackIcon';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';
import CardDetails from '../../../../core/ui/card/CardDetails';
import {
  InnovationPackTemplate,
  TemplateCardBaseProps,
} from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { PostIcon } from '../../post/icon/PostIcon';

interface PostTemplateCardProps extends TemplateCardBaseProps<InnovationPackTemplate> {}

const PostTemplateCard: FC<PostTemplateCardProps> = ({ template, innovationPack, loading, onClick }) => {
  const cardInnovationPack = innovationPack || template?.innovationPack;

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={PostIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={cardInnovationPack?.provider?.profile.avatar?.uri}>
          {cardInnovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={template?.profile.tagset?.tags}>
          {template?.profile.description}
        </CardDescriptionWithTags>
      </CardDetails>
      {cardInnovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{cardInnovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default PostTemplateCard;
