import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { getVisualBannerNarrow } from '../../../../common/visual/utils/visuals.utils';
import CardWithProvider, { ExtraInfoWithIcon } from '../../../../shared/components/CardWithProvider';
import { AspectIcon } from '../../../../collaboration/aspect/icon/AspectIcon';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';

interface AspectImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const AspectImportTemplateCard = ({ template, onClick, actionButtons }: AspectImportTemplateCardProps) => {
  return (
    <CardWithProvider
      key={template.id}
      iconComponent={AspectIcon}
      title={template.info.title}
      provider={template.provider?.displayName}
      providerLogoUrl={template.provider?.profile.avatar?.uri}
      extraInformation={
        <ExtraInfoWithIcon iconComponent={Inventory2OutlinedIcon}>
          {template.innovationPackDisplayName}
        </ExtraInfoWithIcon>
      }
      imageUrl={getVisualBannerNarrow(template.info.visual)}
      defaultImage={<AspectIcon />}
      onClick={onClick}
      actionButtons={actionButtons}
    />
  );
};

export default AspectImportTemplateCard;
