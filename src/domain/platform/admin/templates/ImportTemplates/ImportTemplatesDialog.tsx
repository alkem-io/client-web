import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import React from 'react';
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
import { useInnovationPacksQuery } from '../../../../../hooks/generated/graphql';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/FileOpenOutlined';
import { DialogActions, DialogTitle } from '../../../../../common/components/core/dialog';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

export enum TemplateType {
  Canvas = 'canvas',
  Card = 'aspect',
  Lifecycle = 'lifecycle',
}

export interface ImportTemplatesDialogProps {
  templateType: TemplateType;
  open: boolean;
  onClose: DialogProps['onClose'];
  //onSelect: (templates: InnovationPacksQuery['library']['innovationPacks']['templates']) => void;
  onSelect: (templates: any) => void; //!!TODO: Not any
}

const ImportTemplatesDialog = ({ open, onClose, templateType, onSelect }: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();

  // TODO: Rename to Innovat<I>onPack
  const templatesHelperText = (pack: any) => {
    //!!TODO: Not any
    if (!pack) return '';
    return t('pages.admin.generic.sections.templates.import-innovation-packs.helpText', {
      organizationName: pack.provider?.displayName,
      cardsCount: pack.templates?.aspectTemplates?.length,
      canvasesCount: pack.templates?.canvasTemplates?.length,
      innovationFlowsCount: pack.templates?.lifecycleTemplates?.length,
    });
  };

  const { data, loading } = useInnovationPacksQuery();
  const packs = data?.library.innovationPacks;
  console.log(data);
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
        {!loading && packs && (
          <>
            <List>
              {packs.map(pack => {
                const open = true; //!! TODO: useState
                const templates = pack.templates![`${templateType}Templates` as const]; //!! TODO get templateType well
                return (
                  <>
                    <ListItemButton onClick={() => onSelect(pack.templates!)}>
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={pack.displayName} secondary={templatesHelperText(pack)} />
                      {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {(templates as any[]).map(t => (
                          <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                              <FileIcon />
                            </ListItemIcon>
                            <ListItemText primary={t.id} />
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
