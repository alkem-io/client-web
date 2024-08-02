import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, DialogContent, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { Actions } from '../../../../core/ui/actions/Actions';
// import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { LONG_MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import CancelDialog from './CancelDialog';

type AddContentProps = {
  onClose: () => void;
  onCreateBoK: (subspaceId: string) => Promise<void>;
};

interface FormValueType {
  title: string;
}

const AddContent = ({ onClose }: AddContentProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const validationSchema = yup.object().shape({
    // name: displayNameValidator.concat(uniqueNameValidator),
    // description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH),
  });

  const initialValues: FormValueType = {
    title: t('createVirtualContributorWizard.addContent.post.exampleTitle')
  };

  const handleChange = () => {};

  const onCancel = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <DialogHeader onClose={onCancel}>{t('createVirtualContributorWizard.addContent.title')}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding disableGap>
          <Caption>{t('createVirtualContributorWizard.addContent.description')}</Caption>
          <Caption fontWeight="bold">{t('createVirtualContributorWizard.addContent.descriptionBold')}</Caption>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ isValid }) => (
              <>
                <Gutters paddingX={0}>
                  {/* <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} /> */}
                  <FormikInputField
                    name={'title'}
                    title={t('createVirtualContributorWizard.addContent.post.title')}
                    required
                    // placeholder={t('createVirtualContributorWizard.addContent.postTitlePlaceholder')}
                  />
                  <FormikMarkdownField
                    name="description"
                    title={t('components.post-creation.info-step.description')}
                    placeholder={t('components.post-creation.info-step.description-placeholder')}
                    rows={7}
                    required
                    maxLength={LONG_MARKDOWN_TEXT_LENGTH}
                    hideImageOptions
                  />
                  <Tooltip title={t('createVirtualContributorWizard.addContent.addAnotherPost')} placement={'bottom'}>
                    <Box>
                      <Button
                        aria-label={t('createVirtualContributorWizard.addContent.addAnotherPost')}
                        onClick={() => {
                          // handleAdd(push);
                        }}
                        color="primary"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        // disabled={disabled || adding}
                      >
                        {t('createVirtualContributorWizard.addContent.post.addAnotherPost')}
                      </Button>
                    </Box>
                  </Tooltip>
                  <Actions justifyContent="flex-end">
                    <Button variant="text" onClick={onCancel}>
                      {t('buttons.cancel')}
                    </Button>
                    <LoadingButton
                      variant="contained"
                      disabled={!isValid}
                      // onClick={() => handleContinue(values.subspaceName)}
                    >
                      {t('buttons.continue')}
                    </LoadingButton>
                  </Actions>
                </Gutters>
              </>
            )}
          </Formik>
        </Gutters>
      </DialogContent>
      <CancelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={onClose} />
    </>
  );
};

export default AddContent;
