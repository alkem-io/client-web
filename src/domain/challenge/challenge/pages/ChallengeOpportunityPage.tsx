import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useChallenge, useUpdateNavigation } from '../../../../hooks';
import ChallengePageContainer from '../../../../containers/challenge/ChallengePageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ChallengeOpportunitiesView } from '../views/ChallengeOpportunitiesView';
import { PageProps } from '../../../../pages/common';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import { buildAdminNewOpportunityUrl } from '../../../../common/utils/urlBuilders';

export interface ChallengeOpportunityPageProps extends PageProps {}

const ChallengeOpportunityPage: FC<ChallengeOpportunityPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { hubNameId, challengeNameId, permissions } = useChallenge();
  const currentPaths = useMemo(
    () => [...paths, { value: '/opportunities', name: 'opportunities', real: false }],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  const newOpportunityUrl = useMemo(
    () => buildAdminNewOpportunityUrl(hubNameId, challengeNameId),
    [hubNameId, challengeNameId]
  );

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Opportunities}>
      {permissions.canCreate && (
        <Box sx={{ display: 'flex', justifyContent: 'end', marginBottom: theme => theme.spacing(1) }}>
          <Button startIcon={<AddOutlinedIcon />} variant="contained" component={RouterLink} to={newOpportunityUrl}>
            {t('buttons.create')}
          </Button>
        </Box>
      )}
      <ChallengePageContainer>
        {(entities, state) => <ChallengeOpportunitiesView entities={entities} state={state} />}
      </ChallengePageContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunityPage;
