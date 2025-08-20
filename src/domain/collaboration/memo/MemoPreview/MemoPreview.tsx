import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { MemoIcon } from '../icon/MemoIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';

type MemoPreviewProps = {
  displayName?: string;
  memo:
    | {
        profile: {
          preview?: { uri: string };
        };
      }
    | undefined;
  onClick?: MouseEventHandler;
  onClose?: () => void;
};

const MemoPreview = ({ displayName, memo, onClick, onClose, ...props }: MemoPreviewProps) => {
  const { t } = useTranslation();

  return (
    <ImageWithCaption
      caption={onClick ? t('callout.memo.clickToSee') : ''}
      src={memo?.profile.preview?.uri}
      alt={displayName}
      defaultImage={<MemoIcon />}
      onClick={onClick}
      {...props}
    />
  );
};

export default MemoPreview;
