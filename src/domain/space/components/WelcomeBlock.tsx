import { PropsWithChildren } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { SubspaceDialog } from './subspaces/SubspaceDialog';
import { DialogActionButton } from './subspaces/DialogActionButton';

interface WelcomeBlockProps {
  about?: boolean;
}

const WelcomeBlock = ({ children }: PropsWithChildren<WelcomeBlockProps>) => {
  return (
    <PageContentBlock accent>
      {children}
      <DialogActionButton dialog={SubspaceDialog.About} actionDisplay="fullWidth" />
    </PageContentBlock>
  );
};

export default WelcomeBlock;
