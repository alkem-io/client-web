import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import ApplicationButtonContainer from '../../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { JourneyTypeName } from '../../../JourneyTypeName';

interface JourneySubentityCreateProps {
  journeyTypeName: JourneyTypeName;
}

const JourneySubentityCreate = ({ journeyTypeName }: JourneySubentityCreateProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>
        {t('pages.generic.sections.subentities.description', {
          entities: t('common.challenges'),
          parentEntity: t(`common.${journeyTypeName}` as const),
        })}
      </WrapperMarkdown>
      <Box display="flex" justifyContent="space-between">
        <Button component={Link} to={EntityPageSection.About} startIcon={<ArrowForward />}>
          {t('pages.generic.sections.dashboard.about', { entity: t(`common.${journeyTypeName}` as const) })}
        </Button>
        <ApplicationButtonContainer>
          {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
        </ApplicationButtonContainer>
      </Box>
    </PageContentBlock>
  );
};

export default JourneySubentityCreate;
