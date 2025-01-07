import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import getJourneyChildrenTranslation from '@/domain/journey/subspace/getJourneyChildrenTranslation';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

interface ChildJourneyCreateProps {
  canCreateSubentity: boolean;
  onCreateSubentity?: () => void;
  journeyTypeName: JourneyTypeName;
}

const ChildJourneyCreate = ({ journeyTypeName, canCreateSubentity, onCreateSubentity }: ChildJourneyCreateProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>
        {t('pages.generic.sections.subEntities.description', {
          entities: getJourneyChildrenTranslation(t, journeyTypeName),
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
