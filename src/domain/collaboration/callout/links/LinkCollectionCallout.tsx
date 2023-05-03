import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ReferencesFragmentWithCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
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
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useUpdateCalloutMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AddIcon from '@mui/icons-material/Add';
import References from '../../../shared/components/References/References';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import ConfirmationDialog from '../../../../common/components/composite/dialogs/ConfirmationDialog';

type NeededFields = 'id' | 'calloutNameId';
export type LinkCollectionCalloutData = Pick<ReferencesFragmentWithCallout, NeededFields>;

const MAX_REFERENCES_NORMALVIEW = 3;

interface LinkCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutNames: string[];
}

const LinkCollectionCallout = forwardRef<HTMLDivElement, LinkCollectionCalloutProps>(
  ({ callout, loading, expanded, contributionsCount, onExpand, blockProps, ...calloutLayoutProps }, ref) => {
    const { t } = useTranslation();
    const [createReference] = useCreateReferenceOnProfileMutation();
    const [updateReferences] = useUpdateCalloutMutation();
    const [deleteReference] = useDeleteReferenceMutation();

    const [addNewReferenceDialogOpen, setAddNewReferenceDialogOpen] = useState<boolean>(false);
    const [editReference, setEditReference] = useState<EditReferenceFormValues>();
    const [deletingReferenceId, setDeletingReferenceId] = useState<string>();

    const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
    const canAddLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);
    const canEditLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);
    const canDeleteLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);

    // New References:
    const getNewReferenceId = useCallback(async () => {
      const { data } = await createReference({
        variables: {
          input: {
            profileID: callout.profile.id,
            // References names have to be unique, if everything goes well this name will never be shown:
            name: t('callout.link-collection.new-temporary-reference', {
              temp: Math.random().toString(36).slice(2, 6),
            }),
            description: '',
            uri: '',
          },
        },
      });
      if (!data?.createReferenceOnProfile.id) {
        throw new Error('Error creating the new Link');
      }
      return data.createReferenceOnProfile.id;
    }, [createReference, callout]);

    const removeNewReference = (referenceId: string) =>
      deleteReference({
        variables: {
          input: {
            ID: referenceId,
          },
        },
      });

    const handleSaveNewLinks = useCallback(
      async (references: CreateReferenceFormValues[]) => {
        await updateReferences({
          variables: {
            calloutData: {
              ID: callout.id,
              profileData: {
                references: [
                  ...references.map(reference => ({
                    ID: reference.id,
                    name: reference.name,
                    uri: reference.uri,
                    description: reference.description,
                  })),
                ],
              },
            },
          },
          update: cache => {
            evictFromCache(cache, String(callout.id), 'Callout');
          },
        });
        // Close the dialog
        setAddNewReferenceDialogOpen(false);
      },
      [updateReferences, setAddNewReferenceDialogOpen, evictFromCache, callout]
    );

    // Edit existing References:
    const handleEditLink = useCallback(
      async ({ id, ...rest }: EditReferenceFormValues) => {
        await updateReferences({
          variables: {
            calloutData: {
              ID: callout.id,
              profileData: {
                references: [
                  {
                    // Map to UpdateReferenceInput
                    ID: id,
                    ...rest,
                  },
                ],
              },
            },
          },
          update: cache => {
            evictFromCache(cache, String(callout.id), 'Callout');
          },
        });
        // Close the dialog
        setEditReference(undefined);
      },
      [setEditReference, evictFromCache, updateReferences, callout]
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
        update: cache => {
          evictFromCache(cache, String(callout.id), 'Callout');
        },
      });
      // Close the Confirm and the Edit dialogs
      setDeletingReferenceId(undefined);
      setEditReference(undefined);
    }, [deletingReferenceId, setEditReference, setDeletingReferenceId, evictFromCache, deleteReference, callout]);

    // List References:
    const limitedReferences = useMemo(() => callout.profile.references?.slice(0, MAX_REFERENCES_NORMALVIEW), [callout]);
    const isListTruncated = useMemo(
      () => (callout.profile.references?.length ?? 0) > MAX_REFERENCES_NORMALVIEW,
      [callout]
    );

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
        <CalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutLayoutProps}
          expanded={expanded}
          onExpand={onExpand}
          skipReferences
        >
          <References
            references={expanded ? callout.profile.references : limitedReferences}
            noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
            canEdit={canEditLinks}
            onEdit={ref => setEditReference(ref)}
          />

          <Box display="flex" justifyContent={isListTruncated && !expanded ? 'space-between' : 'end'} alignItems="end">
            {isListTruncated && !expanded && (
              <Caption component={Link} onClick={onExpand} sx={{ cursor: 'pointer' }}>
                {t('callout.link-collection.more-links', { count: callout.profile.references?.length })}
              </Caption>
            )}
            {canAddLinks && (
              <IconButton aria-label="Add" size="small" onClick={() => setAddNewReferenceDialogOpen(true)}>
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
            )}
          </Box>
          <CreateReferencesDialog
            open={addNewReferenceDialogOpen}
            title={<Box>{t('callout.link-collection.add-link', { title: callout.profile.displayName })}</Box>}
            onClose={() => setAddNewReferenceDialogOpen(false)}
            onAddMore={getNewReferenceId}
            onRemove={removeNewReference}
            onSave={handleSaveNewLinks}
          />
          <EditReferenceDialog
            open={Boolean(editReference)}
            onClose={() => setEditReference(undefined)}
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
              content: t('callout.link-collection.delete-confirm', { title: callout.profile.displayName }),
              confirmButtonTextId: 'buttons.delete',
            }}
          />
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default LinkCollectionCallout;
