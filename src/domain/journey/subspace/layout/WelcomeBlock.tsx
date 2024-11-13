import React, { PropsWithChildren } from 'react';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import { useConsumeAction } from './SubspacePageLayout';
import { SubspaceDialog } from './SubspaceDialog';
import { Button } from '@mui/material';
import RouterLink from '@core/ui/link/RouterLink';

interface WelcomeBlockProps {
  about?: boolean;
}

const WelcomeBlock = ({ about = false, children }: PropsWithChildren<WelcomeBlockProps>) => {
  const buttonDef = useConsumeAction(about && SubspaceDialog.About);

  const ButtonIcon = buttonDef?.icon!;

  return (
    <PageContentBlock accent>
      {children}
      {buttonDef && (
        <RouterLink to={buttonDef.dialogType}>
          <Button variant="outlined" startIcon={<ButtonIcon />} fullWidth>
            {buttonDef.label}
          </Button>
        </RouterLink>
      )}
    </PageContentBlock>
  );
};

export default WelcomeBlock;
