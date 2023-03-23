import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import { CalloutIcon } from '../../icon/CalloutIcon';
import { DialogContent } from '../../../../../common/components/core/dialog';
import { CalloutType, CalloutVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import { Form, Formik } from 'formik';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { BlockTitle, Text, PageTitle } from '../../../../../core/ui/typography/components';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import FormRow from '../../../../shared/layout/FormLayout/FormRow';
import { FormikSwitch } from '../../../../../common/components/composite/forms/FormikSwitch';
import { gutters } from '../../../../../core/ui/grid/utils';
import Gutters from '../../../../../core/ui/grid/Gutters';

export type CalloutSummaryFields = {
  description: string;
  displayName: string;
  templateId?: string;
  type: CalloutType;
  draft: boolean;
};
export interface CalloutVisibilityChangeDialogProps {
  open: boolean;
  title: string;
  callout: CalloutSummaryFields;
  onClose: () => void;
  onVisibilityChanged: (visibility: CalloutVisibility, sendNotification: boolean) => Promise<void>;
}

type FormValueType = {
  sendNotifications: boolean;
};

const CalloutVisibilityChangeDialog: FC<CalloutVisibilityChangeDialogProps> = ({
  open,
  title,
  callout,
  onClose,
  onVisibilityChanged,
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const handleVisibilityChanged = async (values: FormValueType) => {
    setLoading(true);
    await onVisibilityChanged(
      callout.draft ? CalloutVisibility.Published : CalloutVisibility.Draft,
      values.sendNotifications
    );
    setLoading(false);
  };

  const initialValues: FormValueType = {
    sendNotifications: true,
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
      <Formik initialValues={initialValues} enableReinitialize validateOnMount onSubmit={handleVisibilityChanged}>
        {() => (
          <Form>
            <DialogHeader onClose={onClose}>
              <Box display="flex" alignItems="center">
                <CalloutIcon sx={{ marginRight: theme => theme.spacing(1) }} />
                <PageTitle>{title}</PageTitle>
              </Box>
            </DialogHeader>
            <DialogContent dividers>
              <Gutters paddingTop={0}>
                <Box>
                  <BlockTitle>{t('common.title')}</BlockTitle>
                  <Text>{callout?.displayName}</Text>
                </Box>
                <Box>
                  <BlockTitle>{t('common.description')}</BlockTitle>
                  <WrapperMarkdown>{callout?.description}</WrapperMarkdown>
                </Box>
                <Box>
                  <BlockTitle>{t('components.callout-creation.callout-type-label')}</BlockTitle>
                  <Text>{callout?.type}</Text>
                </Box>
                <FormRow>
                  <BlockTitle>{t('common.notifications')}</BlockTitle>
                  <FormikSwitch name="sendNotifications" title={t('components.callout-publish.notify-members')} />
                </FormRow>
              </Gutters>
            </DialogContent>
            <Actions padding={gutters()} justifyContent="end">
              <Button onClick={onClose} disabled={loading} variant="text">
                {t('buttons.cancel')}
              </Button>
              <LoadingButton type="submit" loading={loading} variant="contained">
                {t(`buttons.${callout?.draft ? '' : 'un'}publish` as const)}
              </LoadingButton>
            </Actions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CalloutVisibilityChangeDialog;
