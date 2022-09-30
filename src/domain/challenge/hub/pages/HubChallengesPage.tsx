import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useHub, useUpdateNavigation } from '../../../../hooks';
import { PageProps } from '../../../../pages/common';
import HubChallengesView from '../views/HubChallengesView';
import ChallengesCardContainer from '../../../../containers/hub/ChallengesCardContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import { buildAdminNewChallengeUrl } from '../../../../common/utils/urlBuilders';

export interface HubChallengesPageProps extends PageProps {}

const HubChallengesPage: FC<HubChallengesPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { hubNameId, permissions } = useHub();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'challenges', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const newChallengeUrl = useMemo(() => buildAdminNewChallengeUrl(hubNameId), [hubNameId]);

  return (
    <HubPageLayout currentSection={EntityPageSection.Challenges}>
      {permissions.canCreate && (
        <Box sx={{ display: 'flex', justifyContent: 'end', marginBottom: theme => theme.spacing(1) }}>
          <Button startIcon={<AddOutlinedIcon />} variant="contained" component={RouterLink} to={newChallengeUrl}>
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
    </HubPageLayout>
  );
};
export default HubChallengesPage;
