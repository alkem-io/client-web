import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lifecycle as LifecycleModel } from '../../../../models/graphql-schema';
import { LifecycleModal } from '../../common/ActivityPanel/StateActivityCardItem';

export interface LifecycleProps {
  lifecycle?: LifecycleModel;
}

const LifecycleState: FC<LifecycleProps> = ({ lifecycle }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const state = lifecycle?.state || '';
  const { t } = useTranslation();

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography>State</Typography>
          <Tooltip title={t('pages.activity.lifecycle-info') || ''} arrow placement="top" id="lifecycle-graph">
            <IconButton color="primary" onClick={() => setModalVisible(true)} size="large">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography sx={{ textTransform: 'capitalize' }}>{state}</Typography>
      </Box>
      {lifecycle && (
        <LifecycleModal
          lifecycle={lifecycle}
          show={modalVisible}
          onHide={() => {
            setModalVisible(false);
          }}
        />
      )}
    </>
  );
};

export default LifecycleState;
