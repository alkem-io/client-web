import ListItemLink, { ListItemLinkProps } from '../../../../shared/components/SearchableList/ListItemLink';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import { CircularProgress, ListItemIcon } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { Formik } from 'formik';
import { SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import FormikAutocomplete from '../../../../../core/ui/forms/FormikAutocomplete';
import { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import { useUpdateSpacePlatformSettingsMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';

export interface SpaceVisibilityHolder {
  visibility: SpaceVisibility;
}

interface SpaceListItemProps extends ListItemLinkProps, SpaceVisibilityHolder {
  spaceId: string;
}

const SpaceListItem = ({ spaceId, visibility, ...props }: SpaceListItemProps) => {
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);

  const handleVisibilityClick: MouseEventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsVisibilityModalOpen(true);
  };

  const initialValues = {
    visibility,
  };

  const [updateSpaceVisibility, { loading }] = useUpdateSpacePlatformSettingsMutation();

  const handleSubmit = async ({ visibility }: Partial<SpaceVisibilityHolder>) => {
    if (!visibility) {
      return;
    }
    updateSpaceVisibility({
      variables: {
        spaceId,
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
          id: SpaceVisibility.Active,
          name: t(`common.enums.space-visibility.${SpaceVisibility.Active}` as const) as string,
        },
        {
          id: SpaceVisibility.Archived,
          name: t(`common.enums.space-visibility.${SpaceVisibility.Archived}` as const) as string,
        },
        {
          id: SpaceVisibility.Demo,
          name: t(`common.enums.space-visibility.${SpaceVisibility.Demo}` as const) as string,
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
                <BlockTitle>{t('pages.admin.spaces.updateVisibility')}</BlockTitle>
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

export default SpaceListItem;
