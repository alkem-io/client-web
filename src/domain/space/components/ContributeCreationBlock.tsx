import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { SPACE_LAYOUT_EDIT_PATH } from '@/domain/space/constants/spaceEditPaths';
import ExpandableDescription from './ExpandableDescription';

type ContributeCreationBlockProps = {
  canCreate: boolean;
  canEdit?: boolean;
  handleCreate: () => void;
  tabDescription: string;
};

export const ContributeCreationBlock = ({
  tabDescription,
  canCreate,
  canEdit = false,
  handleCreate,
}: ContributeCreationBlockProps) => {
  const { t } = useTranslation();

  if (!tabDescription && !canCreate) {
    return null;
  }

  return (
    <PageContentBlock accent>
      <ExpandableDescription description={tabDescription} editPath={SPACE_LAYOUT_EDIT_PATH} canEdit={canEdit} />
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
