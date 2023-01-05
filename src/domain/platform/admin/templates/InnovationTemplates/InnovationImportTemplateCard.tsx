import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardImage from '../../../../../core/ui/card/CardImage';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../../core/ui/typography';
import { gutters } from '../../../../../core/ui/grid/utils';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const InnovationImportTemplateCard = ({ template, onClick }: InnovationImportTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.info.title} iconComponent={AutoGraphIcon}>
        <CardHeaderCaption noWrap logoUrl={template.provider?.profile.avatar?.uri}>
          {template.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardImage
        src={getVisualBannerNarrow(template.info.visual)}
        alt={template.info.title}
        defaultImage={<AutoGraphIcon />}
      />
      <CardDetails>
        <CardDescription>{template.info.description}</CardDescription>
        <CardTags tags={template.info.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardSegmentCaption icon={<Inventory2OutlinedIcon sx={{ marginLeft: gutters(0.5) }} />} align="left">
        <Caption noWrap>{template.innovationPackDisplayName}</Caption>
      </CardSegmentCaption>
    </ContributeCard>
  );
};

export default InnovationImportTemplateCard;
