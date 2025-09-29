import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';

type WhiteboardPreviewProps = {
  displayName?: string;
  whiteboard:
    | {
        profile: {
          preview?: { uri: string };
        };
      }
    | undefined;
  onClick?: MouseEventHandler;
};

const WhiteboardPreview = ({ displayName, whiteboard, onClick }: WhiteboardPreviewProps) => {
  const { t } = useTranslation();

  return (
    <ImageWithCaption
      caption={onClick ? t('callout.singleWhiteboard.clickToSee') : ''}
      src={whiteboard?.profile.preview?.uri}
      alt={displayName}
      defaultImage={<WhiteboardIcon />}
      onClick={onClick}
    />
  );
};

export default WhiteboardPreview;
