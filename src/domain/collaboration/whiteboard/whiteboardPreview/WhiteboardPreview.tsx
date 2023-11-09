import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { Visual } from '../../../common/visual/Visual';
import { MouseEventHandler } from 'react';

interface Whiteboard {
  profile: {
    preview?: Visual;
  };
}

interface WhiteboardPreviewProps {
  frameable: {
    framing: {
      profile: { displayName: string };
      whiteboard?: Whiteboard;
      whiteboardRt?: Whiteboard;
    };
  };
  onClick?: MouseEventHandler;
  onClose?: () => void;
}

const WhiteboardPreview = ({ frameable, onClose, ...props }: WhiteboardPreviewProps) => {
  const { t } = useTranslation();

  const whiteboard = frameable.framing.whiteboardRt ?? frameable.framing.whiteboard;

  return (
    <ImageWithCaption
      caption={t('callout.singleWhiteboard.clickToSee')}
      src={whiteboard?.profile.preview?.uri}
      alt={frameable.framing.profile.displayName}
      defaultImage={<WhiteboardIcon />}
      {...props}
    />
  );
};

export default WhiteboardPreview;
