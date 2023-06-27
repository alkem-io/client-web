import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Skeleton } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { JourneyTypeName } from '../../../JourneyTypeName';
import { Actions } from '../../../../../core/ui/actions/Actions';
import OverflowGradient from '../../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../../core/ui/grid/utils';

interface JourneyDashboardVisionProps {
  vision: string | undefined;
  journeyTypeName: JourneyTypeName;
  header?: ReactNode;
  actions?: ReactNode;
}

const JourneyDashboardVision = ({ header, vision, journeyTypeName, actions }: JourneyDashboardVisionProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock accent>
      {header}
      <OverflowGradient maxHeight={gutters(11)}>
        {vision && <WrapperMarkdown>{vision}</WrapperMarkdown>}
        {!vision && <Skeleton />}
      </OverflowGradient>
      <Actions justifyContent="space-between">
        <Button component={Link} to={EntityPageSection.About} startIcon={<ArrowForward />}>
          {t('pages.generic.sections.dashboard.about', { entity: t(`common.${journeyTypeName}` as const) })}
        </Button>
        {actions}
      </Actions>
    </PageContentBlock>
  );
};

export default JourneyDashboardVision;
