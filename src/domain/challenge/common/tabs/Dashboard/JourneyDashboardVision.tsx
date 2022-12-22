import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import ApplicationButtonContainer from '../../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { JourneyTypeName } from '../../../JourneyTypeName';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { useChallenge } from '../../../challenge/hooks/useChallenge';
import OverflowGradient from '../../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../../core/ui/grid/utils';

interface JourneyDashboardVisionProps {
  vision: string;
  journeyTypeName: JourneyTypeName;
}

const JourneyDashboardVision = ({ vision, journeyTypeName }: JourneyDashboardVisionProps) => {
  const { t } = useTranslation();

  const { challengeId, challengeNameId, displayName: challengeName } = useChallenge();

  return (
    <PageContentBlock accent>
      <OverflowGradient maxHeight={gutters(11)}>
        <WrapperMarkdown>{vision}</WrapperMarkdown>
      </OverflowGradient>
      <Actions justifyContent="space-between">
        <Button component={Link} to={EntityPageSection.About} startIcon={<ArrowForward />}>
          {t('pages.generic.sections.dashboard.about', { entity: t(`common.${journeyTypeName}` as const) })}
        </Button>
        <ApplicationButtonContainer
          challengeId={challengeId}
          challengeNameId={challengeNameId}
          challengeName={challengeName}
        >
          {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
        </ApplicationButtonContainer>
      </Actions>
    </PageContentBlock>
  );
};

export default JourneyDashboardVision;
