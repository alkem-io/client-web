import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import { ExtraInfoWithIcon } from '../../../../shared/components/CardWithProvider';
import { AspectIcon } from '../../../../collaboration/aspect/icon/AspectIcon';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardFooter from '../../../../../core/ui/card/CardFooter';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';

interface AspectImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const AspectImportTemplateCard = ({ template, onClick }: AspectImportTemplateCardProps) => {
  //       providerLogoUrl={template.provider?.profile.avatar?.uri}
  //            imageUrl={getVisualBannerNarrow(template.info.visual)}
//       defaultImage={<AspectIcon />}

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template.info.title} iconComponent={AspectIcon} createdBy={template.provider?.displayName} />
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

export default AspectImportTemplateCard;
