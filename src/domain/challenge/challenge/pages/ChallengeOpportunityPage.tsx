import React, { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BatchPredictionOutlinedIcon from '@mui/icons-material/BatchPredictionOutlined';
import { useChallenge, useUpdateNavigation } from '../../../../hooks';
import ChallengePageContainer from '../../../../containers/challenge/ChallengePageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ChallengeOpportunitiesView } from '../views/ChallengeOpportunitiesView';
import { PageProps } from '../../../shared/types/PageProps';
import { buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { CreateOpportunityForm } from '../../opportunity/forms/CreateOpportunityForm';

export interface ChallengeOpportunityPageProps extends PageProps {}

const ChallengeOpportunityPage: FC<ChallengeOpportunityPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hubNameId, challengeId, challengeNameId, permissions } = useChallenge();
  const currentPaths = useMemo(
    () => [...paths, { value: '/opportunities', name: 'opportunities', real: false }],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  const [open, setOpen] = useState(false);

  const { createOpportunity } = useJourneyCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createOpportunity({
        challengeID: challengeId,
        displayName: value.displayName,
        tagline: value.tagline,
        vision: value.vision,
        tags: value.tags,
      });

      if (!result) {
        return;
      }

      // delay the navigation so all other processes related to updating the cache
      // and closing all subscriptions are completed
      setTimeout(() => navigate(buildOpportunityUrl(hubNameId, challengeNameId, result.nameID)), 100);
    },
    [navigate, createOpportunity, hubNameId, challengeId, challengeNameId]
  );

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Opportunities}>
      {permissions.canCreateOpportunity && (
        <Box sx={{ display: 'flex', justifyContent: 'end', marginBottom: theme => theme.spacing(1) }}>
          <Button startIcon={<AddOutlinedIcon />} variant="contained" onClick={() => setOpen(true)}>
            {t('buttons.create')}
          </Button>
        </Box>
      )}
      <ChallengePageContainer>
        {(entities, state) => <ChallengeOpportunitiesView entities={entities} state={state} />}
      </ChallengePageContainer>
      <JourneyCreationDialog
        open={open}
        icon={<BatchPredictionOutlinedIcon />}
        journeyName={t('common.opportunity')}
        onClose={() => setOpen(false)}
        OnCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunityPage;
