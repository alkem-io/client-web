import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import ExpandableDescription from '../ExpandableDescription';

interface CreateSubspaceBlockProps {
  canCreateSubentity: boolean;
  canEdit?: boolean;
  onCreateSubentity?: () => void;
  tabDescription: string;
  tabIndex?: number;
}

const CreateSubspaceBlock = ({
  canCreateSubentity,
  canEdit = false,
  onCreateSubentity,
  tabDescription,
  tabIndex,
}: CreateSubspaceBlockProps) => {
  const { t } = useTranslation();

  if (!tabDescription && !canCreateSubentity) {
    return null;
  }

  const editPath = `./${EntityPageSection.Settings}/${SettingsSection.Layout}`;

  return (
    <PageContentBlock accent>
      <ExpandableDescription description={tabDescription} editPath={editPath} canEdit={canEdit} tabIndex={tabIndex} />
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
