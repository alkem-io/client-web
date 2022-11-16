import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import ActionsCard, { ExtraInfoWithIcon } from '../../../../shared/components/ActionsCard';
import { getVisualBannerNarrow } from '../../../../../common/utils/visuals.utils';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateFromInnovationPack } from '../InnovationPacks/InnovationPack';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateFromInnovationPack> {}

const InnovationImportTemplateCard = ({ template, onClick, actionButtons }: InnovationImportTemplateCardProps) => {
  return (
    <ActionsCard
      key={template.id}
      iconComponent={AutoGraphIcon}
      title={template.info.title}
      provider={template.provider?.displayName}
      providerLogoUrl={template.provider?.profile.avatar?.uri}
      extraInformation={
        <ExtraInfoWithIcon iconComponent={Inventory2OutlinedIcon}>
          {template.innovationPackDisplayName}
        </ExtraInfoWithIcon>
      }
      imageUrl={getVisualBannerNarrow(template.info.visual)}
      defaultImage={<AutoGraphOutlinedIcon />}
      onClick={onClick}
      actionButtons={actionButtons}
    />
  );
};

export default InnovationImportTemplateCard;
