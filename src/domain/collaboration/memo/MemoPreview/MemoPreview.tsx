import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { gutters } from '@/core/ui/grid/utils';

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
    return (
      <CroppedMarkdown
        backgroundColor="paper"
        maxHeightGutters={10}
        minHeightGutters={10}
        sx={{ cursor: 'pointer' }}
        containerProps={{
          marginX: gutters(1),
          onClick: onClick,
        }}
        // overflowMarker={
        //   <CaptionContainer>
        //     <Caption sx={{ color: theme => theme.palette.primary.main }}>{t('callout.memo.clickToSee')}</Caption>
        //   </CaptionContainer>
        // }
      >
        {memo.markdown}
      </CroppedMarkdown>
    );
  }
};

export default MemoPreview;
