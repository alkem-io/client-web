import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../../core/ui/typography';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const InnovationImportTemplateCard = ({ template, onClick }: InnovationImportTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.profile.displayName} iconComponent={AutoGraphIcon}>
        <CardHeaderCaption noWrap logoUrl={template.provider?.profile.visual?.uri}>
          {template.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription>{template.profile.description}</CardDescription>
        <CardTags tags={template.profile.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardSegmentCaption icon={<Inventory2OutlinedIcon />}>
        <Caption noWrap>{template.innovationPackProfile}</Caption>
      </CardSegmentCaption>
    </ContributeCard>
  );
};

export default InnovationImportTemplateCard;
