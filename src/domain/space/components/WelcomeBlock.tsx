import type { PropsWithChildren } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { DialogActionButton } from './subspaces/DialogActionButton';
import { SubspaceDialog } from './subspaces/SubspaceDialog';

interface WelcomeBlockProps {
  about?: boolean;
}

const WelcomeBlock = ({ children }: PropsWithChildren<WelcomeBlockProps>) => {
  return (
    <PageContentBlock accent={true}>
      {children}
      <DialogActionButton dialog={SubspaceDialog.About} actionDisplay="fullWidth" />
    </PageContentBlock>
  );
};

export default WelcomeBlock;
