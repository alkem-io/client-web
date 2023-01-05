import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { ExtraInfoWithIcon } from '../../../../shared/components/CardWithProvider';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../../core/ui/card/CardDescription';
import CardTags from '../../../../../core/ui/card/CardTags';
import CardFooter from '../../../../../core/ui/card/CardFooter';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const InnovationImportTemplateCard = ({ template, onClick }: InnovationImportTemplateCardProps) => {
  //       providerLogoUrl={template.provider?.profile.avatar?.uri}
// imageUrl={getVisualBannerNarrow(template.info.visual)}
//       defaultImage={<AutoGraphOutlinedIcon />}

return (
  <ContributeCard onClick={onClick}>
    <CardHeader title={template.info.title} iconComponent={AutoGraphIcon} createdBy={template.provider?.displayName} />
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

export default InnovationImportTemplateCard;
