import { useMemo } from 'react';
import { Box, styled } from '@mui/material';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardImage from '@/core/ui/card/CardImage';
import { useTranslation } from 'react-i18next';
import { Visual } from '@/domain/common/visual/Visual';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import { Identifiable } from '@/core/utils/Identifiable';
import { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';
import { Caption } from '@/core/ui/typography';
import { formatDate } from '@/core/utils/time/utils';

export interface WhiteboardContribution extends Identifiable {
  whiteboard?: {
    id: string;
    profile: {
      displayName: string;
      visual?: Visual;
      url: string;
    };
    createdDate?: Date | string;
  };
}

interface WhiteboardCardProps extends CalloutContributionCardComponentProps {}

const WHITEBOARD_IMAGE_ASPECT_RATIO = '23/12';

const WhiteboardDefaultImageWrapper = styled(Box)({
  aspectRatio: WHITEBOARD_IMAGE_ASPECT_RATIO,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > svg': {
    fontSize: '3em',
  },
});

const WhiteboardDefaultImage = () => {
  return (
    <WhiteboardDefaultImageWrapper>
      <AutoGraphOutlinedIcon color="primary" fontSize="large" />
    </WhiteboardDefaultImageWrapper>
  );
};

const WhiteboardCard = ({ contribution, columns, callout, selected }: WhiteboardCardProps) => {
  const { t } = useTranslation();
  const whiteboard = contribution?.whiteboard;

  const linkState = useMemo(() => {
    return {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
  }, [callout]);

  return (
    <ContributeCard to={whiteboard?.profile.url} state={linkState} columns={columns}>
      <CardHeader title={whiteboard?.profile.displayName} contrast={selected} author={whiteboard?.createdBy}>
        {whiteboard?.createdDate && (
          <Caption color={selected ? 'white' : 'textPrimary'}>{formatDate(whiteboard?.createdDate)}</Caption>
        )}
      </CardHeader>
      {whiteboard?.profile.visual?.uri ? (
        <CardImage
          aspectRatio={WHITEBOARD_IMAGE_ASPECT_RATIO}
          src={whiteboard?.profile?.visual?.uri}
          alt={t('visuals-alt-text.banner.whiteboard.text', { displayName: whiteboard.profile.displayName })}
        />
      ) : (
        <WhiteboardDefaultImage />
      )}
    </ContributeCard>
  );
};

export default WhiteboardCard;
