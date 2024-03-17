import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { useCallback, useMemo, useState } from 'react';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { Caption, CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditLinkDialog, { EditLinkFormValues } from '../../../shared/components/References/EditLinkDialog';
import CreateLinksDialog, { CreateLinkFormValues } from '../../../shared/components/References/CreateLinksDialog';
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
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

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

const LinkCollectionCallout = ({
  callout,
  loading,
  expanded,
  contributionsCount,
  onExpand,
  onCalloutUpdate,
  ...calloutLayoutProps
}: LinkCollectionCalloutProps) => {
  const { t } = useTranslation();
  const [createLinkOnCallout] = useCreateLinkOnCalloutMutation();
  const [updateLink] = useUpdateLinkMutation();
  const [deleteLink] = useDeleteLinkMutation();

  const [addNewLinkDialogOpen, setAddNewLinkDialogOpen] = useState<boolean>(false);
  const [editLink, setEditLink] = useState<EditLinkFormValues>();
  const [deletingLinkId, setDeletingLinkId] = useState<string>();

  const closeAddNewDialog = () => setAddNewLinkDialogOpen(false);
  const closeEditDialog = () => setEditLink(undefined);

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
    async (links: CreateLinkFormValues[]) => {
      await Promise.all(
        links.map(link =>
          updateLink({
            variables: {
              input: {
                ID: link.id,
                uri: link.uri,
                profile: {
                  displayName: link.name,
                  description: link.description,
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
    async (link: EditLinkFormValues) => {
      await updateLink({
        variables: {
          input: {
            ID: link.id,
            uri: link.uri,
            profile: {
              displayName: link.name,
              description: link.description,
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

  const formatedLinks = useMemo(
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
  const limitedLinks = useMemo(() => formatedLinks?.slice(0, MAX_LINKS_NORMALVIEW), [callout]);
  const isListTruncated = useMemo(
    () => (compact(callout.contributions?.map(contribution => contribution.link))?.length ?? 0) > MAX_LINKS_NORMALVIEW,
    [callout]
  );

  // TODO don't access globals from here, replace JourneyLocation with journeyId in BaseCalloutViewProps
  const { journeyId } = useRouteResolver();

  return (
    <StorageConfigContextProvider
      locationType="callout"
      calloutId={callout.id}
      journeyTypeName={calloutLayoutProps.journeyTypeName}
      journeyId={journeyId}
      skip={!addNewLinkDialogOpen && !editLink}
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
          references={expanded ? formatedLinks : limitedLinks}
          noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
          onEdit={ref => setEditLink(ref)}
        />
        <Box display="flex" justifyContent={isListTruncated && !expanded ? 'space-between' : 'end'} alignItems="end">
          {isListTruncated && !expanded && (
            <Caption component={Link} onClick={onExpand} sx={{ cursor: 'pointer' }}>
              {t('callout.link-collection.more-links', { count: formatedLinks.length })}
            </Caption>
          )}
          {canAddLinks && (
            <IconButton aria-label={t('common.add')} size="small" onClick={() => setAddNewLinkDialogOpen(true)}>
              <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
            </IconButton>
          )}
        </Box>
        <CreateLinksDialog
          open={addNewLinkDialogOpen}
          title={<Box>{t('callout.link-collection.add-link', { title: callout.framing.profile.displayName })}</Box>}
          onClose={closeAddNewDialog}
          onAddMore={getNewLinkId}
          onRemove={removeNewLink}
          onSave={handleSaveNewLinks}
        />
        <EditLinkDialog
          open={Boolean(editLink)}
          onClose={closeEditDialog}
          title={<Box>{t('callout.link-collection.edit-link', { title: editLink?.name })}</Box>}
          link={editLink!}
          onSave={values => handleEditLink(values)}
          canDelete={canDeleteLinks}
          onDelete={() => setDeletingLinkId(editLink?.id)}
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
  );
};

export default LinkCollectionCallout;
