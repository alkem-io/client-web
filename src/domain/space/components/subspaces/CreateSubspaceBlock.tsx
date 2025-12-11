import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

interface CreateSubspaceBlockProps {
  canCreateSubentity: boolean;
  onCreateSubentity?: () => void;
  tabDescription: string;
}

const CreateSubspaceBlock = ({ canCreateSubentity, onCreateSubentity, tabDescription }: CreateSubspaceBlockProps) => {
  const { t } = useTranslation();

  if (!tabDescription && !canCreateSubentity) {
    return null;
  }

  return (
    <PageContentBlock accent>
      {tabDescription && <WrapperMarkdown>{tabDescription}</WrapperMarkdown>}
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
