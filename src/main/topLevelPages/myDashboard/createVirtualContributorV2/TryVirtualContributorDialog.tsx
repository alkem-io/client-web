import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Box, DialogContent, Paper, Tooltip } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { gutters } from '../../../../core/ui/grid/utils';
import {
  CalloutCreationParams,
  CalloutCreationType,
  useCalloutCreation,
} from '../../../../domain/collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreation';
import {
  CalloutGroupName,
  CalloutState,
  CalloutType,
  CalloutVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import Loading from '../../../../core/ui/loading/Loading';
import CalloutView from '../../../../domain/collaboration/callout/CalloutView/CalloutView';
import { useCalloutPageCalloutQuery, useDeleteCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { TypedCalloutDetails } from '../../../../domain/collaboration/callout/useCallouts/useCallouts';

interface TryVirtualContributorDialogProps {
  spaceId: string;
  open: boolean;
  onClose: () => void;
}

const TryVirtualContributorDialog: React.FC<TryVirtualContributorDialogProps> = ({ spaceId, open, onClose }) => {
  const { t } = useTranslation();
  const [postCreationLoading, setPostCreationLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [calloutId, setCalloutId] = useState<string | undefined>(undefined);

  const options: CalloutCreationParams = {
    journeyId: spaceId,
  };

  const calloutDetails: CalloutCreationType = {
    framing: {
      profile: {
        displayName: t('createVirtualContributorV2.trySection.postTitle'),
        description: t('createVirtualContributorV2.trySection.postDescription'),
        referencesData: [],
      },
    },
    type: CalloutType.Post,
    contributionPolicy: {
      state: CalloutState.Open,
    },
    groupName: CalloutGroupName.Home,
    visibility: CalloutVisibility.Published,
    sendNotification: false,
  };

  const [deleteCallout] = useDeleteCalloutMutation({
    refetchQueries: ['Callouts'],
  });

  const handleClose = useCallback(() => {
    if (calloutId) {
      deleteCallout({
        variables: { calloutId: calloutId },
      });
    }

    onClose();
  }, [onClose]);

  const {
    data: calloutData,
    loading: isCalloutLoading,
    refetch: refetchCalloutData,
    error: calloutError,
  } = useCalloutPageCalloutQuery({
    variables: {
      calloutId: calloutId!,
    },
    skip: !calloutId,
  });

  const callout = calloutData?.lookup.callout;

  const typedCalloutDetails = useMemo(() => {
    if (!callout) {
      return undefined;
    }

    const draft = callout?.visibility === CalloutVisibility.Draft;
    const editable = false;

    return {
      ...callout,
      draft,
      editable,
      comments: callout?.comments ? { ...callout?.comments, calloutNameId: callout?.nameID } : undefined,
      // TODO: Try to remove this `as unknown`
    } as unknown as TypedCalloutDetails;
  }, [callout]);

  const createCalloutHook = useCalloutCreation(options);

  useEffect(() => {
    const createCallout = async () => {
      try {
        const callout = await createCalloutHook.handleCreateCallout(calloutDetails);
        setPostCreationLoading(false);
        setCalloutId(callout?.id);
      } catch (e) {
        setHasError(true);
      }
    };

    spaceId && open && createCallout();
  }, [spaceId, open]);

  if (calloutError || hasError) {
    return null;
  }

  return (
    <DialogWithGrid open={open} onClose={handleClose} columns={8}>
      <DialogHeader title={t('createVirtualContributorV2.trySection.title')} onClose={handleClose} />
      <DialogContent>
        {postCreationLoading && isCalloutLoading ? (
          <Loading />
        ) : (
          <Gutters disablePadding>
            <Box display="flex" gap={gutters(0.5)}>
              <Caption alignSelf="center">
                <Trans
                  i18nKey="createVirtualContributorV2.trySection.subTitle"
                  components={{
                    b: <strong />,
                    icon: <InfoOutlinedIcon fontSize="small" color="primary" style={{ verticalAlign: 'bottom' }} />,
                    tooltip: (
                      <Tooltip title={t('createVirtualContributorV2.trySection.subTitleInfo')} arrow placement="top">
                        <></>
                      </Tooltip>
                    ),
                  }}
                />
              </Caption>
            </Box>
            {!typedCalloutDetails && (
              <Box>
                <Loading />
              </Box>
            )}
            <Paper variant="outlined">
              {typedCalloutDetails && (
                <CalloutView
                  callout={typedCalloutDetails}
                  journeyTypeName="space"
                  calloutNames={[]}
                  contributionsCount={typedCalloutDetails.activity}
                  onCalloutUpdate={refetchCalloutData}
                  calloutActions={false}
                  onVisibilityChange={undefined}
                  onCalloutEdit={undefined}
                  onCalloutDelete={undefined}
                />
              )}
            </Paper>
            <Box display="flex" gap={gutters(0.5)}>
              <InfoOutlinedIcon color="primary" fontSize="small" />
              <Caption alignSelf="center">
                <Trans
                  i18nKey="createVirtualContributorV2.trySection.lastInfoBox"
                  components={{
                    b: <strong />,
                  }}
                />
              </Caption>
            </Box>
          </Gutters>
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default TryVirtualContributorDialog;
