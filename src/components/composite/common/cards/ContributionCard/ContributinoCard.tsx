import { Box, Card, CardActionArea, CardContent, CardMedia, createStyles, Grid, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';
import Typography from '../../../../core/Typography';
import TagsComponent from '../../TagsComponent/TagsComponent';

interface ContributinoCardProps {
  name: string;
  type: string;
  tags: string[];
  image: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      width: theme.spacing(26),
    },
    cardContent: {
      padding: theme.spacing(1),
    },
    cardMedia: {
      background: theme.palette.neutralMedium.main,
      height: theme.spacing(8),
    },
    entityType: {
      fontSize: 12,
      color: '#FFFFFF',
    },
    entityTypeWrapper: {
      background: theme.palette.neutralMedium.main,
      boxShadow: '0px 3px 6px #00000029',
      borderRadius: '15px 0px 0px 15px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      marginRight: theme.spacing(-1),
    },
  })
);

export const ContributinoCard: FC<ContributinoCardProps> = ({ name, type, tags, image }) => {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      <CardMedia src={image} className={styles.cardMedia} />
      <CardContent className={styles.cardContent}>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item>
            <Typography color="primary" weight="boldLight">
              {name}
            </Typography>
          </Grid>
          <Grid item>
            <Box className={styles.entityTypeWrapper}>
              <Typography variant="body1" className={styles.entityType}>
                {type}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <TagsComponent tags={tags} count={2} />
          </Grid>
        </Grid>
      </CardContent>
      <CardActionArea></CardActionArea>
    </Card>
  );
};
export default ContributinoCard;
