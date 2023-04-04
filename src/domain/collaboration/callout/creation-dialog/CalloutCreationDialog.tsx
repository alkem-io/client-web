import React, { FC, useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import {
  PostTemplateFragment,
  CalloutState,
  CalloutType,
  WhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutCreationType } from './useCalloutCreation/useCalloutCreation';
import { Box, Button } from '@mui/material';
import { DialogContent } from '../../../../common/components/core/dialog';
import { LoadingButton } from '@mui/lab';
import { CalloutIcon } from '../icon/CalloutIcon';
import CalloutForm, { CalloutFormOutput, WhiteboardTemplateData } from '../CalloutForm';
import { createPostTemplateFromTemplateSet } from '../utils/createPostTemplateFromTemplateSet';
import {
  useHubTemplatesWhiteboardTemplateWithValueLazyQuery,
  useInnovationPackFullWhiteboardTemplateWithValueLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { createWhiteboardTemplateForCalloutCreation } from '../utils/createWhiteboardTemplateForCalloutCreation';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutTypeSelect from './CalloutType/CalloutTypeSelect';
import { Reference } from '../../../common/profile/Profile';

export type CalloutCreationDialogFields = {
  description?: string;
  displayName?: string;
  tags?: string[];
  references?: Reference[];
  type?: CalloutType;
  state?: CalloutState;
  postTemplateType?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
  profileId?: string;
};

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveAsDraft: (callout: CalloutCreationType) => Promise<void>;
  isCreating: boolean;
  calloutNames: string[];
  templates: { postTemplates: PostTemplateFragment[]; whiteboardTemplates: WhiteboardTemplateFragment[] };
}

export interface TemplateProfile {
  description?: string;
  displayName: string;
  tagset?: {
    tags: string[];
  };
  visual?: {
    uri: string;
  };
}

export interface CalloutPostTemplate {
  defaultDescription: string;
  type: string;
  profile: TemplateProfile;
  tags?: string[];
}

export interface CalloutWhiteboardTemplate {
  id?: string;
  value: string;
  profile: TemplateProfile;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({
  open,
  onClose,
  onSaveAsDraft,
  isCreating,
  calloutNames,
  templates,
}) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();
  const [callout, setCallout] = useState<CalloutCreationDialogFields>({});
  const [isValid, setIsValid] = useState(false);
  const [selectedCalloutType, setSelectedCalloutType] = useState<CalloutType | undefined>(undefined);
  //   const [isConfirmPublishDialogOpen, setIsConfirmPublishDialogOpen] = useState(false);

  useLayoutEffect(() => {
    if (!open) return;
    setSelectedCalloutType(undefined);
  }, [open]);

  const [fetchCanvasValueFromHub] = useHubTemplatesWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [fetchCanvasValueFromLibrary] = useInnovationPackFullWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const handleValueChange = useCallback(
    (calloutValues: CalloutFormOutput) => {
      setCallout({ ...callout, ...calloutValues });
    },
    [callout]
  );
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const handleSelectCalloutType = (value: CalloutType | undefined) => {
    setSelectedCalloutType(value);
  };

  //   const handlePublish = () => {
  //     setIsConfirmPublishDialogOpen(true);
  //   };

  const handleSaveCallout = useCallback(async () => {
    const calloutPostTemplate = createPostTemplateFromTemplateSet(callout, templates.postTemplates);

    const getCanvasValueFromHub = async () => {
      if (!callout.whiteboardTemplateData?.id) return undefined;

      const result = await fetchCanvasValueFromHub({
        variables: { hubId: hubNameId!, whiteboardTemplateId: callout.whiteboardTemplateData?.id },
      });

      return result.data?.hub.templates;
    };

    const getCanvasValueFromLibrary = async () => {
      if (!callout.whiteboardTemplateData?.id || !callout.whiteboardTemplateData?.innovationPackId) return undefined;

      const result = await fetchCanvasValueFromLibrary({
        variables: {
          innovationPackId: callout.whiteboardTemplateData?.innovationPackId,
          whiteboardTemplateId: callout.whiteboardTemplateData?.id,
        },
      });

      return result.data?.platform.library.innovationPack?.templates;
    };

    const queryResult =
      callout.whiteboardTemplateData?.origin === 'Hub'
        ? await getCanvasValueFromHub()
        : await getCanvasValueFromLibrary();

    const calloutWhiteboardTemplate = createWhiteboardTemplateForCalloutCreation(queryResult?.whiteboardTemplate);
    const newCallout: CalloutCreationType = {
      profile: {
        displayName: callout.displayName!,
        description: callout.description!,
        referencesData: callout.references!,
      },
      tags: callout.tags,
      type: callout.type!,
      state: callout.state!,
      postTemplate: calloutPostTemplate,
      whiteboardTemplate: calloutWhiteboardTemplate,
    };

    const result = await onSaveAsDraft(newCallout);

    setCallout({});

    return result;
  }, [callout, onSaveAsDraft, templates, hubNameId, fetchCanvasValueFromHub, fetchCanvasValueFromLibrary]);

  const handleClose = useCallback(() => {
    onClose?.();
    setCallout({});
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
      {!selectedCalloutType && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex">{t('components.callout-creation.callout-type.title')}</Box>
          </DialogHeader>
          <DialogContent>
            <Box paddingY={theme => theme.spacing(2)}>
              <CalloutTypeSelect onSelect={handleSelectCalloutType} />
            </Box>
          </DialogContent>
        </>
      )}
      {selectedCalloutType !== undefined && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex">
              <CalloutIcon sx={{ marginRight: 1 }} />
              {t('components.callout-creation.title')}
            </Box>
          </DialogHeader>
          <DialogContent>
            <Box paddingY={theme => theme.spacing(2)}>
              <CalloutForm
                calloutType={selectedCalloutType}
                callout={callout}
                calloutNames={calloutNames}
                onChange={handleValueChange}
                onStatusChanged={handleStatusChange}
                templates={templates}
              />
            </Box>
          </DialogContent>
          <Actions padding={gutters()} justifyContent="end">
            <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
            <LoadingButton
              loading={isCreating}
              loadingIndicator={`${t('buttons.save-draft')}...`}
              onClick={handleSaveCallout}
              variant="contained"
              disabled={!isValid}
            >
              {t('buttons.save-draft')}
            </LoadingButton>
            {/* <Button variant="contained" onClick={handlePublish}>
              {t('buttons.publish')}
            </Button> */}
          </Actions>
        </>
      )}
    </Dialog>
  );
};

export default CalloutCreationDialog;
