import React, { PropsWithChildren } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useConsumeAction } from '../layout/flowLayout/SubspacePageLayout';
import { SubspaceDialog } from './subspaces/SubspaceDialog';
import { Button } from '@mui/material';
import RouterLink from '@/core/ui/link/RouterLink';
import { DialogAction } from './subspaces/DialogAction';

interface WelcomeBlockProps {
  about?: boolean;
}

const WelcomeBlock = ({ about = false, children }: PropsWithChildren<WelcomeBlockProps>) => {
  return (
    <PageContentBlock accent>
      {children}
      <DialogAction dialog={SubspaceDialog.About} fullWidth />
    </PageContentBlock>
  );
};

export default WelcomeBlock;
