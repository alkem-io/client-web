import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { ExtraInfoWithIcon } from '../../../../shared/components/CardWithProvider';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import { CanvasIcon } from '../../../../collaboration/canvas/icon/CanvasIcon';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardFooter from '../../../../../core/ui/card/CardFooter';
import CardDescription from '../../../../../core/ui/card/CardDescription';

interface CanvasImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const CanvasImportTemplateCard = ({ template, onClick }: CanvasImportTemplateCardProps) => {
  //       providerLogoUrl={template.provider?.profile.avatar?.uri}
// imageUrl={getVisualBannerNarrow(template.info.visual)}
//       defaultImage={<CanvasIcon />}

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.info.title} iconComponent={CanvasIcon} createdBy={template.provider?.displayName} />
      <CardDetails>
        <CardDescription>{template.info.description}</CardDescription>
        <CardTags tags={template.info.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardFooter>
        <ExtraInfoWithIcon iconComponent={Inventory2OutlinedIcon}>
          {template.innovationPackDisplayName}
        </ExtraInfoWithIcon>
      </CardFooter>
    </ContributeCard>
  );
};

export default CanvasImportTemplateCard;
