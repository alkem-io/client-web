import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps, Button, ButtonProps, SxProps } from '@mui/material';
import { styled } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import Centered from '@/core/ui/utils/Centered';
import { Theme } from '@mui/material/styles';
import {
  previewContainerStyles,
  previewButtonStyles,
  chipButtonPositionStyles,
  previewContainerBottomGradientStyles,
} from '../../common/PreviewStyles';

type MemoPreviewProps = {
  displayName?: string;
  memo:
    | {
        markdown?: string;
      }
    | undefined;
  onClick?: MouseEventHandler;
  onClose?: () => void;
  seamless?: boolean;
  sx?: SxProps<Theme>;
};

const Container = styled(Box, {
  shouldForwardProp: prop => prop !== 'seamless',
})<BoxProps & { seamless?: boolean }>(({ theme, onClick, seamless }) =>
  previewContainerStyles(theme, onClick, seamless)
);

const ContentContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'seamless' && prop !== 'withMinHeight',
})<BoxProps & { withMinHeight?: boolean; seamless?: boolean }>(({ theme, withMinHeight, seamless }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  minHeight: withMinHeight ? gutters(16)(theme) : undefined,
  ...previewContainerBottomGradientStyles(theme, !!seamless),
}));

const OpenMemoButton = ({ seamless, ...props }: ButtonProps & { seamless?: boolean }) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="outlined"
      className={seamless ? undefined : 'only-on-hover'}
      sx={theme => previewButtonStyles(theme, seamless)}
      {...props}
    >
      {t('callout.memo.clickToSee')}
    </Button>
  );
};

const MemoChipButton = (props: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      startIcon={<MemoIcon />}
      size="small"
      sx={theme => ({
        ...previewButtonStyles(theme),
        ...chipButtonPositionStyles(theme),
      })}
      aria-label={t('common.Memo')}
      {...props}
    >
      {t('common.Memo')}
    </Button>
  );
};

const MemoPreview = ({ memo, onClick, seamless, sx }: MemoPreviewProps) => {
  // onClick presence distinguishes between response preview (onClick present) and framing preview (onClick absent)
  const isInteractivePreview = Boolean(onClick);

  if (!memo?.markdown) {
    return (
      <Container onClick={onClick} sx={sx}>
        <ContentContainer withMinHeight={isInteractivePreview} seamless={seamless}>
          <Centered>
            <MemoIcon />
          </Centered>
        </ContentContainer>
        {isInteractivePreview && <MemoChipButton />}
        {isInteractivePreview && <OpenMemoButton seamless={seamless} />}
      </Container>
    );
  } else {
    // add quote styling at the start - avoid having double quote blocks
    const quotedMarkdown = memo.markdown.replace(/^(?!>)|^>>/gm, '> ');
    return (
      <Container onClick={onClick} sx={sx} seamless={seamless}>
        <ContentContainer withMinHeight={isInteractivePreview} seamless={seamless}>
          <Gutters disablePadding sx={{ width: '100%' }}>
            <CroppedMarkdown
              backgroundColor="paper"
              minHeightGutters={3}
              maxHeightGutters={16}
              containerProps={
                seamless
                  ? undefined
                  : {
                      marginX: gutters(1),
                      marginTop: gutters(1),
                    }
              }
            >
              {quotedMarkdown}
            </CroppedMarkdown>
          </Gutters>
        </ContentContainer>
        {isInteractivePreview && !seamless && <MemoChipButton />}
        {isInteractivePreview && <OpenMemoButton seamless={seamless} />}
      </Container>
    );
  }
};

export default MemoPreview;
