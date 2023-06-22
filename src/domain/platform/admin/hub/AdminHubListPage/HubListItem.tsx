import ListItemLink, { ListItemLinkProps } from '../../../../shared/components/SearchableList/ListItemLink';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import { CircularProgress, ListItemIcon } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { Formik } from 'formik';
import { HubVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import FormikAutocomplete from '../../../../../common/components/composite/forms/FormikAutocomplete';
import { FormikSelectValue } from '../../../../../common/components/composite/forms/FormikSelect';
import { useUpdateHubPlatformSettingsMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';

export interface HubVisibilityHolder {
  visibility: HubVisibility;
}

interface HubListItemProps extends ListItemLinkProps, HubVisibilityHolder {
  hubId: string;
}

const HubListItem = ({ hubId, visibility, ...props }: HubListItemProps) => {
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);

  const handleVisibilityClick: MouseEventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsVisibilityModalOpen(true);
  };

  const initialValues = {
    visibility,
  };

  const [updateHubVisibility, { loading }] = useUpdateHubPlatformSettingsMutation();

  const handleSubmit = async ({ visibility }: Partial<HubVisibilityHolder>) => {
    if (!visibility) {
      return;
    }
    updateHubVisibility({
      variables: {
        hubId,
        visibility,
      },
    });
    setIsVisibilityModalOpen(false);
  };

  const { t } = useTranslation();

  const selectOptions = useMemo<readonly FormikSelectValue[]>(
    () =>
      [
        {
          id: HubVisibility.Active,
          name: t(`common.enums.hub-visibility.${HubVisibility.Active}` as const) as string,
        },
        {
          id: HubVisibility.Archived,
          name: t(`common.enums.hub-visibility.${HubVisibility.Archived}` as const) as string,
        },
        {
          id: HubVisibility.Demo,
          name: t(`common.enums.hub-visibility.${HubVisibility.Demo}` as const) as string,
        },
      ] as const,
    [t]
  );

  return (
    <>
      <ListItemLink
        {...props}
        actions={
          <ListItemIcon onClick={loading ? undefined : handleVisibilityClick}>
            {loading ? <CircularProgress size={24} /> : <VisibilityOutlined />}
          </ListItemIcon>
        }
      />
      <DialogWithGrid open={isVisibilityModalOpen} onClose={() => setIsVisibilityModalOpen(false)}>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ submitForm }) => (
            <>
              <DialogHeader onClose={() => setIsVisibilityModalOpen(false)}>
                <BlockTitle>{t('pages.admin.hubs.updateVisibility')}</BlockTitle>
              </DialogHeader>
              <PageContentBlockSeamless>
                <FormikAutocomplete
                  name="visibility"
                  values={selectOptions}
                  onChange={submitForm}
                  disablePortal={false}
                  disabled={loading}
                />
              </PageContentBlockSeamless>
            </>
          )}
        </Formik>
      </DialogWithGrid>
    </>
  );
};

export default HubListItem;
