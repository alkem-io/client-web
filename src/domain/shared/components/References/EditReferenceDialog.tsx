import { FC, ReactNode, useMemo } from 'react';
import { CalloutType, Reference } from '../../../../core/apollo/generated/graphql-schema';
import { Box, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Formik } from 'formik';
import * as yup from 'yup';
import { BlockSectionTitle, BlockTitle } from '../../../../core/ui/typography';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import FormikFileInput from '../../../../core/ui/forms/FormikFileInput/FormikFileInput';
import { ReferenceType } from '../../../../core/ui/upload/FileUpload/FileUpload';

export interface EditReferenceFormValues extends Pick<Reference, 'id' | 'name' | 'uri' | 'description'> {}

const validationSchema = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required(),
  description: yup.string(),
  uri: yup.string().required(),
});

interface EditReferenceDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  reference: EditReferenceFormValues;
  referenceType?: ReferenceType;
  onSave: (values: EditReferenceFormValues) => Promise<void>;
  canDelete?: boolean;
  onDelete: () => void;
}

const EditReferenceDialog: FC<EditReferenceDialogProps> = ({
  open,
  onClose,
  title,
  reference,
  referenceType,
  onSave,
  canDelete,
  onDelete,
}) => {
  const { t } = useTranslation();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const CalloutIcon = calloutIcons[CalloutType.LinkCollection];

  const initialValues: EditReferenceFormValues = useMemo(() => ({ ...reference }), [reference]);

  return (
    <Dialog open={open} aria-labelledby="reference-edit" fullWidth maxWidth="lg">
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
          onSubmit={() => {}}
        >
          {formikState => {
            const { values } = formikState;

            return (
              <>
                <Gutters>
                  <Gutters row={!isMobile} disablePadding alignItems="start">
                    <FormikInputField name={'name'} title={t('common.title')} fullWidth={isMobile} />
                    <Box flexGrow={1} width={isMobile ? '100%' : undefined}>
                      <FormikFileInput
                        name={'uri'}
                        title={t('common.url')}
                        sx={{ flexGrow: 1 }}
                        referenceID={values.id}
                        referenceType={referenceType}
                      />
                    </Box>
                  </Gutters>
                  <Box>
                    <FormikInputField name={'description'} title={'Description'} />
                  </Box>
                </Gutters>
                {canDelete && (
                  <Box display="flex" justifyContent="start" padding={gutters()}>
                    <BlockSectionTitle>
                      <IconButton onClick={onDelete} color="error" aria-label={t('buttons.delete')}>
                        <DeleteIcon />
                      </IconButton>
                      {t('callout.link-collection.delete-link')}
                    </BlockSectionTitle>
                  </Box>
                )}
                <Actions paddingX={gutters()} justifyContent="space-between">
                  <Button onClick={onClose}>{t('buttons.cancel')}</Button>
                  <Button variant="contained" onClick={() => onSave(values)}>
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

export default EditReferenceDialog;
