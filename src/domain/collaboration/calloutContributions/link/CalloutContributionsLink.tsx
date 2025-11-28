import { useEffect, useState } from 'react';
import { BaseCalloutViewProps } from '../../callout/CalloutViewTypes';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditLinkDialog from '@/domain/shared/components/References/EditLinkDialog';
import CreateLinksDialog, { CreateLinkFormValues } from '@/domain/shared/components/References/CreateLinksDialog';
import { Box, IconButton, Link } from '@mui/material';
import {
  useCreateLinkOnCalloutMutation,
  useDeleteContributionMutation,
  useDeleteLinkMutation,
  useUpdateLinkMutation,
} from '@/core/apollo/generated/apollo-hooks';
import AddIcon from '@mui/icons-material/Add';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { AuthorizationPrivilege, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { gutters } from '@/core/ui/grid/utils';
import Gutters from '@/core/ui/grid/Gutters';
import useCalloutContributions from '../useCalloutContributions/useCalloutContributions';
import useEnsurePresence from '@/core/utils/ensurePresence';
import LinkContributionsList from './LinksList';
import { LinkContribution } from './models/LinkContribution';
import { LinkDetails } from './models/LinkDetails';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

const MAX_LINKS_COMPACT_VIEW = 8;

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
    pageSize: MAX_LINKS_COMPACT_VIEW,
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
  const [editLink, setEditLink] = useState<LinkContribution>();
  const [deletingLink, setDeletingLink] = useState<LinkContribution>();

  const closeAddNewDialog = () => setAddNewLinkDialogOpen(false);
  const closeEditDialog = () => setEditLink(undefined);

  const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
  const canDeleteLinks = calloutPrivileges.includes(AuthorizationPrivilege.Update);

  const handleSaveNewLinks = async (links: CreateLinkFormValues[]) => {
    await Promise.all(
      links.map(link =>
        createLinkOnCallout({
          variables: {
            calloutId: callout.id,
            link: {
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
  };

  // Edit existing Links:
  const handleEditLink = async (link: LinkDetails) => {
    const linkId = ensurePresence(link?.id);
    await updateLink({
      variables: {
        input: {
          ID: linkId,
          uri: link.uri,
          profile: {
            displayName: link.profile.displayName,
            description: link.profile.description,
          },
        },
      },
    });
    refetchCalloutAndContributions();
    closeEditDialog();
  };

  const [handleDeleteLink, isDeletingLink] = useLoadingState(async () => {
    const deletingLinkId = ensurePresence(deletingLink?.link?.id);
    const deletingContributionId = deletingLink?.id;

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
  });

  return (
    <StorageConfigContextProvider
      locationType="callout"
      calloutId={callout.id}
      skip={!addNewLinkDialogOpen && !editLink}
    >
      <Gutters ref={inViewRef}>
        <LinkContributionsList
          contributions={contributions}
          onEditContribution={contribution => setEditLink(contribution)}
          loading={loading}
          expanded={expanded}
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
        onSave={handleSaveNewLinks}
        calloutId={callout.id}
      />
      <EditLinkDialog
        open={Boolean(editLink)}
        onClose={closeEditDialog}
        title={<Box>{t('callout.link-collection.edit-link', { title: editLink?.link?.profile.displayName })}</Box>}
        link={editLink?.link!}
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
        state={{
          isLoading: isDeletingLink,
        }}
      />
    </StorageConfigContextProvider>
  );
};

CalloutContributionsLink.displayName = 'CalloutContributionsLink';
export default CalloutContributionsLink;
