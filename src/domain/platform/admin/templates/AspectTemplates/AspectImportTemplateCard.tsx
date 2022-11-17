import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { getVisualBannerNarrow } from '../../../../../common/utils/visuals.utils';
import CardWithProvider, { ExtraInfoWithIcon } from '../../../../shared/components/CardWithProvider';
import PanoramaOutlinedIcon from '@mui/icons-material/PanoramaOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateFromInnovationPack } from '../InnovationPacks/InnovationPack';

interface AspectImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateFromInnovationPack> {}

const AspectImportTemplateCard = ({ template, onClick, actionButtons }: AspectImportTemplateCardProps) => {
  return (
    <CardWithProvider
      key={template.id}
      iconComponent={PanoramaOutlinedIcon}
      title={template.info.title}
      provider={template.provider?.displayName}
      providerLogoUrl={template.provider?.profile.avatar?.uri}
      extraInformation={
        <ExtraInfoWithIcon iconComponent={Inventory2OutlinedIcon}>
          {template.innovationPackDisplayName}
        </ExtraInfoWithIcon>
      }
      imageUrl={getVisualBannerNarrow(template.info.visual)}
      defaultImage={<PanoramaOutlinedIcon />}
      onClick={onClick}
      actionButtons={actionButtons}
    />
  );
};

export default AspectImportTemplateCard;
