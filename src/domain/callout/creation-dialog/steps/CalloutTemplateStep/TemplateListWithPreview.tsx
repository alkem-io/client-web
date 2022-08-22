import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/material/SvgIcon/SvgIcon';

interface TemplateTitle {
  id: string;
  title: string;
}

// todo extract to diff folder
export interface TemplateListProps {
  templates: TemplateTitle[];
  templatePreviewComponent: React.ReactNode | undefined;
  selectedTemplateId?: string;
  loading?: boolean;
  onSelection?: (templateId: string) => void;
}

export const TemplateListWithPreview: FC<TemplateListProps> = ({
  templates,
  templatePreviewComponent,
  loading,
  selectedTemplateId,
  onSelection
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <List>
        <Skeleton component={ListItem} />
        <Skeleton component={ListItem} />
        <Skeleton component={ListItem} />
      </List>
    )
  }

  if (!templates.length) {
    return <Typography>{t('components.callout-creation.template-step.no-templates')}</Typography>
  }

  const sortedTemplates = templates.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Grid container columnSpacing={2}>
      <Grid item xs={6}>
        <List>
          {sortedTemplates.map(({ id, title }) => (
            <ListItem key={id} disablePadding>
              <ListItemButton onClick={() => onSelection?.(id)} selected={selectedTemplateId === id}>
                <ListItemIcon>
                  <FiberManualRecordIcon />
                </ListItemIcon>
                <ListItemText primary={title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={6}>
        {templatePreviewComponent}
      </Grid>
    </Grid>
  );
};
