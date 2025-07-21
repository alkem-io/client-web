import { Box, Button, TextField } from '@mui/material';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/core/ui/typography';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useUrlResolverLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';
import { UrlType } from '@/core/apollo/generated/graphql-schema';

export interface SpaceContentFromSpaceUrlFormRef {
  resetForm: () => void;
}
interface SpaceContentFromSpaceUrlFormProps {
  onUseSpace: (spaceId: string) => Promise<unknown>; // Callback function to handle click on "Use this space" button
  disabled?: boolean;
  collapsible?: boolean;
  onCollapse?: () => void;
}

const SpaceContentFromSpaceUrlForm = forwardRef<SpaceContentFromSpaceUrlFormRef, SpaceContentFromSpaceUrlFormProps>(
  ({ onUseSpace, disabled, collapsible, onCollapse }: SpaceContentFromSpaceUrlFormProps, ref) => {
    const { t } = useTranslation();
    const [url, setUrl] = useState('');
    const [urlError, setUrlError] = useState<string>();
    const [collapsed, setCollapsed] = useState<boolean>(collapsible ?? false);
    const [parseUrl] = useUrlResolverLazyQuery();

    useImperativeHandle(
      ref,
      () => ({
        resetForm: () => setUrl(''),
      }),
      []
    );

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
      const spaceId = data.urlResolver.space?.id;
      if (!spaceId) {
        setUrlError(t('templateLibrary.spaceTemplates.findByUrl.spaceNotFoundError'));
      } else {
        // Finally, if everything went well, return the spaceId
        await onUseSpace(spaceId);
      }
    });

    return (
      <>
        {collapsed && (
          <Box textAlign="right">
            <Button variant="outlined" onClick={() => setCollapsed(false)} disabled={disabled}>
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
                  disabled={disabled}
                  placeholder={t('templateLibrary.spaceTemplates.findByUrl.title')}
                  sx={{ flexGrow: 1 }}
                  error={Boolean(urlError)}
                  helperText={urlError}
                />
                <Box>
                  {collapsible && (
                    <Button
                      variant="outlined"
                      disabled={disabled}
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
                  <Button variant="contained" loading={loading} onClick={handleUse} disabled={disabled}>
                    {t('templateLibrary.spaceTemplates.findByUrl.use')}
                  </Button>
                </Box>
              </Gutters>
            </PageContentBlock>
          </form>
        )}
      </>
    );
  }
);

SpaceContentFromSpaceUrlForm.displayName = 'SpaceContentFromSpaceUrlForm';

export default SpaceContentFromSpaceUrlForm;
