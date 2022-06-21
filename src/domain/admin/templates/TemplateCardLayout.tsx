import React, { PropsWithChildren } from 'react';
import withElevationOnHover from '../../shared/components/withElevationOnHover';
import { Paper, Typography } from '@mui/material';
import LinkNoUnderline from '../../shared/components/LinkNoUnderline';
import { TemplateCardProps } from './TemplateCardProps';

const ElevatedPaper = withElevationOnHover(Paper);

const TemplateCardLayout = ({
  url,
  linkState,
  title,
  children,
  hasImage = false,
}: PropsWithChildren<TemplateCardProps>) => {
  return (
    <LinkNoUnderline to={url} state={linkState}>
      <ElevatedPaper
        sx={{
          width: theme => theme.spacing(26),
          // TODO Setting the height explicitly may not be needed if content size isn't computed from it;
          // TODO remove if not needed for CanvasTemplateCard
          // height: theme => theme.spacing(18),
          background: hasImage ? undefined : theme => theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {children}
        <Typography variant="body1" color="primary" fontWeight="bold" sx={{ paddingX: 2, paddingBottom: 1 }}>
          {title}
        </Typography>
      </ElevatedPaper>
    </LinkNoUnderline>
  );
};

export default TemplateCardLayout;
