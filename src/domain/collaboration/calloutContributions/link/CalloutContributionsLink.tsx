import { useCallback, useEffect, useState } from 'react';
import { BaseCalloutViewProps } from '../../callout/CalloutViewTypes';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditLinkDialog, { EditLinkFormValues } from '@/domain/shared/components/References/EditLinkDialog';
import CreateLinksDialog, { CreateLinkFormValues } from '@/domain/shared/components/References/CreateLinksDialog';
import { Box, IconButton, Link } from '@mui/material';
import {
  useCreateLinkOnCalloutMutation,
  useDeleteContributionMutation,
  useDeleteLinkMutation,
  useUpdateLinkMutation,
} from '@/core/apollo/generated/apollo-hooks';
import AddIcon from '@mui/icons-material/Add';
import References from '@/domain/shared/components/References/References';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { AuthorizationPrivilege, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { v4 as uuid } from 'uuid';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { compact, sortBy } from 'lodash';
import Loading from '@/core/ui/loading/Loading';
import { gutters } from '@/core/ui/grid/utils';
import Gutters from '@/core/ui/grid/Gutters';
import useCalloutContributions from '../useCalloutContributions/useCalloutContributions';
import useEnsurePresence from '@/core/utils/ensurePresence';

const MAX_LINKS_NORMAL_VIEW = 3;

export interface FormattedLink extends EditLinkFormValues {
  authorization:
    | {
        myPrivileges?: AuthorizationPrivilege[];
      }
    | undefined;
  sortOrder: number;
  contributionId: string;
}

interface CalloutContributionsLinkProps extends BaseCalloutViewProps {}

const CalloutContributionsLink = ({
  callout,
  loading,
  expanded,
  onExpand,
  onCalloutUpdate,
}: CalloutContributionsLinkProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();

  const {
    inViewRef,
    contributions: { items: contributions, hasMore, setFetchAll, total: totalContributions },
    canCreateContribution,
    onCalloutContributionsUpdate: refetchCalloutAndContributions,
  } = useCalloutContributions({
    callout,
    contributionType: CalloutContributionType.Link,
    onCalloutUpdate,
    pageSize: MAX_LINKS_NORMAL_VIEW,
  });

  // Always show all Links in expanded mode:
  useEffect(() => {
    if (expanded && hasMore) {
      setFetchAll(true);
    }
  }, [expanded, hasMore, setFetchAll]);

  const [createLinkOnCallout] = useCreateLinkOnCalloutMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
  });
  const [updateLink] = useUpdateLinkMutation();
  const [deleteLink] = useDeleteLinkMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
  });
  const [deleteContribution] = useDeleteContributionMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
  });

  const [addNewLinkDialogOpen, setAddNewLinkDialogOpen] = useState<boolean>(false);
  const [editLink, setEditLink] = useState<FormattedLink>();
  const [deletingLink, setDeletingLink] = useState<FormattedLink>();

  const closeAddNewDialog = () => setAddNewLinkDialogOpen(false);
  const closeEditDialog = () => setEditLink(undefined);

  const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
  const canDeleteLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);

  // New Links:
  const getNewLinkId = useCallback(async () => {
    const { data } = await createLinkOnCallout({
      variables: {
        calloutId: callout.id,
        link: {
          uri: '',
          profile: {
            // Link names have to be unique, if everything goes well this name will never be shown:
            displayName: t('callout.link-collection.new-temporary-reference', {
              temp: uuid().slice(0, 4),
            }),
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

      refetchCalloutAndContributions();
      closeAddNewDialog();
    },
    [updateLink, closeAddNewDialog, refetchCalloutAndContributions, callout]
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
      refetchCalloutAndContributions();
      closeEditDialog();
    },
    [closeEditDialog, refetchCalloutAndContributions, updateLink, callout]
  );

  const handleDeleteLink = useCallback(async () => {
    const deletingLinkId = ensurePresence(deletingLink?.id);
    const deletingContributionId = deletingLink?.contributionId;

    await deleteLink({
      variables: {
        input: {
          ID: deletingLinkId,
        },
      },
    });
    if (deletingContributionId) {
      await deleteContribution({
        variables: {
          contributionId: deletingContributionId,
        },
      });
    }
    onCalloutUpdate?.();
    setDeletingLink(undefined);
    closeEditDialog();
  }, [deletingLink, closeEditDialog, setDeletingLink, onCalloutUpdate, deleteLink, callout]);

  const formattedLinks: FormattedLink[] = sortBy(
    compact(
      contributions.map(
        contribution =>
          contribution.link &&
          contribution.id && {
            ...contribution.link,
            sortOrder: contribution.sortOrder ?? 0,
            contributionId: contribution.id,
          }
      )
    ).map(link => ({
      id: link.id,
      uri: link.uri,
      name: link.profile?.displayName,
      description: link.profile?.description,
      authorization: link.authorization,
      sortOrder: link.sortOrder ?? 0,
      contributionId: link.contributionId,
    })),
    'sortOrder'
  );

  return (
    <StorageConfigContextProvider
      locationType="callout"
      calloutId={callout.id}
      skip={!addNewLinkDialogOpen && !editLink}
    >
      {loading ? <Loading /> : undefined}
      <Gutters ref={inViewRef}>
        <References
          references={formattedLinks}
          noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
          onEdit={reference => setEditLink(reference)}
        />
        <Box
          display="flex"
          justifyContent={hasMore && !expanded ? 'space-between' : 'end'}
          alignItems="end"
          marginBottom={gutters()}
        >
          {hasMore && !expanded && (
            <Caption component={Link} onClick={() => onExpand?.(callout)} sx={{ cursor: 'pointer' }}>
              {t('callout.link-collection.more-links', { count: totalContributions })}
            </Caption>
          )}
          {canCreateContribution && (
            <IconButton aria-label={t('common.add')} size="small" onClick={() => setAddNewLinkDialogOpen(true)}>
              <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
            </IconButton>
          )}
        </Box>
      </Gutters>

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
        onDelete={() => setDeletingLink(editLink)}
      />
      <ConfirmationDialog
        actions={{
          onConfirm: handleDeleteLink,
          onCancel: () => setDeletingLink(undefined),
        }}
        options={{
          show: Boolean(deletingLink),
        }}
        entities={{
          titleId: 'callout.link-collection.delete-confirm-title',
          content: t('callout.link-collection.delete-confirm', { title: callout.framing.profile.displayName }),
          confirmButtonTextId: 'buttons.delete',
        }}
      />
    </StorageConfigContextProvider>
  );
};

CalloutContributionsLink.displayName = 'CalloutContributionsLink';
export default CalloutContributionsLink;
