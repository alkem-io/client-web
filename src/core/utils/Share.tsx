import React, { ReactNode, useState } from 'react';
import { ShareDialog, ShareDialogProps } from '../../domain/shared/components/ShareDialog/ShareDialog';

// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
interface ShareCapableNavigator extends Navigator {
  canShare(data?: ShareData | undefined): boolean;
}

const tryNativeShare = async (url: string) => {
  const shareNavigator = navigator as ShareCapableNavigator;
  if (shareNavigator.canShare?.({ url })) {
    await shareNavigator.share({ url });
    return true;
  }
  return false;
};

interface ShareOptions {
  url: string | undefined;
  entityTypeName: ShareDialogProps['entityTypeName'];
}

interface ShareProvided {
  share: () => Promise<void>;
  shareDialog: ReactNode;
}

const useShare = ({ url, entityTypeName }: ShareOptions): ShareProvided => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const shareDialog = url && (
    <ShareDialog
      open={shareDialogOpen}
      onClose={() => setShareDialogOpen(false)}
      url={url}
      entityTypeName={entityTypeName}
    />
  );

  const share = async () => {
    if (!url) {
      return;
    }
    if (!(await tryNativeShare(url))) {
      setShareDialogOpen(true);
    }
  };

  return {
    share,
    shareDialog,
  };
};

export default useShare;
