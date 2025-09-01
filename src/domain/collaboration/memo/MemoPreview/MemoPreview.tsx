import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import { alpha, styled } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';

type MemoPreviewProps = {
  displayName?: string;
  memo:
    | {
        markdown?: string;
      }
    | undefined;
  onClick?: MouseEventHandler;
  onClose?: () => void;
};

const MemoPreview = ({ displayName, memo, onClick }: MemoPreviewProps) => {
  const { t } = useTranslation();
  if (!memo?.markdown) {
    return (
      <ImageWithCaption
        caption={onClick ? t('callout.memo.clickToSee') : ''}
        alt={displayName}
        defaultImage={<MemoIcon />}
        onClick={onClick}
      />
    );
  } else {
    // add quote styling at the start - avoid having double quote blocks
    const quotedMarkdown = memo.markdown.replace(/^(?!>)|^>>/gm, '> ');
    return (
      <Gutters disablePadding onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
        <CroppedMarkdown
          backgroundColor="paper"
          minHeightGutters={3}
          maxHeightGutters={10}
          containerProps={{
            marginX: gutters(1),
          }}
          overflowMarker={
            onClick && (
              <CaptionContainer>
                <Caption sx={{ color: theme => theme.palette.primary.main }}>{t('callout.memo.clickToSee')}</Caption>
              </CaptionContainer>
            )
          }
        >
          {quotedMarkdown}
        </CroppedMarkdown>
      </Gutters>
    );
  }
};

export default MemoPreview;

const CaptionContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: gutters(2)(theme),
  backgroundColor: alpha(theme.palette.common.white, 0.8),
}));
