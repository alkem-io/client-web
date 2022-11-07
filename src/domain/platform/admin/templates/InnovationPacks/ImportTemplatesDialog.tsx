import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import React, { useState } from 'react';
import {
  DialogProps,
  DialogContent,
  List,
  ListItemIcon,
  ListItemText,
  Skeleton,
  ListItemButton,
  Button,
  Collapse,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/FileOpenOutlined';
import { DialogActions, DialogTitle } from '../../../../../common/components/core/dialog';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { InnovationPack, InnovationPackTemplatesData } from './InnovationPack';

export interface ImportTemplatesDialogProps {
  innovationPacks: InnovationPack[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onSelectTemplate: (template: InnovationPackTemplatesData) => void;
  loading?: boolean;
}

const ImportTemplatesDialog = ({ innovationPacks, loading, open, onClose, onSelectTemplate }: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();

  const [foldersState, setFoldersState] = useState<string[]>([]);
  const isFolderOpen = (id: string) => foldersState.includes(id);

  const onClickOnFolder = (id: string) => {
    if (isFolderOpen(id)) {
      setFoldersState(foldersState.filter(f => f !== id));
    } else {
      setFoldersState([...foldersState, id]);
    }
  }
  // TODO: Rename to Innovat<I>onPack

  const handleClose = () => (onClose ? onClose({}, 'escapeKeyDown') : undefined);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogTitle onClose={handleClose}>
        {t('pages.admin.generic.sections.templates.import-innovation-packs.title')}
      </DialogTitle>
      <DialogContent>
        {loading && <Skeleton variant="rectangular" />}
        {!loading && innovationPacks && (
          <>
            <List>
              {innovationPacks.map(pack => {
                const open = isFolderOpen(pack.id);
                const templates = pack.templates as InnovationPackTemplatesData[];
                return (
                  <>
                    <ListItemButton onClick={() => onClickOnFolder(pack.id)}>
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={pack.displayName} secondary={pack.provider?.displayName} />
                      {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {templates.map(t => (
                          <ListItemButton sx={{ pl: 4 }} onClick={() => onSelectTemplate(t)}>
                            <ListItemIcon>
                              <FileIcon />
                            </ListItemIcon>
                            <ListItemText primary={t.info.title} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportTemplatesDialog;
