import React, { FC } from 'react';
import { CalloutType } from '../../../models/graphql-schema';
import Dialog from '@mui/material/Dialog/Dialog';
import Steps from '../../shared/components/Stepper/Steps';
import Step from '../../shared/components/Stepper/step/Step';
import { CalloutStep1, CalloutStep2, CalloutStep3 } from './steps/CalloutStep1';

export type CalloutCreationType = {
  description: string;
  displayName: string;
  type: CalloutType;
}

interface CalloutCreationOutput {}

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (aspect: CalloutCreationOutput) => Promise<{} | undefined>;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
    {/*
      <Holder>
       <Steps>
          <Step component={<InfoStep />} />
          <Step component={<Step2 />} />
          <Step component={<InfoStep3 />} />
          <Step component={<InfoStep4/>} />
        </Steps>
      </>


     */}
     <Steps>
       <Step component={CalloutStep1} title={'callout step 1'} />
       <Step component={CalloutStep2} title={'callout step 2'} />
       <Step component={CalloutStep3} title={'callout step 3'} />
     </Steps>
    </Dialog>
  );
};
export default CalloutCreationDialog;
