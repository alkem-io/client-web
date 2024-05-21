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
import { TemplateBase, TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { PostIcon } from '../../post/icon/PostIcon';

interface PostTemplateCardProps extends TemplateCardBaseProps<TemplateBase> {}

const PostTemplateCard: FC<PostTemplateCardProps> = ({ template, innovationPack, loading, onClick }) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={PostIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={template?.profile.tagset?.tags}>
          {template?.profile.description}
        </CardDescriptionWithTags>
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

export default PostTemplateCard;
