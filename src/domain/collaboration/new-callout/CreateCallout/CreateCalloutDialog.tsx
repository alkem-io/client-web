import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel } from '@mui/material';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutState,
  CalloutType,
  CalloutVisibility,
  TemplateType,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import { Identifiable } from '@/core/utils/Identifiable';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CalloutCreationTypeWithPreviewImages, useCalloutCreationWithPreviewImages } from '../../calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
/*import CalloutForm, { CalloutFormOutput } from '../CalloutForm';
import calloutIcons from '../utils/calloutIcons';
*/

// import { WhiteboardFieldSubmittedValuesWithPreviewImages } from './CalloutWhiteboardField/CalloutWhiteboardField';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../../callout/creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { ClassificationTagsetModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import CalloutForm from './CalloutForm';

export type CreateCalloutDialogFields = {
  description?: string;
  displayName?: string;
  tags?: string[];
  references?: ReferenceModel[];
  type?: CalloutType;
  state?: CalloutState;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
  profileId?: string;
  postDescription?: string;
  whiteboardContent?: string;
};

export interface CreateCalloutDialogProps {
  open?: boolean;
  onClose: () => void;

  // Where to save the callout:
  calloutsSetId: string | undefined;
  classificationTagsets?: ClassificationTagsetModel[] | undefined;

  disableRichMedia?: boolean;

  /*
  onCreateCallout: (callout: CalloutCreationTypeWithPreviewImages) => Promise<Identifiable | undefined>;
  loading: boolean;
  */
}

