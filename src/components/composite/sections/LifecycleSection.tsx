import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../models/graphql-schema';
import { LifecycleModal } from '../common/ActivityPanel/StateActivityCardItem';
import DashboardGenericSection from '../common/sections/DashboardGenericSection';

export interface LifecycleSectionProps {
  lifecycle?: Lifecycle;
}

const LifecycleSection: FC<LifecycleSectionProps> = ({ lifecycle }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();
  const state = lifecycle?.state || '';
  return (
    <DashboardGenericSection headerText={t('common.lifecycle')}>
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
    </DashboardGenericSection>
  );
};
export default LifecycleSection;
