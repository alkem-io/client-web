import { Box, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/core/ui/typography';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../shared/utils/useLoadingState';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import useUrlParser from '../../../../main/routing/resolvers/useUrlParser';
import {
  useJourneyRouteResolverLazyQuery,
  useSpaceCollaborationIdLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';

interface CollaborationFromSpaceUrlFormProps {
  onUseCollaboration: (url: string) => Promise<unknown>;
}

const CollaborationFromSpaceUrlForm: React.FC<CollaborationFromSpaceUrlFormProps> = ({ onUseCollaboration }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string>();
  const { parseUrl } = useUrlParser();

  const [resolveJourneyRoute] = useJourneyRouteResolverLazyQuery();
  const [resolveCollaborationId] = useSpaceCollaborationIdLazyQuery();

  const [handleUse, loading] = useLoadingState(async () => {
    setUrlError(undefined);
    // First parse the url pasted and see if it's a valid journey url
    const parseResult = parseUrl(url);
    if ('error' in parseResult) {
      setUrlError(parseResult.error);
    } else {
      // Then resolve that url with the server to get the spaceId
      const { data: journeyResult } = await resolveJourneyRoute({
        variables: {
          spaceNameId: parseResult.journey[0]!,
          challengeNameId: parseResult.journey[1]!,
          opportunityNameId: parseResult.journey[2]!,
          includeChallenge: !!parseResult.journey[1],
          includeOpportunity: !!parseResult.journey[2],
        },
      });
      const spaceId =
        journeyResult?.space.subspace?.subspace?.id ?? journeyResult?.space.subspace?.id ?? journeyResult?.space.id;
      if (!spaceId) {
        setUrlError(t('templateLibrary.collaborationTemplates.findByUrl.spaceNotFoundError'));
      } else {
        // Then get the collaboration Id
        const { data: collaborationResult } = await resolveCollaborationId({
          variables: { spaceId },
        });
        const collaborationId = collaborationResult?.lookup.space?.collaboration.id;
        if (!collaborationId) {
          setUrlError(t('templateLibrary.collaborationTemplates.findByUrl.collaborationNotFoundError'));
        } else {
          // Finally, if everything went well, return the collaborationId to the parent component
          await onUseCollaboration(collaborationId);
        }
      }
    }
  });

  return (
    <form onSubmit={e => e.preventDefault()}>
      <PageContentBlock>
        <Text>{t('templateLibrary.collaborationTemplates.findByUrl.description')}</Text>
        <Box display="flex" flexDirection="row" alignItems="start">
          <TextField
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={t('templateLibrary.collaborationTemplates.findByUrl.title')}
            sx={{ flexGrow: 1, marginRight: gutters() }}
            error={Boolean(urlError)}
            helperText={urlError}
          />
          <LoadingButton variant="contained" loading={loading} onClick={handleUse} sx={{ marginTop: gutters(0.5) }}>
            {t('templateLibrary.collaborationTemplates.findByUrl.use')}
          </LoadingButton>
        </Box>
      </PageContentBlock>
    </form>
  );
};

export default CollaborationFromSpaceUrlForm;
