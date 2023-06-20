import React from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import InnovationPackIcon from '../../../../collaboration/InnovationPack/InnovationPackIcon';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../../core/ui/typography';
import { InnovationFlowIcon } from './InnovationFlow/InnovationFlowIcon';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const InnovationImportTemplateCard = ({ template, onClick }: InnovationImportTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.profile.displayName} iconComponent={InnovationFlowIcon as SvgIconComponent}>
        <CardHeaderCaption noWrap logoUrl={template.provider?.profile.avatar?.uri}>
          {template.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription>{template.profile.description || ''}</CardDescription>
        <CardTags tags={template.profile.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardSegmentCaption icon={<InnovationPackIcon />}>
        <Caption noWrap>{template.innovationPackProfile.displayName}</Caption>
      </CardSegmentCaption>
    </ContributeCard>
  );
};

export default InnovationImportTemplateCard;
