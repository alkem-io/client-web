import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { JourneyTypeName } from '../../../JourneyTypeName';
import getJourneyChildrenTranslation from '../../../childJourney/getJourneyChildrenTranslation';
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
        {t('pages.generic.sections.subentities.description', {
          entities: getJourneyChildrenTranslation(t, journeyTypeName),
          parentEntity: t(`common.${journeyTypeName}` as const),
        })}
      </WrapperMarkdown>
      {canCreateSubentity && (
        <Box display="flex" justifyContent="flex-end">
          <Button startIcon={<AddOutlinedIcon />} variant="contained" onClick={onCreateSubentity}>
            {t('buttons.create')}
          </Button>
        </Box>
      )}
    </PageContentBlock>
  );
};

export default ChildJourneyCreate;
