import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard, { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import InnovationPackIcon from '../../InnovationPack/InnovationPackIcon';
import { PostIcon } from '../icon/PostIcon';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../../../../core/ui/card/CardDescription';
import CardTags from '../../../../core/ui/card/CardTags';
import CardDetails from '../../../../core/ui/card/CardDetails';

export interface PostTemplate {
  displayName: string;
  description: string | undefined;
  // visualUri: string | undefined;
  tags: string[] | undefined;
  provider: {
    displayName: string | undefined;
    avatarUri: string | undefined;
  };
  innovationPack: {
    id: string | undefined;
    displayName: string | undefined;
  };
}

interface PostTemplateCardProps extends ContributeCardProps {
  template: PostTemplate | undefined;
  loading?: boolean;
}

const PostTemplateCard: FC<PostTemplateCardProps> = ({ template, loading, onClick }) => {
  const tags = template?.tags ?? [];
  const descriptionHeight =
    tags.length > 0 ? DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS : DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS + 2;

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.displayName} iconComponent={PostIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={template?.provider?.avatarUri}>
          {template?.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={descriptionHeight}>{template?.description ?? ''}</CardDescription>
        <CardTags tags={tags} marginY={1} hideIfEmpty />
      </CardDetails>
      {template?.innovationPack.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{template?.innovationPack.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default PostTemplateCard;
