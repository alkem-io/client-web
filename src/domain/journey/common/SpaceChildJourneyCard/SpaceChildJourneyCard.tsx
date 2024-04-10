import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { BlockTitle } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { useSpace } from '../../space/SpaceContext/useSpace';
import JourneyCard, { JourneyCardProps } from '../JourneyCard/JourneyCard';
import InnovationFlowCardSegment from '../JourneyCard/InnovationFlowCardSegment';
import JourneyCardTagline from '../JourneyCard/JourneyCardTagline';
import JourneyCardDescription from '../JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../JourneyCard/JourneyCardSpacing';
import { Box, IconButton } from '@mui/material';

export interface SpaceChildJourneyCardProps extends Omit<JourneyCardProps, 'header' | 'expansion'> {
  displayName: string;
  tagline: string;
  vision: string;
  innovationFlowState?: string;
  parentSegment?: ReactNode;
  openCreateDialog?: (isOpen: boolean) => void;
}

const SpaceChildJourneyCard = ({
  displayName,
  tagline,
  vision,
  innovationFlowState,
  parentSegment,
  openCreateDialog,
  ...props
}: SpaceChildJourneyCardProps) => {
  const { t } = useTranslation();
  const { permissions } = useSpace();

  return (
    <JourneyCard
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      expansion={
        <>
          <JourneyCardDescription>{vision}</JourneyCardDescription>
          {parentSegment ?? <JourneyCardSpacing />}
        </>
      }
      {...props}
    >
      {innovationFlowState && <InnovationFlowCardSegment>{innovationFlowState}</InnovationFlowCardSegment>}
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {permissions.canCreateChallenges && (
          <IconButton
            aria-label={t('common.add')}
            size="small"
            onClick={event => {
              event.stopPropagation();
              openCreateDialog && openCreateDialog(true);
            }}
          >
            <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
          </IconButton>
        )}
      </Box>
    </JourneyCard>
  );
};

export default SpaceChildJourneyCard;
