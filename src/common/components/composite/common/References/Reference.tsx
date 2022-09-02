import React, { FC } from 'react';
import { Grid, Link, Tooltip, Typography as MUITypography } from '@mui/material';
import { Reference } from '../../../../../models/Profile';
import { createStyles, makeStyles } from '@mui/styles';

interface ReferenceProps {
  reference: Reference;
}

const useStyles = makeStyles(theme =>
  createStyles({
    wrapper: {
      marginLeft: 0,
      marginTop: theme.spacing(1),
    },
  })
);

const REFERENCE_DESCRIPTION_MAX_LENGTH = 80; // characters

interface ReferenceDescriptionProps {
  children: string | undefined;
}

const ReferenceDescription: FC<ReferenceDescriptionProps> = ({ children }) => {
  if (typeof children === 'undefined') {
    return null;
  }

  const isCut = children.length > REFERENCE_DESCRIPTION_MAX_LENGTH;

  const descriptionText = isCut ? `${children.slice(0, REFERENCE_DESCRIPTION_MAX_LENGTH)}…` : children;

  const formattedDescription = <MUITypography variant="subtitle2">{descriptionText}</MUITypography>;

  if (isCut) {
    return (
      <Tooltip title={children} placement="top-start" disableInteractive>
        {formattedDescription}
      </Tooltip>
    );
  }

  return formattedDescription;
};

const ReferenceView: FC<ReferenceProps> = ({ reference }) => {
  const styles = useStyles();

  return (
    <Grid item container spacing={1} direction="column" className={styles.wrapper}>
      <Tooltip title={reference.uri} placement="top-start" disableInteractive>
        <Link href={reference.uri} target="_blank">
          {reference.name}
        </Link>
      </Tooltip>
      <ReferenceDescription>{reference.description}</ReferenceDescription>
    </Grid>
  );
};

export default ReferenceView;
