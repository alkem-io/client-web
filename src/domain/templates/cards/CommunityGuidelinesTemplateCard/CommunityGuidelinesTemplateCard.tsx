import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import { TemplateBase, TemplateCardBaseProps } from '../../library/CollaborationTemplatesLibrary/TemplateBase';
import { CommunityGuidelinesIcon } from '../../../community/communityGuidelines/icon/CommunityGuidelinesIcon';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import InnovationPackIcon from '../../../InnovationPack/InnovationPackIcon';
import { Caption } from '../../../../core/ui/typography';

interface CommunityGuidelinesTemplateCardProps extends TemplateCardBaseProps<TemplateBase> {}

const CommunityGuidelinesTemplateCard: FC<CommunityGuidelinesTemplateCardProps> = ({
  template,
  innovationPack,
  loading,
  ...props
}) => {
  return (
    <ContributeCard {...props}>
      <CardHeader title={template?.profile.displayName} iconComponent={CommunityGuidelinesIcon}>
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
      {innovationPack?.profile && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default CommunityGuidelinesTemplateCard;
