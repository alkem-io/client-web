import { ReactNode, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { useScreenSize } from '@/core/ui/grid/constants';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { Formik } from 'formik';
import * as yup from 'yup';
import { BlockTitle } from '@/core/ui/typography';
import { contributionIcons } from '@/domain/collaboration/callout/icons/calloutIcons';
import { Actions } from '@/core/ui/actions/Actions';
import { gutters } from '@/core/ui/grid/utils';
import FormikFileInput from '@/core/ui/forms/FormikFileInput/FormikFileInput';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import { LinkDetails } from '@/domain/collaboration/calloutContributions/link/models/LinkDetails';
import { nameOf } from '@/core/utils/nameOf';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { urlValidator } from '@/core/ui/forms/validator/urlValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import useLoadingState from '../../utils/useLoadingState';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import useDeleteDocument, { extractDocumentIdFromUri } from './useDeleteDocument';

const validationSchema = yup.object().shape({
  id: yup.string().required(),
  uri: urlValidator({ required: true }),
  profile: yup.object().shape({
    displayName: displayNameValidator({ required: true }),
    description: textLengthValidator({ maxLength: LONG_TEXT_LENGTH }),
  }),
});

const hasFormChanges = (current: LinkDetails, initial: LinkDetails): boolean => {
  return (
    current.uri !== initial.uri ||
    current.profile.displayName !== initial.profile.displayName ||
    current.profile.description !== initial.profile.description
  );
};

interface EditLinkDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  link: LinkDetails;
  onSave: (values: LinkDetails) => Promise<void>;
  canDelete?: boolean;
  onDelete: () => void;
}

const EditLinkDialog = ({ open, onClose, title, link, onSave, canDelete, onDelete }: EditLinkDialogProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();

  const CalloutIcon = contributionIcons[CalloutContributionType.Link];
  const [isCanceling, setCanceling] = useState(false);

  const initialValues: LinkDetails = useMemo(() => ({ ...link }), [link]);

  // Delete uploaded documents when cancelling with a new uploaded file
  const { deleteDocument } = useDeleteDocument();

  const [handleSave, isSaving] = useLoadingState((values: LinkDetails) => onSave(values));

  return (
    <>
      <Dialog open={open} aria-labelledby="link-edit" fullWidth maxWidth="lg">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={() => {}}
        >
          {formikState => {
            const { values, isValid } = formikState;

            const handleOnClose = () => {
              if (hasFormChanges(values, initialValues)) {
                setCanceling(true);
              } else {
                onClose();
              }
            };

            const handleConfirmCancelling = async () => {
              // If a new file was uploaded (URI changed and is a storage URL), delete it
              if (values.uri !== initialValues.uri && extractDocumentIdFromUri(values.uri)) {
                await deleteDocument(values.uri);
              }
              setCanceling(false);
              onClose();
            };

            return (
              <>
                <DialogHeader onClose={handleOnClose}>
                  <Box display="flex" alignItems="center">
                    <CalloutIcon sx={{ marginRight: theme => theme.spacing(1) }} />
                    <BlockTitle>{title}</BlockTitle>
                  </Box>
                </DialogHeader>
                <DialogContent>
                  <Gutters>
                    <Gutters row={!isMediumSmallScreen} disablePadding alignItems="start">
                      <FormikInputField
                        name={nameOf<LinkDetails>('profile.displayName')}
                        title={t('common.title')}
                        fullWidth={isMediumSmallScreen}
                      />
                      <Box flexGrow={1} width={isMediumSmallScreen ? '100%' : undefined}>
                        <FormikFileInput
                          name={nameOf<LinkDetails>('uri')}
                          title={t('common.url')}
                          sx={{ flexGrow: 1 }}
                          temporaryLocation
                        />
                      </Box>
                    </Gutters>
                    <Gutters disablePadding>
                      <FormikInputField
                        name={nameOf<LinkDetails>('profile.description')}
                        title={t('common.description')}
                        multiline
                        rows={3}
                      />
                    </Gutters>
                  </Gutters>
                  <Actions paddingX={gutters()}>
                    {canDelete && <DeleteButton onClick={onDelete} />}
                    <Button onClick={handleOnClose}>{t('buttons.cancel')}</Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSave(values)}
                      loading={isSaving}
                      disabled={!isValid}
                    >
                      {t('buttons.save')}
                    </Button>
                  </Actions>
                </DialogContent>
                <ConfirmationDialog
                  actions={{
                    onConfirm: handleConfirmCancelling,
                    onCancel: () => setCanceling(false),
                  }}
                  options={{
                    show: isCanceling,
                  }}
                  entities={{
                    titleId: 'callout.link-collection.cancel-confirm-title',
                    contentId: 'callout.link-collection.cancel-confirm',
                    confirmButtonTextId: 'buttons.yesClose',
                  }}
                />
              </>
            );
          }}
        </Formik>
      </Dialog>
    </>
  );
};

export default EditLinkDialog;
