import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { Visual } from '@/domain/common/visual/Visual';
import { MouseEventHandler } from 'react';

type Whiteboard = {
  profile: {
    preview?: Visual;
  };
};

type WhiteboardPreviewProps = {
  displayName?: string;
  whiteboard: Whiteboard | undefined;
  onClick?: MouseEventHandler;
  onClose?: () => void;
};

const WhiteboardPreview = ({ displayName, whiteboard, onClick, onClose, ...props }: WhiteboardPreviewProps) => {
  const { t } = useTranslation();

  return (
    <ImageWithCaption
      caption={onClick ? t('callout.singleWhiteboard.clickToSee') : ''}
      src={whiteboard?.profile.preview?.uri}
      alt={displayName}
      defaultImage={<WhiteboardIcon />}
      onClick={onClick}
      {...props}
    />
  );
};

export default WhiteboardPreview;
