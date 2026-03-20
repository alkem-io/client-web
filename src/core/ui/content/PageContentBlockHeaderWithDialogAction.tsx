import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpandContentIcon } from './ExpandContent';
import PageContentBlockHeader, { type PageContentBlockHeaderProps } from './PageContentBlockHeader';

interface PageContentBlockHeaderWithDialogActionProps extends PageContentBlockHeaderProps {
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  expanded?: boolean;
  showExpand?: boolean;
  id?: string;
  titleId?: string;
}

const iconSize = (theme: Theme) => theme.spacing(2);

const PageContentBlockHeaderWithDialogAction = ({
  expanded = false,
  onDialogOpen,
  onDialogClose,
  actions,
  showExpand = true,
  id,
  titleId,
  ...headerProps
}: PropsWithChildren<PageContentBlockHeaderWithDialogActionProps>) => {
  const { t } = useTranslation();
  const dialogAction = (
    <>
      {actions}

      {showExpand && (
        <IconButton
          onClick={expanded ? onDialogClose : onDialogOpen}
          sx={{ svg: { width: iconSize, height: iconSize } }}
          aria-label={t('buttons.expandWindow')}
          id={id}
        >
          {expanded ? <Close /> : <ExpandContentIcon />}
        </IconButton>
      )}
    </>
  );

  return <PageContentBlockHeader {...headerProps} titleId={titleId} id={id} actions={dialogAction} />;
};

export default PageContentBlockHeaderWithDialogAction;
