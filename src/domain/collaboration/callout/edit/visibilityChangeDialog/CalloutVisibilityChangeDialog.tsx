import { CalloutType, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import FormRow from '@/core/ui/forms/FormRow';
import { FormikSwitch } from '@/core/ui/forms/FormikSwitch';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle, Text } from '@/core/ui/typography/components';
import { LoadingButton } from '@mui/lab';
import { Box, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CalloutSummaryFields = {
  framing: {
    profile: {
      description?: string;
      displayName: string;
    };
  };
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

const CalloutVisibilityChangeDialog = ({
  open,
  title,
  callout,
  onClose,
  onVisibilityChanged,
}: PropsWithChildren<CalloutVisibilityChangeDialogProps>) => {
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
        {({ handleSubmit }) => (
          <>
            <DialogHeader title={title} onClose={onClose} />
            <DialogContent>
              <Gutters disablePadding>
                <Box>
                  <BlockTitle>{t('common.title')}</BlockTitle>
                  <Text>{callout?.framing.profile.displayName}</Text>
                </Box>
                <Box>
                  <BlockTitle>{t('common.description')}</BlockTitle>
                  <WrapperMarkdown>{callout?.framing.profile.description ?? ''}</WrapperMarkdown>
                </Box>
                {callout?.draft && (
                  <FormRow>
                    <BlockTitle>{t('common.notifications')}</BlockTitle>
                    <FormikSwitch name="sendNotifications" title={t('components.callout-publish.notify-members')} />
                  </FormRow>
                )}
              </Gutters>
            </DialogContent>
            <Actions padding={gutters()} justifyContent="end">
              <Button onClick={onClose} disabled={loading} variant="text">
                {t('buttons.cancel')}
              </Button>
              <LoadingButton type="submit" loading={loading} variant="contained" onClick={() => handleSubmit()}>
                {t(`buttons.${callout?.draft ? '' : 'un'}publish` as const)}
              </LoadingButton>
            </Actions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default CalloutVisibilityChangeDialog;
