import { PropsWithChildren } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { SubspaceDialog } from './subspaces/SubspaceDialog';
import { DialogAction } from './subspaces/DialogAction';

interface WelcomeBlockProps {
  about?: boolean;
}

const WelcomeBlock = ({ children }: PropsWithChildren<WelcomeBlockProps>) => {
  return (
    <PageContentBlock accent>
      {children}
      <DialogAction dialog={SubspaceDialog.About} actionDisplay="fullWidth" />
    </PageContentBlock>
  );
};

export default WelcomeBlock;
