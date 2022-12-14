import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useHub } from '../HubContext/useHub';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { PageProps } from '../../../shared/types/PageProps';
import HubChallengesView from '../views/HubChallengesView';
import ChallengesCardContainer from '../containers/ChallengesCardContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { CreateChallengeForm } from '../../challenge/forms/CreateChallengeForm';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';

export interface HubChallengesPageProps extends PageProps {}

const HubChallengesPage: FC<HubChallengesPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hubNameId, permissions } = useHub();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'challenges', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const [open, setOpen] = useState(false);

  const { createChallenge } = useJourneyCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createChallenge({
        hubID: hubNameId,
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
      });

      if (!result) {
        return;
      }
      // delay the navigation so all other processes related to updating the cache,
      // before closing the all subscriptions are completed
      setTimeout(() => navigate(buildChallengeUrl(hubNameId, result.nameID)), 100);
    },
    [navigate, createChallenge, hubNameId]
  );

  return (
    <HubPageLayout currentSection={EntityPageSection.Challenges}>
      {permissions.canCreateChallenges && (
        <Box sx={{ display: 'flex', justifyContent: 'end', marginBottom: theme => theme.spacing(1) }}>
          <Button startIcon={<AddOutlinedIcon />} variant="contained" onClick={() => setOpen(true)}>
            {t('buttons.create')}
          </Button>
        </Box>
      )}
      <ChallengesCardContainer hubNameId={hubNameId}>
        {(entities, state) => (
          <HubChallengesView
            entities={{
              challenges: entities.challenges,
              hubNameId: hubNameId,
              permissions: {
                canReadChallenges: permissions.canReadChallenges,
              },
            }}
            state={{ loading: state.loading, error: state.error }}
            actions={{}}
            options={{}}
          />
        )}
      </ChallengesCardContainer>
      <JourneyCreationDialog
        open={open}
        icon={<ChallengeIcon />}
        journeyName={t('common.challenge')}
        onClose={() => setOpen(false)}
        OnCreate={handleCreate}
        formComponent={CreateChallengeForm}
      />
    </HubPageLayout>
  );
};
export default HubChallengesPage;
