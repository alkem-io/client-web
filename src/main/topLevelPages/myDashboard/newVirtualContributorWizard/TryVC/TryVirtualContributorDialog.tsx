import React, { useEffect, useMemo, useState } from 'react';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { Box, Button, DialogContent, Paper } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import {
  CalloutCreationParams,
  CalloutCreationType,
  useCalloutCreation,
} from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import {
  CalloutState,
  CalloutType,
  CalloutVisibility,
  VirtualContributorStatus,
} from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import CalloutView from '@/domain/collaboration/callout/CalloutView/CalloutView';
import {
  useCalloutDetailsQuery,
  useDeleteCalloutMutation,
  useVirtualContributorQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TypedCalloutDetails } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { Actions } from '@/core/ui/actions/Actions';
import { removeVCCreationCache } from './utils';
import { useSubscribeOnVirtualContributorEvents } from '@/domain/community/virtualContributor/useSubscribeOnVirtualContributorEvents';

interface TryVirtualContributorDialogProps {
  spaceId: string;
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  vcId: string;
  open: boolean;
  onClose: () => void;
}

const TryVirtualContributorDialog: React.FC<TryVirtualContributorDialogProps> = ({
  spaceId,
  calloutsSetId,
  vcId,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [demoCalloutCreationLoading, setDemoCalloutCreationLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [calloutId, setCalloutId] = useState<string | undefined>(undefined);

  const options: CalloutCreationParams = {
    calloutsSetId,
  };

  const calloutDetails: CalloutCreationType = {
    framing: {
      profile: {
        displayName: t('createVirtualContributorWizard.trySection.postTitle'),
        description: t('createVirtualContributorWizard.trySection.postDescription'),
        referencesData: [],
      },
    },
    type: CalloutType.Post,
    contributionPolicy: {
      state: CalloutState.Open,
    },
    visibility: CalloutVisibility.Published,
    sendNotification: false,
  };

  const [deleteCallout] = useDeleteCalloutMutation({
    refetchQueries: ['Callouts'],
  });

  const handleClose = () => {
    if (calloutId) {
      deleteCallout({
        variables: { calloutId: calloutId },
      });
    }

    onClose();
  };

  const {
    data: calloutData,
    loading: isCalloutLoading,
    refetch: refetchCalloutData,
    error: calloutError,
  } = useCalloutDetailsQuery({
    variables: {
      calloutId: calloutId!,
      includeClassification: false,
    },
    skip: !calloutId,
  });

  const callout = calloutData?.lookup.callout;

  const typedCalloutDetails = useMemo<TypedCalloutDetails | undefined>(() => {
    if (!callout) {
      return undefined;
    }

    return {
      ...callout,
      groupName: callout.classification?.flowState?.tags[0] || '',
      comments: callout.comments,
      // Fake callout properties to show the callout inside the dialog without any controls
      draft: callout.visibility === CalloutVisibility.Draft,
      editable: false,
      movable: false,
      canSaveAsTemplate: false,
      entitledToSaveAsTemplate: false,
      flowStates: undefined,
      authorization: {
        myPrivileges: [],
      },
    };
  }, [callout]);

  const { handleCreateCallout, canCreateCallout } = useCalloutCreation(options);

  const createCallout = async () => {
    try {
      const callout = await handleCreateCallout(calloutDetails);
      setDemoCalloutCreationLoading(false);
      setCalloutId(callout?.id);
      removeVCCreationCache();
    } catch (e) {
      setHasError(true);
    }
  };

  const {
    data: vcData,
    loading: vcDataLoading,
    error: vcError,
  } = useVirtualContributorQuery({
    variables: {
      id: vcId!, // ensured by skip
    },
    skip: !vcId,
  });

  useSubscribeOnVirtualContributorEvents(vcId);

  useEffect(() => {
    if (
      spaceId &&
      open &&
      canCreateCallout &&
      vcData &&
      vcData.lookup.virtualContributor?.status === VirtualContributorStatus.Ready
    ) {
      createCallout();
    }
  }, [spaceId, open, canCreateCallout, vcData]);

  if (calloutError || hasError || vcError) {
    setDemoCalloutCreationLoading(false);
    removeVCCreationCache();
    return null;
  }

  return (
    <DialogWithGrid open={open} onClose={handleClose} columns={8}>
      <DialogHeader title={t('createVirtualContributorWizard.trySection.title')} onClose={handleClose} />
      <DialogContent>
        {vcDataLoading && demoCalloutCreationLoading && isCalloutLoading ? (
          <Loading />
        ) : (
          <Gutters disablePadding>
            <Box display="flex" gap={gutters(0.5)}>
              <Caption alignSelf="center">
                <Trans
                  i18nKey="createVirtualContributorWizard.trySection.subTitle"
                  values={{ vcName: vcData?.lookup.virtualContributor?.profile.displayName ?? '' }}
                  components={{
                    b: <strong />,
                    br: <br />,
                    i: <em />,
                  }}
                />
              </Caption>
            </Box>
            {!typedCalloutDetails && (
              <Box>
                <Loading />
              </Box>
            )}
            {typedCalloutDetails && (
              <Paper variant="outlined">
                <CalloutView
                  callout={typedCalloutDetails}
                  contributionsCount={typedCalloutDetails.activity}
                  onCalloutUpdate={refetchCalloutData}
                  calloutActions={false}
                  onVisibilityChange={undefined}
                  onCalloutEdit={undefined}
                  onCalloutDelete={undefined}
                />
              </Paper>
            )}
            <Actions justifyContent="end">
              <Button variant="contained" onClick={handleClose}>
                {t('createVirtualContributorWizard.trySection.continueButton')}
              </Button>
            </Actions>
          </Gutters>
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default TryVirtualContributorDialog;
