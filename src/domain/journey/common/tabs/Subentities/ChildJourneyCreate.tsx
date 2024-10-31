import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';

import { type JourneyTypeName } from '../../../JourneyTypeName';
import getJourneyChildrenTranslation from '../../../subspace/getJourneyChildrenTranslation';

const ChildJourneyCreate = ({ journeyTypeName, canCreateSubentity, onCreateSubentity }: ChildJourneyCreateProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>
        {t('pages.generic.sections.subentities.description', {
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

type ChildJourneyCreateProps = {
  canCreateSubentity: boolean;
  journeyTypeName: JourneyTypeName;
  onCreateSubentity?: () => void;
};
