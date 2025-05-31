import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/core/ui/typography';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useUrlResolverLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';
import { UrlType } from '@/core/apollo/generated/graphql-schema';

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
  const [parseUrl] = useUrlResolverLazyQuery();

  const [handleUse, loading] = useLoadingState(async () => {
    setUrlError(undefined);
    if (!url) {
      setUrlError(t('templateLibrary.spaceTemplates.findByUrl.urlRequired'));
      return;
    }
    const { data, error } = await parseUrl({
      variables: { url },
    });
    if (error) {
      setUrlError(error.message);
      return;
    }
    if (data?.urlResolver.type !== UrlType.Space) {
      setUrlError(t('templateLibrary.spaceTemplates.findByUrl.invalidUrl'));
      return;
    }
    const collaborationId = data.urlResolver.space?.collaboration.id;
    if (!collaborationId) {
      setUrlError(t('templateLibrary.spaceTemplates.findByUrl.collaborationNotFoundError'));
    } else {
      // Finally, if everything went well, return the collaborationId to the parent component
      await onUseCollaboration(collaborationId);
    }
  });

  return (
    <>
      {collapsed && (
        <Box textAlign="right">
          <Button variant="outlined" onClick={() => setCollapsed(false)}>
            {t('templateLibrary.spaceTemplates.findByUrl.selectAnother')}
          </Button>
        </Box>
      )}
      {!collapsed && (
        <form onSubmit={e => e.preventDefault()}>
          <PageContentBlock>
            <Text>{t('templateLibrary.spaceTemplates.findByUrl.description')}</Text>
            <Gutters disablePadding row alignItems="baseline">
              <TextField
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('templateLibrary.spaceTemplates.findByUrl.title')}
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
                <Button variant="contained" loading={loading} onClick={handleUse}>
                  {t('templateLibrary.spaceTemplates.findByUrl.use')}
                </Button>
              </Box>
            </Gutters>
          </PageContentBlock>
        </form>
      )}
    </>
  );
};

export default CollaborationFromSpaceUrlForm;
