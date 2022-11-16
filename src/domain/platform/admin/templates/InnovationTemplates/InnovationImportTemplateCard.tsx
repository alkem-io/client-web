import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogTemplatesGallery';
import ActionsCard, { ExtraInfoWithIcon } from '../../../../shared/components/ActionsCard';
import { getVisualBannerNarrow } from '../../../../../common/utils/visuals.utils';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps {}

const InnovationImportTemplateCard = ({ template, actionButtons }: InnovationImportTemplateCardProps) => {
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
      actionButtons={actionButtons}
    />
  );
};

export default InnovationImportTemplateCard;
