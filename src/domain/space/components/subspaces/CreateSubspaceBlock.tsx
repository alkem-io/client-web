import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { SPACE_LAYOUT_EDIT_PATH } from '@/domain/space/constants/spaceEditPaths';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import useCurrentTabPosition from '@/domain/space/layout/tabbedLayout/useCurrentTabPosition';
import ExpandableDescription from '../ExpandableDescription';

interface CreateSubspaceBlockProps {
  canCreateSubentity: boolean;
  onCreateSubentity?: () => void;
  tabDescription: string;
}

const CreateSubspaceBlock = ({ canCreateSubentity, onCreateSubentity, tabDescription }: CreateSubspaceBlockProps) => {
  const { t } = useTranslation();
  const tabPosition = useCurrentTabPosition();
  const { canEditInnovationFlow } = useSpaceTabProvider({ tabPosition });

  if (!tabDescription && !canCreateSubentity) {
    return null;
  }

  return (
    <PageContentBlock accent>
      <ExpandableDescription
        description={tabDescription}
        editPath={SPACE_LAYOUT_EDIT_PATH}
        canEdit={canEditInnovationFlow}
      />
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
