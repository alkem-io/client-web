import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import CardWithProvider, { ExtraInfoWithIcon } from '../../../../shared/components/CardWithProvider';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import { CanvasIcon } from '../../../../shared/icons/CanvasIcon';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';

interface CanvasImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const CanvasImportTemplateCard = ({ template, onClick, actionButtons }: CanvasImportTemplateCardProps) => {
  return (
    <CardWithProvider
      key={template.id}
      iconComponent={CanvasIcon}
      title={template.info.title}
      provider={template.provider?.displayName}
      providerLogoUrl={template.provider?.profile.avatar?.uri}
      extraInformation={
        <ExtraInfoWithIcon iconComponent={Inventory2OutlinedIcon}>
          {template.innovationPackDisplayName}
        </ExtraInfoWithIcon>
      }
      imageUrl={getVisualBannerNarrow(template.info.visual)}
      defaultImage={<CanvasIcon />}
      onClick={onClick}
      actionButtons={actionButtons}
    />
  );
};

export default CanvasImportTemplateCard;
