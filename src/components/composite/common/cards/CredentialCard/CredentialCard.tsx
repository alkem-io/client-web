import { Box, CardContent, Skeleton } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import LinkCard from '../../../../core/LinkCard/LinkCard';
import Typography from '../../../../core/Typography';

export interface CredentialCardEntities {
  name: string;
  description?: string;
  type: string;
  claim: Record<string, string>;
  context: Record<string, string>;
  issued: string;
  issuer: string;
}

export const CONTRIBUTION_CARD_HEIGHT_SPACING = 18;
export const CONTRIBUTION_CARD_WIDTH_SPACING = 32;

export interface CredentialCardProps {
  entities?: CredentialCardEntities;
  classes?: {
    label?: string;
  };
  loading?: boolean;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      height: '100%',
      width: '100%',
      minWidth: 254, // magic
      display: 'flex',
      flexDirection: 'column',
    },
    cardContent: {
      padding: theme.spacing(1.5),
      flexGrow: 1,
      background: theme.palette.background.default,
    },
    entityType: {
      color: '#FFFFFF',
    },
    entityTypeWrapper: {
      background: theme.palette.neutralMedium.main,
      boxShadow: '0px 3px 6px #00000029',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      flexShrink: 0,
    },
  })
);

const issuerResolver = _ => 'Alkemio';
const issuerURLResolver = _ => 'url-to-issuer';
const claimParser = (claim, context) => {
  return (
    <>
      {Object.keys(context).map((key, i) => (
        <Box key={i} sx={{ whiteSpace: 'initial', wordBreak: 'break-all' }}>
          <Typography variant="h6" color="neutralMedium">
            {key}: {claim[key]}
          </Typography>
        </Box>
      ))}
    </>
  );
};

const CredentialCard: FC<CredentialCardProps> = ({ entities: details, loading = false, children }) => {
  const { claim, description, issued, issuer, name, context } = details || {};

  const url = issuerURLResolver(issuer);
  const issuerName = issuerResolver(issuer);
  const issueDate = issued ? new Date(Date.parse(issued)) : undefined;

  const descriptionText = description ?? `Credential issued by ${issuerName}`;

  const styles = useStyles();

  return (
    <LinkCard to={url} className={styles.card} aria-label="credential-card">
      <CardContent className={styles.cardContent}>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" animation="wave" />
            <Skeleton variant="rectangular" animation="wave" />
            <Skeleton variant="rectangular" animation="wave" height={100} />
          </Box>
        ) : (
          <>
            <Box display="flex" flexDirection="column" justifyContent="space-between">
              <Typography color="primary" weight="boldLight" clamp={1}>
                {name}
              </Typography>
              {issueDate && <Typography variant="caption">{issueDate.toLocaleDateString()}</Typography>}
            </Box>
            <Box paddingY={1}>
              {descriptionText && (
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  {descriptionText}
                </Typography>
              )}
              <pre>{claimParser(claim, context)}</pre>
            </Box>
          </>
        )}
        {children}
      </CardContent>
    </LinkCard>
  );
};
export default CredentialCard;
