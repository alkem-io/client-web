import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { gutters } from '@/core/ui/grid/utils';
import { Box, Button, ButtonProps, SxProps } from '@mui/material';
import { styled } from '@mui/material';
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

const Container = styled(Box)(({ theme, onClick }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: onClick ? '1px solid' : 'none',
  borderColor: theme.palette.divider,
  margin: gutters(1)(theme),
  overflow: 'hidden',
  cursor: onClick ? 'pointer' : 'default',
  borderRadius: theme.shape.borderRadius,
  // Button appearing only on hover:
  '& .only-on-hover': {
    display: 'none',
  },
  '&:hover .only-on-hover': {
    display: 'block',
  },
  [theme.breakpoints.down('sm')]: {
    // But always on small screens:
    '& .only-on-hover': {
      display: 'block',
    },
  },
  // Background overlay on hover
  '&:hover::before': onClick
    ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        boxShadow: '0 0 3px rgba(0, 0, 0, 0.8)', // fill some gaps around the edges
        zIndex: 1,
      }
    : undefined,
}));

const ContentContainer = styled(Box)<{ withMinHeight?: boolean }>(({ theme, withMinHeight }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  minHeight: withMinHeight ? gutters(16)(theme) : undefined,
}));

// Common styles for the buttons shown in the preview
const buttonsInPreview = (theme: Theme) => ({
  position: 'absolute',
  borderColor: theme.palette.divider,
  borderRadius: `${theme.shape.borderRadiusSquare}px`,
  zIndex: 2,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
});

const OpenMemoButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button variant="outlined" className="only-on-hover" sx={theme => buttonsInPreview(theme)} {...props}>
      {t('callout.memo.clickToSee')}
    </Button>
  );
};

const MemoChipButton = ({ disableClick, ...props }: ButtonProps & { disableClick?: boolean }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      startIcon={<MemoIcon />}
      size="small"
      sx={theme => ({
        ...buttonsInPreview(theme),
        top: gutters(1)(theme),
        right: gutters(1)(theme),
        textTransform: 'none',
        pointerEvents: disableClick ? 'none' : 'auto',
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      })}
      aria-label={t('common.Memo')}
      {...props}
    >
      {t('common.Memo')}
    </Button>
  );
};

const MemoPreview = ({ memo, onClick, sx }: MemoPreviewProps) => {
  // onClick presence distinguishes between response preview (onClick present) and framing preview (onClick absent)
  const isInteractivePreview = Boolean(onClick);

  if (!memo?.markdown) {
    return (
      <Container onClick={onClick} sx={sx}>
        <ContentContainer withMinHeight={isInteractivePreview}>
          <Centered>
            <MemoIcon />
          </Centered>
        </ContentContainer>
        {isInteractivePreview && <MemoChipButton />}
        {isInteractivePreview && <OpenMemoButton />}
      </Container>
    );
  } else {
    // add quote styling at the start - avoid having double quote blocks
    const quotedMarkdown = memo.markdown.replace(/^(?!>)|^>>/gm, '> ');
    return (
      <Container onClick={onClick} sx={sx}>
        <ContentContainer withMinHeight={isInteractivePreview}>
          <Gutters disablePadding sx={{ width: '100%' }}>
            <CroppedMarkdown
              backgroundColor="paper"
              minHeightGutters={3}
              maxHeightGutters={10}
              containerProps={{
                marginX: gutters(1),
                marginTop: gutters(1),
              }}
            >
              {quotedMarkdown}
            </CroppedMarkdown>
          </Gutters>
        </ContentContainer>
        {isInteractivePreview && <MemoChipButton />}
        {isInteractivePreview && <OpenMemoButton />}
      </Container>
    );
  }
};

export default MemoPreview;
