import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
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
  useCreateLinkOnCalloutMutation,
  useDeleteLinkMutation,
  useUpdateLinkMutation,
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

export interface LinkDetails {
  id: string;
  uri: string;
  profile: {
    displayName: string;
    description?: string;
  };
  authorization?: {
    myPrivileges: AuthorizationPrivilege[];
  };
}

interface LinkCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutNames: string[];
}

const LinkCollectionCallout = forwardRef<HTMLDivElement, LinkCollectionCalloutProps>(
  (
    { callout, loading, expanded, contributionsCount, onExpand, blockProps, onCalloutUpdate, ...calloutLayoutProps },
    ref
  ) => {
    const { t } = useTranslation();
    const [createLinkOnCallout] = useCreateLinkOnCalloutMutation();
    const [updateLink] = useUpdateLinkMutation();
    const [deleteLink] = useDeleteLinkMutation();

    const [addNewReferenceDialogOpen, setAddNewReferenceDialogOpen] = useState<boolean>(false);
    const [editReference, setEditReference] = useState<EditReferenceFormValues>();
    const [deletingLinkId, setDeletingLinkId] = useState<string>();

    const closeAddNewDialog = () => setAddNewReferenceDialogOpen(false);
    const closeEditDialog = () => setEditReference(undefined);

    const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
    const isContributionAllowed =
      calloutPrivileges.includes(AuthorizationPrivilege.Contribute) &&
      callout.contributionPolicy.state === CalloutState.Open;
    const canAddLinks = isContributionAllowed || calloutPrivileges.includes(AuthorizationPrivilege.Update);
    const canDeleteLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);

    // New Links:
    const getNewLinkId = useCallback(async () => {
      const { data } = await createLinkOnCallout({
        variables: {
          input: {
            calloutID: callout.id,
            link: {
              uri: '',
              profile: {
                // Link names have to be unique, if everything goes well this name will never be shown:
                displayName: t('callout.link-collection.new-temporary-reference', {
                  temp: nanoid(4),
                }),
              },
            },
          },
        },
      });
      if (!data?.createContributionOnCallout.link?.id) {
        throw new Error('Error creating the new Link');
      }
      return data.createContributionOnCallout.link?.id;
    }, [createLinkOnCallout, callout]);

    const removeNewLink = (linkId: string) =>
      deleteLink({
        variables: {
          input: {
            ID: linkId,
          },
        },
        update: (cache, { data }) => data?.deleteLink && evictFromCache(cache, data.deleteLink.id, 'Link'),
      });

    const handleSaveNewLinks = useCallback(
      async (references: CreateReferenceFormValues[]) => {
        await Promise.all(
          references.map(reference =>
            updateLink({
              variables: {
                input: {
                  ID: reference.id,
                  uri: reference.uri,
                  profile: {
                    displayName: reference.name,
                    description: reference.description,
                  },
                },
              },
            })
          )
        );

        onCalloutUpdate?.();
        closeAddNewDialog();
      },
      [updateLink, closeAddNewDialog, onCalloutUpdate, callout]
    );

    // Edit existing Links:
    const handleEditLink = useCallback(
      async (reference: EditReferenceFormValues) => {
        await updateLink({
          variables: {
            input: {
              ID: reference.id,
              uri: reference.uri,
              profile: {
                displayName: reference.name,
                description: reference.description,
              },
            },
          },
        });
        onCalloutUpdate?.();
        closeEditDialog();
      },
      [closeEditDialog, onCalloutUpdate, updateLink, callout]
    );

    const handleDeleteLink = useCallback(async () => {
      if (!deletingLinkId) {
        return;
      }
      await deleteLink({
        variables: {
          input: {
            ID: deletingLinkId,
          },
        },
      });
      onCalloutUpdate?.();
      setDeletingLinkId(undefined);
      closeEditDialog();
    }, [deletingLinkId, closeEditDialog, setDeletingLinkId, onCalloutUpdate, deleteLink, callout]);

    const referencesFromLinks = useMemo(
      () =>
        compact(callout.contributions?.map(contribution => contribution.link)).map(link => ({
          id: link.id,
          uri: link.uri,
          name: link.profile.displayName,
          description: link.profile.description,
          authorization: link.authorization,
        })),
      [callout]
    );
    const limitedLinks = useMemo(() => referencesFromLinks?.slice(0, MAX_LINKS_NORMALVIEW), [callout]);
    const isListTruncated = useMemo(
      () =>
        (compact(callout.contributions?.map(contribution => contribution.link))?.length ?? 0) > MAX_LINKS_NORMALVIEW,
      [callout]
    );

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
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
              references={expanded ? referencesFromLinks : limitedLinks}
              noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
              onEdit={ref => setEditReference(ref)}
            />
            <Box
              display="flex"
              justifyContent={isListTruncated && !expanded ? 'space-between' : 'end'}
              alignItems="end"
            >
              {isListTruncated && !expanded && (
                <Caption component={Link} onClick={onExpand} sx={{ cursor: 'pointer' }}>
                  {t('callout.link-collection.more-links', { count: referencesFromLinks.length })}
                </Caption>
              )}
              {canAddLinks && (
                <IconButton
                  aria-label={t('common.add')}
                  size="small"
                  onClick={() => setAddNewReferenceDialogOpen(true)}
                >
                  <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
                </IconButton>
              )}
            </Box>
            <CreateReferencesDialog
              open={addNewReferenceDialogOpen}
              title={<Box>{t('callout.link-collection.add-link', { title: callout.framing.profile.displayName })}</Box>}
              referenceType="link"
              onClose={closeAddNewDialog}
              onAddMore={getNewLinkId}
              onRemove={removeNewLink}
              onSave={handleSaveNewLinks}
            />
            <EditReferenceDialog
              open={Boolean(editReference)}
              onClose={closeEditDialog}
              title={<Box>{t('callout.link-collection.edit-link', { title: editReference?.name })}</Box>}
              reference={editReference!}
              referenceType="link"
              onSave={values => handleEditLink(values)}
              canDelete={canDeleteLinks}
              onDelete={() => setDeletingLinkId(editReference?.id)}
            />
            <ConfirmationDialog
              actions={{
                onConfirm: handleDeleteLink,
                onCancel: () => setDeletingLinkId(undefined),
              }}
              options={{
                show: Boolean(deletingLinkId),
              }}
              entities={{
                titleId: 'callout.link-collection.delete-confirm-title',
                content: t('callout.link-collection.delete-confirm', { title: callout.framing.profile.displayName }),
                confirmButtonTextId: 'buttons.delete',
              }}
            />
          </CalloutLayout>
        </StorageConfigContextProvider>
      </PageContentBlock>
    );
  }
);

export default LinkCollectionCallout;
