import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ReferencesFragmentWithCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { BlockTitle, Caption, CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditReferenceDialog, {
  EditReferenceFormValues,
} from '../../../shared/components/References/EditReferenceDialog';
import CreateReferencesDialog, {
  ReferenceFormValues,
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
import { AuthorizationPrivilege, UpdateReferenceInput } from '../../../../core/apollo/generated/graphql-schema';
import ConfirmationDialog from '../../../../domain/platform/admin/templates/ConfirmationDialog';

type NeededFields = 'id' | 'calloutNameId';
export type LinkCollectionCalloutData = Pick<ReferencesFragmentWithCallout, NeededFields>;

const MAX_REFERENCES_NORMALVIEW = 3;
interface LinkCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutNames: string[];
}

// Just remap the id property to ID for the server to accept the Reference
const mapToUpdateReferenceInput = ({
  id: ID,
  ...rest
}: EditReferenceFormValues['reference']): UpdateReferenceInput => ({
  ID,
  ...rest,
});

const LinkCollectionCallout = forwardRef<HTMLDivElement, LinkCollectionCalloutProps>(
  ({ callout, loading, expanded, contributionsCount, onExpand, blockProps, ...calloutLayoutProps }, ref) => {
    const { t } = useTranslation();
    const [createReference] = useCreateReferenceOnProfileMutation();
    const [updateReferences] = useUpdateCalloutMutation();
    const [deleteReference] = useDeleteReferenceMutation();

    const [addLinkDialogOpen, setAddLinkDialogOpen] = useState<boolean>(false);
    const [editReference, setEditReference] = useState<EditReferenceFormValues['reference']>();
    const [deletingReferenceId, setDeletingReferenceId] = useState<string>();

    // TODO: Maybe this needs review:
    const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
    const canAddLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);
    const canEditLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);
    const canDeleteLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);

    const handleCreateLinks = useCallback(
      async (references: ReferenceFormValues[]) => {
        for (let reference of references) {
          await createReference({
            variables: {
              input: {
                profileID: callout.profile.id,
                name: reference.name,
                description: reference.description,
                uri: reference.uri,
              },
            },
            update: cache => {
              evictFromCache(cache, String(callout.id), 'Callout');
            },
          });
        }
        setAddLinkDialogOpen(false);
      },
      [createReference, setAddLinkDialogOpen, evictFromCache, callout]
    );

    const handleEditLink = useCallback(
      async ({ reference: editedReference }: EditReferenceFormValues) => {
        // Map references to the UpdateReferenceInput and Replace the reference that has been edited:
        const nextReferences = callout.profile.references?.map(reference =>
          reference.id === editedReference.id
            ? mapToUpdateReferenceInput(editedReference)
            : mapToUpdateReferenceInput(reference)
        );

        await updateReferences({
          variables: {
            calloutData: {
              ID: callout.id,
              profileData: {
                references: nextReferences,
              },
            },
          },
          update: cache => {
            evictFromCache(cache, String(callout.id), 'Callout');
          },
        });

        setEditReference(undefined);
      },
      [deletingReferenceId, setEditReference, evictFromCache, updateReferences, callout]
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
      setEditReference(undefined);
    }, [deletingReferenceId, setEditReference, evictFromCache, deleteReference, callout]);

    const limitedReferences = useMemo(() => callout.profile.references?.slice(0, MAX_REFERENCES_NORMALVIEW), [callout]);
    const isListTruncated = useMemo(
      () => callout.profile.references?.length ?? 0 > MAX_REFERENCES_NORMALVIEW,
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
              <IconButton aria-label="Add" size="small" onClick={() => setAddLinkDialogOpen(true)}>
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
            )}
          </Box>
          <CreateReferencesDialog
            open={addLinkDialogOpen}
            onClose={() => setAddLinkDialogOpen(false)}
            title={<Box>{t('callout.link-collection.add-link', { title: callout.profile.displayName })}</Box>}
            onSave={({ references }) => handleCreateLinks(references)}
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
            open={Boolean(deletingReferenceId)}
            title={t('callout.link-collection.delete-confirm-title')}
            onClose={() => setDeletingReferenceId(undefined)}
            onConfirm={() => handleDeleteLink()}
          >
            <BlockTitle>
              {t('callout.link-collection.delete-confirm', { title: callout.profile.displayName })}
            </BlockTitle>
          </ConfirmationDialog>
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default LinkCollectionCallout;
