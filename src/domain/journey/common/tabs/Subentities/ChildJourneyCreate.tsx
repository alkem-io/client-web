import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useSpaceTabs from '@/domain/journey/space/layout/useSpaceTabs';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';

interface ChildJourneyCreateProps {
  canCreateSubentity: boolean;
  level: SpaceLevel;
  onCreateSubentity?: () => void;
}

const ChildJourneyCreate = ({ canCreateSubentity, onCreateSubentity, level }: ChildJourneyCreateProps) => {
  const { t } = useTranslation();
  const { getTabDescription } = useSpaceTabs();
  const spaceType = t(`common.space-level.${level}`);

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>
        {getTabDescription(EntityPageSection.Subspaces) ||
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

export default ChildJourneyCreate;
