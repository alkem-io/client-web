import { Button, Tooltip } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../../../../core/apollo/generated/graphql-schema';
import { LifecycleModal } from './LifecycleModal';
import { ReactComponent as LifecycleStateIcon } from './InnovationFlowIcon.svg';
import RootThemeProvider from '../../../../../../core/ui/themes/RootThemeProvider';

export interface InnovationFlowProps {
  lifecycle?: Pick<Lifecycle, 'machineDef' | 'state'>;
}

const InnovationFlow: FC<InnovationFlowProps> = ({ lifecycle }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const state = lifecycle?.state || '';
  const { t } = useTranslation();

  return (
    <>
      <Tooltip title={t('pages.activity.innovation-flow-info') || ''} arrow placement="top" id="lifecycle-graph">
        <Button onClick={() => setIsModalVisible(true)} variant={'outlined'} startIcon={<LifecycleStateIcon />}>
          {`State: ${state}`}
        </Button>
      </Tooltip>
      {lifecycle && (
        <RootThemeProvider>
          <LifecycleModal
            lifecycle={lifecycle}
            show={isModalVisible}
            onHide={() => {
              setIsModalVisible(false);
            }}
          />
        </RootThemeProvider>
      )}
    </>
  );
};

export default InnovationFlow;
