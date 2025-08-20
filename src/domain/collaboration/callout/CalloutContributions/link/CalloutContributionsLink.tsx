import { useCallback, useMemo, useState } from 'react';
import { BaseCalloutViewProps } from '../../CalloutViewTypes';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditLinkDialog, { EditLinkFormValues } from '@/domain/shared/components/References/EditLinkDialog';
import CreateLinksDialog, { CreateLinkFormValues } from '@/domain/shared/components/References/CreateLinksDialog';
import { Box, IconButton, Link } from '@mui/material';
import {
  refetchCalloutDetailsQuery,
  useCreateLinkOnCalloutMutation,
  useDeleteLinkMutation,
  useUpdateLinkMutation,
} from '@/core/apollo/generated/apollo-hooks';
import AddIcon from '@mui/icons-material/Add';
import References from '@/domain/shared/components/References/References';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { v4 as uuid } from 'uuid';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { compact, sortBy } from 'lodash';
import { TypedCalloutDetails } from '../../models/TypedCallout';
import Loading from '@/core/ui/loading/Loading';
import { gutters } from '@/core/ui/grid/utils';
import Gutters from '@/core/ui/grid/Gutters';

const MAX_LINKS_NORMAL_VIEW = 3;

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
  sortOrder?: number;
}

export interface FormattedLink {
  id: string;
  uri: string;
  name: string;
  description: string | undefined;
  authorization:
    | {
        myPrivileges?: AuthorizationPrivilege[];
      }
    | undefined;
  sortOrder: number;
  contributionId: string;
}

interface CalloutContributionsLinkProps extends BaseCalloutViewProps {
  callout: TypedCalloutDetails;
  contributions: {
    id: string;
    sortOrder: number;
    link?: {
      id: string;
      uri: string;
      profile: { displayName: string; description?: string };
      authorization?: { myPrivileges?: AuthorizationPrivilege[] };
    };
  }[];
}

const CalloutContributionsLink = ({
  ref,
  callout,
  contributions,
  canCreateContribution,
  loading,
  expanded,
  onExpand,
  onCalloutUpdate,
}: CalloutContributionsLinkProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const { t } = useTranslation();

  const [createLinkOnCallout] = useCreateLinkOnCalloutMutation({
    refetchQueries: [refetchCalloutDetailsQuery({ calloutId: callout.id, withClassification: false })],
  });
  const [updateLink] = useUpdateLinkMutation();
  const [deleteLink] = useDeleteLinkMutation({
    refetchQueries: [refetchCalloutDetailsQuery({ calloutId: callout.id, withClassification: false })],
  });

  const [addNewLinkDialogOpen, setAddNewLinkDialogOpen] = useState<boolean>(false);
  const [editLink, setEditLink] = useState<EditLinkFormValues>();
  const [deletingLinkId, setDeletingLinkId] = useState<string>();

  const closeAddNewDialog = () => setAddNewLinkDialogOpen(false);
  const closeEditDialog = () => setEditLink(undefined);

  const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
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
                temp: uuid().slice(0, 4),
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

  const { formattedLinks, sortedFormattedLinks, limitedLinks, isListTruncated } = useMemo(() => {
    const formattedLinks: FormattedLink[] = compact(
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
    }));

    const sortedFormattedLinks = sortBy(formattedLinks, 'sortOrder');
    const limitedLinks = sortedFormattedLinks?.slice(0, MAX_LINKS_NORMAL_VIEW);
    const isListTruncated =
      (compact(contributions?.map(contribution => contribution.link))?.length ?? 0) > MAX_LINKS_NORMAL_VIEW;

    return {
      formattedLinks,
      sortedFormattedLinks,
      limitedLinks,
      isListTruncated,
    };
  }, [callout, contributions]);

  return (
    <StorageConfigContextProvider
      locationType="callout"
      calloutId={callout.id}
      skip={!addNewLinkDialogOpen && !editLink}
    >
      {loading ? <Loading /> : undefined}
      <Gutters ref={ref}>
        <References
          references={expanded ? sortedFormattedLinks : limitedLinks}
          noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
          onEdit={ref => setEditLink(ref)}
        />
        <Box
          display="flex"
          justifyContent={isListTruncated && !expanded ? 'space-between' : 'end'}
          alignItems="end"
          marginBottom={gutters()}
        >
          {isListTruncated && !expanded && (
            <Caption component={Link} onClick={onExpand} sx={{ cursor: 'pointer' }}>
              {t('callout.link-collection.more-links', { count: formattedLinks.length })}
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
    </StorageConfigContextProvider>
  );
};

CalloutContributionsLink.displayName = 'CalloutContributionsLink';
export default CalloutContributionsLink;
