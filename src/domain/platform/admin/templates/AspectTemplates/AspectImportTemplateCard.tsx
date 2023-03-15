import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { AspectIcon } from '../../../../collaboration/aspect/icon/AspectIcon';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../../core/ui/typography';

interface AspectImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const AspectImportTemplateCard = ({ template, onClick }: AspectImportTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.info.title} iconComponent={AspectIcon}>
        <CardHeaderCaption noWrap logoUrl={template.provider?.profile.avatar?.uri}>
          {template.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription>{template.info.description}</CardDescription>
        <CardTags tags={template.info.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardSegmentCaption icon={<Inventory2OutlinedIcon />}>
        <Caption noWrap>{template.innovationPackDisplayName}</Caption>
      </CardSegmentCaption>
    </ContributeCard>
  );
};

export default AspectImportTemplateCard;
