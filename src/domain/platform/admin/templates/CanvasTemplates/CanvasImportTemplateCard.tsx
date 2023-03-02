import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import { CanvasIcon } from '../../../../collaboration/canvas/icon/CanvasIcon';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardImage from '../../../../../core/ui/card/CardImage';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../../core/ui/typography';

interface CanvasImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const CanvasImportTemplateCard = ({ template, onClick }: CanvasImportTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.info.title} iconComponent={CanvasIcon}>
        <CardHeaderCaption noWrap logoUrl={template.provider?.profile.avatar?.uri}>
          {template.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardImage
        src={getVisualBannerNarrow(template.info.visual)}
        alt={template.info.title}
        defaultImageSvg={<CanvasIcon />}
      />
      <CardSegmentCaption icon={<Inventory2OutlinedIcon />}>
        <Caption noWrap>{template.innovationPackDisplayName}</Caption>
      </CardSegmentCaption>
    </ContributeCard>
  );
};

export default CanvasImportTemplateCard;
