import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import ExpandableDescription from './ExpandableDescription';

type ContributeCreationBlockProps = {
  canCreate: boolean;
  canEdit?: boolean;
  handleCreate: () => void;
  tabDescription: string;
  tabIndex?: number;
};

export const ContributeCreationBlock = ({
  tabDescription,
  canCreate,
  canEdit = false,
  handleCreate,
  tabIndex,
}: ContributeCreationBlockProps) => {
  const { t } = useTranslation();

  if (!tabDescription && !canCreate) {
    return null;
  }

  const editPath = `./${EntityPageSection.Settings}/${SettingsSection.Layout}`;

  return (
    <PageContentBlock accent>
      <ExpandableDescription description={tabDescription} editPath={editPath} canEdit={canEdit} tabIndex={tabIndex} />
      {canCreate && (
        <Actions justifyContent="end">
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleCreate}>
            {t('common.post')}
          </Button>
        </Actions>
      )}
    </PageContentBlock>
  );
};
