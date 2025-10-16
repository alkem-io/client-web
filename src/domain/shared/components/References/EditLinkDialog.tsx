import { FC, ReactNode, useMemo } from 'react';
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
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { LONG_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import { LinkDetails } from '@/domain/collaboration/calloutContributions/link/models/LinkDetails';
import { nameOf } from '@/core/utils/nameOf';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { urlValidator } from '@/core/ui/forms/validator/urlValidator';

const validationSchema = yup.object().shape({
  id: yup.string().required(),
  profile: yup.object().shape({
    displayName: displayNameValidator({ required: true }),
    uri: urlValidator
      .max(MID_TEXT_LENGTH, ({ max }) =>
        TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })
      )
      .required(),
    description: textLengthValidator({ maxLength: LONG_TEXT_LENGTH })
  })
});

interface EditLinkDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  link: LinkDetails;
  onSave: (values: LinkDetails) => Promise<void>;
  canDelete?: boolean;
  onDelete: () => void;
}

const EditLinkDialog: FC<EditLinkDialogProps> = ({ open, onClose, title, link, onSave, canDelete, onDelete }) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();

  const CalloutIcon = contributionIcons[CalloutContributionType.Link];

  const initialValues: LinkDetails = useMemo(() => ({ ...link }), [link]);

  return (
    <Dialog open={open} aria-labelledby="link-edit" fullWidth maxWidth="lg">
      <DialogHeader onClose={onClose}>
        <Box display="flex" alignItems="center">
          <CalloutIcon sx={{ marginRight: theme => theme.spacing(1) }} />
          <BlockTitle>{title}</BlockTitle>
        </Box>
      </DialogHeader>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={() => { }}
        >
          {formikState => {
            const { values, isValid } = formikState;

            return (
              <>
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
                        entityID={values.id}
                        entityType={'link'}
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
                  <Button onClick={onClose}>{t('buttons.cancel')}</Button>
                  <Button variant="contained" onClick={() => onSave(values)} disabled={!isValid}>
                    {t('buttons.save')}
                  </Button>
                </Actions>
              </>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkDialog;
