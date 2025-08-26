import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import { alpha, styled } from '@mui/material';
import { Caption } from '@/core/ui/typography';

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
      <Box onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
        <CroppedMarkdown
          backgroundColor="paper"
          maxHeightGutters={10}
          minHeightGutters={10}
          sx={{ cursor: 'pointer' }}
          containerProps={{
            marginX: gutters(1),
          }}
          overflowMarker={
            <CaptionContainer>
              <Caption sx={{ color: theme => theme.palette.primary.main }}>{t('callout.memo.clickToSee')}</Caption>
            </CaptionContainer>
          }
        >
          {quotedMarkdown}
        </CroppedMarkdown>
      </Box>
    );
  }
};

export default MemoPreview;

const CaptionContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: gutters(2)(theme),
  backgroundColor: alpha(theme.palette.common.white, 0.8),
}));
