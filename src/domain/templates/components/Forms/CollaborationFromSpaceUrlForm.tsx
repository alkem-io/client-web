import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/core/ui/typography';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import useUrlParser from '@/main/routing/resolvers/useUrlParser';
import {
  useJourneyRouteResolverLazyQuery,
  useSpaceCollaborationIdLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';

interface CollaborationFromSpaceUrlFormProps {
  onUseCollaboration: (url: string) => Promise<unknown>;
  collapsible?: boolean;
  onCollapse?: () => void;
}

const CollaborationFromSpaceUrlForm: React.FC<CollaborationFromSpaceUrlFormProps> = ({
  onUseCollaboration,
  collapsible,
  onCollapse,
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string>();
  const [collapsed, setCollapsed] = useState<boolean>(collapsible ?? false);
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
        journeyResult?.lookupByName.space?.subspaceByNameID?.subspaceByNameID?.id ??
        journeyResult?.lookupByName.space?.subspaceByNameID?.id ??
        journeyResult?.lookupByName.space?.id;
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
    <>
      {collapsed && (
        <Box textAlign="right">
          <Button variant="outlined" onClick={() => setCollapsed(false)}>
            {t('templateLibrary.collaborationTemplates.findByUrl.selectAnother')}
          </Button>
        </Box>
      )}
      {!collapsed && (
        <form onSubmit={e => e.preventDefault()}>
          <PageContentBlock>
            <Text>{t('templateLibrary.collaborationTemplates.findByUrl.description')}</Text>
            <Gutters disablePadding row alignItems="baseline">
              <TextField
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('templateLibrary.collaborationTemplates.findByUrl.title')}
                sx={{ flexGrow: 1 }}
                error={Boolean(urlError)}
                helperText={urlError}
              />
              <Box>
                {collapsible && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setCollapsed(true);
                      onCollapse?.();
                    }}
                  >
                    {t('buttons.cancel')}
                  </Button>
                )}
              </Box>
              <Box>
                <LoadingButton variant="contained" loading={loading} onClick={handleUse}>
                  {t('templateLibrary.collaborationTemplates.findByUrl.use')}
                </LoadingButton>
              </Box>
            </Gutters>
          </PageContentBlock>
        </form>
      )}
    </>
  );
};

export default CollaborationFromSpaceUrlForm;
