import React, { useEffect, useState } from 'react';
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
  CalloutFramingType,
  CalloutVisibility,
  VirtualContributorStatus,
} from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import CalloutView from '@/domain/collaboration/callout/CalloutView/CalloutView';
import { useDeleteCalloutMutation, useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import useCalloutDetails from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { Actions } from '@/core/ui/actions/Actions';
import { removeVCCreationCache } from './utils';
import { useSubscribeOnVirtualContributorEvents } from '@/domain/community/virtualContributor/useSubscribeOnVirtualContributorEvents';

interface TryVirtualContributorDialogProps {
  spaceId: string;
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
      type: CalloutFramingType.None,
      profile: {
        displayName: t('createVirtualContributorWizard.trySection.postTitle'),
        description: t('createVirtualContributorWizard.trySection.postDescription'),
        referencesData: [],
      },
    },
    settings: {
      framing: {
        commentsEnabled: true,
      },
      visibility: CalloutVisibility.Published,
    },
  };

  const [deleteCallout] = useDeleteCalloutMutation({
    refetchQueries: ['CalloutsOnCalloutsSetUsingClassification'],
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
    callout,
    loading: calloutLoading,
    refetch,
    error: calloutError,
  } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification: false,
    skip: !calloutId,
    overrideCalloutSettings: {
      canBeSavedAsTemplate: false,
      classificationTagsets: [],
      draft: false,
      editable: true,
      movable: true,
      publishedDate: undefined,
      createdBy: undefined,
    },
  });

  const { handleCreateCallout, canCreateCallout } = useCalloutCreation(options);

  const createCallout = async () => {
    try {
      const callout = await handleCreateCallout(calloutDetails);
      setDemoCalloutCreationLoading(false);
      setCalloutId(callout?.id);
      removeVCCreationCache();
    } catch (_error) {
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
    <DialogWithGrid open={open} onClose={handleClose} columns={8} aria-labelledby="try-virtual-contributor-dialog">
      <DialogHeader
        id="try-virtual-contributor-dialog"
        title={t('createVirtualContributorWizard.trySection.title')}
        onClose={handleClose}
      />
      <DialogContent>
        {vcDataLoading && demoCalloutCreationLoading && calloutLoading ? (
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
            {!callout && (
              <Box>
                <Loading />
              </Box>
            )}
            {callout && (
              <Paper variant="outlined">
                <CalloutView
                  callout={callout}
                  contributionsCount={callout.activity}
                  onCalloutUpdate={refetch}
                  calloutActions={false}
                  onVisibilityChange={undefined}
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
