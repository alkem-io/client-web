import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';
import CardDetails from '../../../../core/ui/card/CardDetails';
import {
  InnovationPackTemplate,
  TemplateCardBaseProps,
} from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import InnovationPackIcon from '../../InnovationPack/InnovationPackIcon';
import { MemberGuidelinesIcon } from '../icon/MemberGuidelinesIcon';

interface MemberGuidelinesTemplateCardProps extends TemplateCardBaseProps<InnovationPackTemplate> {}

const MemberGuidelinesTemplateCard: FC<MemberGuidelinesTemplateCardProps> = ({ template, loading, onClick }) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={MemberGuidelinesIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={template?.innovationPack?.provider?.profile.avatar?.uri}>
          {template?.innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={template?.profile.tagset?.tags}>
          {template?.profile.description}
        </CardDescriptionWithTags>
      </CardDetails>
      {template?.innovationPack?.profile && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{template?.innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default MemberGuidelinesTemplateCard;
