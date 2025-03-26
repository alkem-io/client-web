import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

interface SubspaceCreateProps {
  canCreateSubentity: boolean;
  level: SpaceLevel;
  onCreateSubentity?: () => void;
  tabDescription: string;
}

const SubspaceCreate = ({ canCreateSubentity, onCreateSubentity, tabDescription, level }: SubspaceCreateProps) => {
  const { t } = useTranslation();
  const spaceType = t(`common.space-level.${level}`);

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>
        {tabDescription ||
          t('pages.generic.sections.subEntities.description', {
            entities: spaceType,
          })}
      </WrapperMarkdown>
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

export default SubspaceCreate;
