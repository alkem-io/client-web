import React, { ReactNode, useState } from 'react';
import { ShareDialog, ShareDialogProps } from '@domain/shared/components/ShareDialog/ShareDialog';

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
    setShareDialogOpen(true);
  };

  return {
    share,
    shareDialog,
  };
};

export default useShare;
