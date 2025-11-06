import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { gutters } from '@/core/ui/grid/utils';
import { Box, ButtonBase, SxProps } from '@mui/material';
import { alpha, styled } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import Centered from '@/core/ui/utils/Centered';
import { Theme } from '@mui/material/styles';

type MemoPreviewProps = {
  displayName?: string;
  memo:
    | {
        markdown?: string;
      }
    | undefined;
  onClick?: MouseEventHandler;
  onClose?: () => void;
  sx?: SxProps<Theme>;
};

const Container = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: gutters(13)(theme),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  width: '100%',
}));

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

const MemoPreview = ({ memo, onClick, sx }: MemoPreviewProps) => {
  const { t } = useTranslation();
  if (!memo?.markdown) {
    return (
      <Container onClick={onClick} sx={{ cursor: 'pointer', ...sx }}>
        <Centered>
          <MemoIcon />
        </Centered>
        <CaptionContainer>
          <Caption sx={{ color: theme => theme.palette.primary.main }}>{t('callout.memo.clickToSee')}</Caption>
        </CaptionContainer>
      </Container>
    );
  } else {
    // add quote styling at the start - avoid having double quote blocks
    const quotedMarkdown = memo.markdown.replace(/^(?!>)|^>>/gm, '> ');
    return (
      <Gutters disablePadding onClick={onClick} sx={{ cursor: 'pointer', position: 'relative', ...sx }}>
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
