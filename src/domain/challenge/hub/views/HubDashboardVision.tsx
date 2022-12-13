import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';

interface HubDashboardVisionProps {
  vision: string;
}

const HubDashboardVision = ({ vision }: HubDashboardVisionProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>{vision}</WrapperMarkdown>
      <Box display="flex" justifyContent="space-between">
        <Button component={Link} to={EntityPageSection.About} startIcon={<ArrowForward />}>
          {t('pages.hub.about-this-hub')}
        </Button>
        <ApplicationButtonContainer>
          {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
        </ApplicationButtonContainer>
      </Box>
      <TagsComponent tags={['one', 'two', 'three']} />
    </PageContentBlock>
  );
};

export default HubDashboardVision;