const CreateCalloutDialog = ({
  open = false,
  onClose,
  calloutsSetId,
  classificationTagsets,
  disableRichMedia
  /*
  onCreateCallout,
  loading,
  */
}: CreateCalloutDialogProps) => {
  const { t } = useTranslation();
  const { handleCreateCallout } =
    useCalloutCreationWithPreviewImages({ calloutsSetId });

  const [importCalloutTemplateDialogOpen, setImportCalloutDialogOpen] = useState(false);


  const [isValid, setIsValid] = useState(false);
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  /*
  const [callout, setCallout] = useState<CreateCalloutDialogFields>({});

  const [selectedCalloutType, setSelectedCalloutType] = useState<CalloutType>();
  const [isPublishDialogOpen, setIsConfirmPublishDialogOpen] = useState(false);
  const [isConfirmCloseDialogOpen, setIsConfirmCloseDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
*/

  /*


    const isCalloutDataEntered = (callout: CreateCalloutDialogFields) => {
      return (
        callout.displayName ||
        callout.description ||
        callout.postDescription ||
        callout.references?.length !== 0 ||
        callout.tags?.length !== 0 ||
        callout.whiteboard?.content !== EmptyWhiteboardString ||
        callout.whiteboardContent !== EmptyWhiteboardString
      );
    };

    const openPublishDialog = () => setIsConfirmPublishDialogOpen(true);
    const closePublishDialog = () => setIsConfirmPublishDialogOpen(false);
    const openConfirmCloseDialog = () => {
      if (isCalloutDataEntered(callout)) {
        setIsConfirmCloseDialogOpen(true);
      } else {
        handleClose();
      }
    };
    const closeConfirmCloseDialog = () => setIsConfirmCloseDialogOpen(false);

    */
  /*
   const handleSaveCallout = useCallback(
     async (visibility: CalloutVisibility, sendNotification: boolean) => {
       let result: Identifiable | undefined;
       try {
         const newCallout: CalloutCreationTypeWithPreviewImages = {
           classification: {
             tagsets: flowState ? [{ name: 'flow-state', tags: [flowState] }] : [],
           },
           framing: {
             profile: {
               displayName: callout.displayName!,
               description: callout.description!,
               referencesData: callout.references!.map(ref => ({
                 name: ref.name,
                 uri: ref.uri,
                 description: ref.description,
               })),
             },
             whiteboard: callout.type === CalloutType.Whiteboard && callout.whiteboard ? callout.whiteboard : undefined,
             tags: callout.tags ?? [],
           },
           contributionDefaults: {
             postDescription: callout.type === CalloutType.PostCollection ? callout.postDescription : undefined,
             whiteboardContent:
               callout.type === CalloutType.WhiteboardCollection ? callout.whiteboardContent : undefined,
           },
           type: callout.type!,
           contributionPolicy: {
             state: callout.state!,
           },
           visibility,
           sendNotification: visibility === CalloutVisibility.Published && sendNotification,
         };

         result = await onCreateCallout(newCallout);
         setCallout({});
         scrollToTop();
       } catch (ex) {
         console.error(ex);
       } finally {
         closePublishDialog();
         return result;
       }
     },
     [callout, onCreateCallout]
   );
 */
  /*
    const handleClose = useCallback(() => {
      onClose?.();
      setCallout({});
      closeConfirmCloseDialog();
    }, [onClose]);
  */


  const [fetchTemplateContent] = useTemplateContentLazyQuery();
  const handleSelectTemplate = async ({ id: templateId }: Identifiable) => {
    const { data } = await fetchTemplateContent({
      variables: {
        templateId,
        includeCallout: true,
      },
    });

    const template = data?.lookup.template;
    const templateCallout = template?.callout;

    if (!template || !templateCallout) {
      throw new Error("Couldn't load CalloutTemplate");
    }

    const whiteboard = templateCallout.type === CalloutType.Whiteboard ? templateCallout.framing.whiteboard : undefined;

    const references =
      templateCallout.type === CalloutType.LinkCollection ? undefined : templateCallout.framing.profile.references;
    /*
        setCallout({
          displayName: templateCallout.framing.profile.displayName,
          description: templateCallout.framing.profile.description,
          tags: templateCallout.framing.profile.tagset?.tags,
          references,
          type: templateCallout.type,
          postDescription: templateCallout.contributionDefaults?.postDescription,
          whiteboardContent: templateCallout.contributionDefaults?.whiteboardContent,
          whiteboard: whiteboard && {
            content: whiteboard.content,
            profile: {
              displayName: 'Whiteboard',
              visuals: [
                {
                  name: VisualType.Banner,
                  uri: whiteboard.profile.preview?.uri ?? '',
                },
              ],
            },
            previewImages: [],
          },
        });
        setSelectedCalloutType(templateCallout.type);
        */
    setImportCalloutDialogOpen(false);
  };

  /*
  return (
    <Dialog open={open} maxWidth={selectedCalloutType ? 'md' : undefined} aria-labelledby="callout-creation-title">
      {!selectedCalloutType && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex">{t('components.calloutTypeSelect.title')}</Box>
          </DialogHeader>

          <ImportTemplatesDialog
            open={importCalloutTemplateDialogOpen}
            templateType={TemplateType.Callout}
            onClose={() => setImportCalloutDialogOpen(false)}
            onSelectTemplate={handleSelectTemplate}
            enablePlatformTemplates
            actionButton={
              <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
                {t('buttons.use')}
              </Button>
            }
          />
        </>
      )}
      {selectedCalloutType && (
        <>
          <DialogHeader onClose={openConfirmCloseDialog}>
            <Box display="flex" alignItems="center" gap={1}>
              {CalloutIcon && <CalloutIcon />}
              {t('components.callout-creation.titleWithType', {
                type: t(`components.calloutTypeSelect.label.${selectedCalloutType}` as const),
              })}
            </Box>
          </DialogHeader>

          <DialogContent>
            <CalloutForm
              calloutType={selectedCalloutType}
              callout={callout}
              onChange={handleValueChange}
              onStatusChanged={handleStatusChange}
              temporaryLocation // Always true for callout creation
              disableRichMedia={disableRichMedia}
            />
          </DialogContent>

          <Actions padding={gutters()}>
            <Button onClick={openConfirmCloseDialog}>{t('buttons.cancel')}</Button>
            <FlexSpacer />
            <Button
              loading={loading}
              loadingIndicator={`${t('buttons.save-draft')}...`}
              onClick={() => handleSaveCallout(CalloutVisibility.Draft, sendNotification)}
              variant="outlined"
              disabled={!isValid}
            >
              {t('buttons.save-draft')}
            </Button>
            <Button variant="contained" onClick={openPublishDialog} disabled={!isValid}>
              {t('buttons.publish')}
            </Button>
          </Actions>
          <Dialog open={isPublishDialogOpen} maxWidth="xs">
            <DialogHeader onClose={closePublishDialog}>
              <Box display="flex">{t('buttons.publish')}</Box>
            </DialogHeader>
            <DialogContent>
              <Gutters>
                <Box>
                  <Trans
                    i18nKey="components.callout-creation.publish-dialog.text"
                    values={{
                      calloutDisplayName: callout.displayName,
                    }}
                    components={{
                      b: <strong />,
                    }}
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox checked={sendNotification} onChange={() => setSendNotification(!sendNotification)} />
                  }
                  label={t('components.callout-creation.publish-dialog.checkbox-label')}
                />
              </Gutters>
            </DialogContent>
            <Actions padding={gutters()} justifyContent="end">
              <Button onClick={closePublishDialog}>{t('buttons.cancel')}</Button>
              <Button
                loading={loading}
                loadingIndicator={`${t('buttons.publish')}...`}
                onClick={() => handleSaveCallout(CalloutVisibility.Published, sendNotification)}
                variant="contained"
                disabled={!isValid}
              >
                {t('buttons.publish')}
              </Button>
            </Actions>
          </Dialog>
          <Dialog open={isConfirmCloseDialogOpen}>
            <DialogHeader
              onClose={closeConfirmCloseDialog}
              title={t('components.callout-creation.close-dialog.title')}
            />
            <DialogContent>
              {t('components.callout-creation.close-dialog.text', {
                calloutType: t(`components.calloutTypeSelect.label.${selectedCalloutType}` as const),
              })}
            </DialogContent>
            <Actions padding={gutters()} justifyContent="end">
              <Button variant="contained" onClick={closeConfirmCloseDialog}>
                {t('buttons.cancel')}
              </Button>
              <Button onClick={handleClose}>{t('buttons.yes-close')}</Button>
            </Actions>
          </Dialog>
        </>
      )}
    </Dialog>
  );
  */

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} fullWidth>
        <DialogHeader title={t('callout.create.dialogTitle')} onClose={onClose} actions={
          <Button variant="outlined" onClick={() => setImportCalloutDialogOpen(true)} startIcon={<TipsAndUpdatesOutlinedIcon />}>
            {t('buttons.find-template')}
          </Button>
        }
        />
        <DialogContent>
          <CalloutForm
            onStatusChanged={handleStatusChange}
            disableRichMedia={disableRichMedia}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="text">
            {t('buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              /*const callout = await handleCreateCallout();
              if (callout) {
                onClose();
                scrollToTop();
              }*/
            }}
            disabled={!isValid}
          >
            {t('buttons.post')}
          </Button>
        </DialogActions>
      </DialogWithGrid>
      <ImportTemplatesDialog
        templateType={TemplateType.Callout}
        actionButton={
          <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
            {t('buttons.use')}
          </Button>
        }
        open={importCalloutTemplateDialogOpen}
        onSelectTemplate={handleSelectTemplate}
        onClose={() => setImportCalloutDialogOpen(false)}
        enablePlatformTemplates
      />
    </>
  )
};

export default CreateCalloutDialog;
