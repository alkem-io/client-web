import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useState } from 'react';
import { ReferencesFragmentWithCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import EditReferenceDialog, {
  EditReferenceFormValues,
} from '../../../shared/components/References/EditReferenceDialog';
import CreateReferencesDialog, {
  ReferenceFormValues,
} from '../../../shared/components/References/CreateReferencesDialog';
import { Box, IconButton } from '@mui/material';
import {
  useCreateReferenceOnProfileMutation,
  useUpdateCalloutMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AddIcon from '@mui/icons-material/Add';
import References from '../../../shared/components/References/References';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';

type NeededFields = 'id' | 'calloutNameId';
export type LinkCollectionCalloutData = Pick<ReferencesFragmentWithCallout, NeededFields>;

interface LinkCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutNames: string[];
}

const LinkCollectionCallout = forwardRef<HTMLDivElement, LinkCollectionCalloutProps>(
  ({ callout, loading, expanded, contributionsCount, onExpand, blockProps, ...calloutLayoutProps }, ref) => {
    const { t } = useTranslation();
    const [createReference] = useCreateReferenceOnProfileMutation();
    const [updateReferences] = useUpdateCalloutMutation();

    const [addLinkDialogOpen, setAddLinkDialogOpen] = useState<boolean>(false);
    const [editReference, setEditReference] = useState<EditReferenceFormValues['reference']>();
    //  const { user: userMetadata, isAuthenticated } = useUserContext();
    //  const user = userMetadata?.user;
    const canAddLink = true; //!!
    const canEditLinks = true; //!!

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
          });
        }
        setAddLinkDialogOpen(false);
      },
      [createReference, callout]
    );

    const handleEditLink = useCallback(
      async ({ reference: editedReference }: EditReferenceFormValues) => {
        // Map references to the UpdateReferenceInput and Replace the reference that has been edited:
        const nextReferences = callout.profile.references?.map(reference =>
          reference.id === editedReference.id
            ? {
                ID: editedReference.id,
                name: editedReference.name,
                description: editedReference.description,
                uri: editedReference.uri,
              }
            : {
                ID: reference.id,
                name: reference.name,
                description: reference.description,
                uri: reference.uri,
              }
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
        });

        setEditReference(undefined);
      },
      [createReference, callout]
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
            references={callout.profile.references}
            noItemsView={<CaptionSmall>{t('callout.link-collection.no-links-yet')}</CaptionSmall>}
            canEdit={canEditLinks}
            onEdit={ref => setEditReference(ref)}
          />
          {canAddLink && (
            <Box display="flex" justifyContent="end">
              <IconButton aria-label="Add" size="small" onClick={() => setAddLinkDialogOpen(true)}>
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
            </Box>
          )}
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
          />
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default LinkCollectionCallout;
