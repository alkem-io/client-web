import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { useCallback, useMemo, useState } from 'react';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { Caption, CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditReferenceDialog, {
  EditReferenceFormValues,
} from '../../../shared/components/References/EditReferenceDialog';
import CreateReferencesDialog, {
  CreateReferenceFormValues,
} from '../../../shared/components/References/CreateReferencesDialog';
import { Box, IconButton, Link } from '@mui/material';
import {
  useCreateLinkOnCalloutMutation,
  useDeleteReferenceMutation,
  useUpdateReferenceMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AddIcon from '@mui/icons-material/Add';
import References from '../../../shared/components/References/References';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { AuthorizationPrivilege, CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { nanoid } from 'nanoid';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { evictFromCache } from '../../../../core/apollo/utils/removeFromCache';
import { compact } from 'lodash';

const MAX_LINKS_NORMALVIEW = 3;

interface LinkCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutNames: string[];
}

const LinkCollectionCallout = ({
  callout,
  loading,
  expanded,
  contributionsCount,
  onExpand,
  blockProps,
  onCalloutUpdate,
  ...calloutLayoutProps
}: LinkCollectionCalloutProps) => {
  const { t } = useTranslation();
  const [createLinkOnCallout] = useCreateLinkOnCalloutMutation();
  const [updateReference] = useUpdateReferenceMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  const [addNewReferenceDialogOpen, setAddNewReferenceDialogOpen] = useState<boolean>(false);
  const [editReference, setEditReference] = useState<EditReferenceFormValues>();
  const [deletingReferenceId, setDeletingReferenceId] = useState<string>();

  const closeAddNewDialog = () => setAddNewReferenceDialogOpen(false);
  const closeEditDialog = () => setEditReference(undefined);

  const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
  const isContributionAllowed =
    calloutPrivileges.includes(AuthorizationPrivilege.Contribute) &&
    callout.contributionPolicy.state === CalloutState.Open;
  const canAddLinks = isContributionAllowed || calloutPrivileges.includes(AuthorizationPrivilege.Update);
  const canDeleteLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);

  // New References:
  const getNewReferenceId = useCallback(async () => {
    const { data } = await createLinkOnCallout({
      variables: {
        input: {
          calloutID: callout.id,
          link: {
            // References names have to be unique, if everything goes well this name will never be shown:
            name: t('callout.link-collection.new-temporary-reference', {
              temp: nanoid(4),
            }),
            description: '',
            uri: '',
          },
        },
      },
    });
    if (!data?.createContributionOnCallout.link?.id) {
      throw new Error('Error creating the new Link');
    }
    return data.createContributionOnCallout.link?.id;
  }, [createLinkOnCallout, callout]);

  const removeNewReference = (referenceId: string) =>
    deleteReference({
      variables: {
        input: {
          ID: referenceId,
        },
      },
      update: (cache, { data }) => data?.deleteReference && evictFromCache(cache, data.deleteReference.id, 'Reference'),
    });

  const handleSaveNewLinks = useCallback(
    async (references: CreateReferenceFormValues[]) => {
      await Promise.all(
        references.map(({ id, ...rest }) =>
          updateReference({
            variables: {
              input: {
                ID: id,
                ...rest,
              },
            },
          })
        )
      );

      onCalloutUpdate?.();
      closeAddNewDialog();
    },
    [updateReference, closeAddNewDialog, onCalloutUpdate, callout]
  );

  // Edit existing References:
  const handleEditLink = useCallback(
    async ({ id, ...rest }: EditReferenceFormValues) => {
      await updateReference({
        variables: {
          input: {
            ID: id,
            ...rest,
          },
        },
      });
      onCalloutUpdate?.();
      closeEditDialog();
    },
    [closeEditDialog, onCalloutUpdate, updateReference, callout]
  );

  const handleDeleteLink = useCallback(async () => {
    if (!deletingReferenceId) {
      return;
    }
    await deleteReference({
      variables: {
        input: {
          ID: deletingReferenceId,
        },
      },
    });
    onCalloutUpdate?.();
    setDeletingReferenceId(undefined);
    closeEditDialog();
  }, [deletingReferenceId, closeEditDialog, setDeletingReferenceId, onCalloutUpdate, deleteReference, callout]);

  const links = useMemo(() => compact(callout.contributions?.map(contribution => contribution.link)), [callout]);
  const limitedLinks = useMemo(
    () => compact(callout.contributions?.map(contribution => contribution.link))?.slice(0, MAX_LINKS_NORMALVIEW),
    [callout]
  );
  const isListTruncated = useMemo(
    () => (compact(callout.contributions?.map(contribution => contribution.link))?.length ?? 0) > MAX_LINKS_NORMALVIEW,
    [callout]
  );

  return (
    <StorageConfigContextProvider
      locationType="callout"
      calloutId={callout.id}
      journeyTypeName={calloutLayoutProps.journeyTypeName}
      spaceNameId={calloutLayoutProps.spaceNameId}
      challengeNameId={calloutLayoutProps.challengeNameId}
      opportunityNameId={calloutLayoutProps.opportunityNameId}
      skip={!addNewReferenceDialogOpen && !editReference}
    >
      <CalloutLayout
        callout={callout}
        contributionsCount={contributionsCount}
        {...calloutLayoutProps}
        expanded={expanded}
        onExpand={onExpand}
        skipReferences
        disableMarginal
      >
        <References
          references={expanded ? links : limitedLinks}
          noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
          onEdit={ref => setEditReference(ref)}
        />
        <Box display="flex" justifyContent={isListTruncated && !expanded ? 'space-between' : 'end'} alignItems="end">
          {isListTruncated && !expanded && (
            <Caption component={Link} onClick={onExpand} sx={{ cursor: 'pointer' }}>
              {t('callout.link-collection.more-links', { count: links.length })}
            </Caption>
          )}
          {canAddLinks && (
            <IconButton aria-label={t('common.add')} size="small" onClick={() => setAddNewReferenceDialogOpen(true)}>
              <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
            </IconButton>
          )}
        </Box>
        <CreateReferencesDialog
          open={addNewReferenceDialogOpen}
          title={<Box>{t('callout.link-collection.add-link', { title: callout.framing.profile.displayName })}</Box>}
          onClose={closeAddNewDialog}
          onAddMore={getNewReferenceId}
          onRemove={removeNewReference}
          onSave={handleSaveNewLinks}
        />
        <EditReferenceDialog
          open={Boolean(editReference)}
          onClose={closeEditDialog}
          title={<Box>{t('callout.link-collection.edit-link', { title: editReference?.name })}</Box>}
          reference={editReference!}
          onSave={values => handleEditLink(values)}
          canDelete={canDeleteLinks}
          onDelete={() => setDeletingReferenceId(editReference?.id)}
        />
        <ConfirmationDialog
          actions={{
            onConfirm: handleDeleteLink,
            onCancel: () => setDeletingReferenceId(undefined),
          }}
          options={{
            show: Boolean(deletingReferenceId),
          }}
          entities={{
            titleId: 'callout.link-collection.delete-confirm-title',
            content: t('callout.link-collection.delete-confirm', { title: callout.framing.profile.displayName }),
            confirmButtonTextId: 'buttons.delete',
          }}
        />
      </CalloutLayout>
    </StorageConfigContextProvider>
  );
};

export default LinkCollectionCallout;
