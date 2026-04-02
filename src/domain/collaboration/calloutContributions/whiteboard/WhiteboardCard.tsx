import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import { Box, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardHeader from '@/core/ui/card/CardHeader';
import CardImage from '@/core/ui/card/CardImage';
import ContributeCard from '@/core/ui/card/ContributeCard';
import { Caption } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';
import { formatDate } from '@/core/utils/time/utils';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import type { Visual } from '@/domain/common/visual/Visual';
import type { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';

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

export const WHITEBOARD_IMAGE_ASPECT_RATIO = '23/12';

const WhiteboardDefaultImageWrapper = styled(Box)({
  aspectRatio: WHITEBOARD_IMAGE_ASPECT_RATIO,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > svg': {
    fontSize: '3em',
  },
});

export const WhiteboardDefaultImage = () => {
  return (
    <WhiteboardDefaultImageWrapper>
      <AutoGraphOutlinedIcon color="primary" fontSize="large" />
    </WhiteboardDefaultImageWrapper>
  );
};

const WhiteboardCard = ({ contribution, columns, callout, onClick, selected }: WhiteboardCardProps) => {
  const { t } = useTranslation();
  const whiteboard = contribution?.whiteboard;

  const linkState = (() => {
    return {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
  })();

  return (
    <ContributeCard to={whiteboard?.profile.url} onClick={onClick} state={linkState} columns={columns}>
      <CardHeader title={whiteboard?.profile.displayName} contrast={selected} author={whiteboard?.createdBy}>
        {whiteboard?.createdDate && <Caption color="textPrimary">{formatDate(whiteboard?.createdDate)}</Caption>}
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
