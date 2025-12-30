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
import { previewContainerStyles, previewButtonStyles, chipButtonPositionStyles } from '../../common/PreviewStyles';

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

const Container = styled(Box)(({ theme, onClick }) => previewContainerStyles(theme, onClick));

const ContentContainer = styled(Box)<{ withMinHeight?: boolean }>(({ theme, withMinHeight }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  minHeight: withMinHeight ? gutters(16)(theme) : undefined,
}));

const OpenMemoButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button variant="outlined" className="only-on-hover" sx={theme => previewButtonStyles(theme)} {...props}>
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
              maxHeightGutters={16}
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
