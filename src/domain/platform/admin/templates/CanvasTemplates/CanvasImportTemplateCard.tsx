import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import ActionsCard, { ExtraInfoWithIcon } from '../../../../shared/components/ActionsCard';
import { getVisualBannerNarrow } from '../../../../../common/utils/visuals.utils';
import GestureIcon from '@mui/icons-material/Gesture';
import { WbIncandescentOutlined } from '@mui/icons-material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateFromInnovationPack } from '../InnovationPacks/InnovationPack';

interface CanvasImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateFromInnovationPack> {}

const CanvasImportTemplateCard = ({ template, actionButtons }: CanvasImportTemplateCardProps) => {
  return (
    <ActionsCard
      key={template.id}
      iconComponent={GestureIcon}
      title={template.info.title}
      provider={template.provider?.displayName}
      providerLogoUrl={template.provider?.profile.avatar?.uri}
      extraInformation={
        <ExtraInfoWithIcon iconComponent={Inventory2OutlinedIcon}>
          {template.innovationPackDisplayName}
        </ExtraInfoWithIcon>
      }
      imageUrl={getVisualBannerNarrow(template.info.visual)}
      defaultImage={<WbIncandescentOutlined />}
      actionButtons={actionButtons}
    />
  );
};

export default CanvasImportTemplateCard;
