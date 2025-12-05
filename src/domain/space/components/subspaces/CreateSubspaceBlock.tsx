import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { SPACE_LAYOUT_EDIT_PATH } from '@/domain/space/constants/spaceEditPaths';
import ExpandableDescription from '../ExpandableDescription';

interface CreateSubspaceBlockProps {
  canCreateSubentity: boolean;
  canEdit?: boolean;
  onCreateSubentity?: () => void;
  tabDescription: string;
}

const CreateSubspaceBlock = ({
  canCreateSubentity,
  canEdit = false,
  onCreateSubentity,
  tabDescription,
}: CreateSubspaceBlockProps) => {
  const { t } = useTranslation();

  if (!tabDescription && !canCreateSubentity) {
    return null;
  }

  return (
    <PageContentBlock accent>
      <ExpandableDescription description={tabDescription} editPath={SPACE_LAYOUT_EDIT_PATH} canEdit={canEdit} />
      {canCreateSubentity && (
        <Box display="flex" justifyContent="flex-end">
          <Button startIcon={<AddOutlinedIcon />} variant="contained" onClick={onCreateSubentity}>
            {t('navigation.admin.subspace.create')}
          </Button>
        </Box>
      )}
    </PageContentBlock>
  );
};

export default CreateSubspaceBlock;
