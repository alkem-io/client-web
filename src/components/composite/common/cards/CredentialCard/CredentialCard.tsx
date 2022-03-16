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
  claims: {
    name: string;
    value: string;
  }[];
  context: Record<string, string>;
  issued: string;
  expires: string;
  issuer: string;
}

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
  })
);

const issuerResolver = _ => 'Alkemio';
const issuerURLResolver = _ => 'url-to-issuer';
let i = 0;
const claimParser = claims => {
  return (
    <>
      <Typography variant="h6" color="neutralMedium">
        Claims:
      </Typography>
      {claims.map(claim => (
        <Box sx={{ whiteSpace: 'initial', wordBreak: 'break-all' }}>
          <Typography key={i++} variant="h6" color="neutralMedium">
            {claim.name}: {claim.value}
          </Typography>
        </Box>
      ))}
    </>
  );
};

const CredentialCard: FC<CredentialCardProps> = ({ entities: details, loading = false, children }) => {
  const { claims, description, issued, expires, issuer, name } = details || {};

  const url = issuerURLResolver(issuer);
  const issuerName = issuerResolver(issuer);
  const issueDate = issued ? new Date(Date.parse(issued)) : undefined;
  const expiryDate = expires ? new Date(Date.parse(expires)) : undefined;

  const descriptionText = description;
  const credentialInfo = `Credential issued by ${issuerName}${
    issueDate ? ` on ${issueDate.toLocaleDateString()}` : ''
  }`;

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
              {expiryDate && <Typography variant="caption">Valid before {expiryDate.toLocaleDateString()}</Typography>}
            </Box>
            <Box paddingY={1}>
              {descriptionText && (
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  {descriptionText}
                </Typography>
              )}
              <Typography variant="body2" color="neutralMedium" sx={{ wordWrap: 'break-word' }}>
                {credentialInfo}
              </Typography>
              <pre>{claimParser(claims)}</pre>
            </Box>
          </>
        )}
        {children}
      </CardContent>
    </LinkCard>
  );
};
export default CredentialCard;
