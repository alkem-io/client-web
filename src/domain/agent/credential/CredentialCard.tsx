import { Box, CardContent, Skeleton } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import LinkCard from '@/core/ui/card/LinkCard';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';

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

const issuerResolver = (issuer: string | undefined) => {
  if (!issuer) return 'Undefined';
  if (issuer.startsWith('did:jolo')) {
    return 'Alkemio';
  } else if (issuer.startsWith('did:dock')) {
    return 'Sovrhd';
  } else {
    return 'Unknown';
  }
};
const issuerURLResolver = _ => 'url-to-issuer';
let i = 0;
const claimParser = claims => {
  return (
    <>
      <WrapperTypography variant="h6" color="neutralMedium">
        Claims:
      </WrapperTypography>
      {claims.map(claim => (
        <Box sx={{ whiteSpace: 'initial', wordBreak: 'break-all' }}>
          <WrapperTypography key={i++} variant="h6" color="neutralMedium">
            {claim.name}: {claim.value}
          </WrapperTypography>
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
              <WrapperTypography color="primary" weight="boldLight">
                {name}
              </WrapperTypography>
              {expiryDate && (
                <WrapperTypography variant="caption">Valid before {expiryDate.toLocaleDateString()}</WrapperTypography>
              )}
            </Box>
            <Box paddingY={1}>
              {descriptionText && <WrapperTypography variant="body2">{descriptionText}</WrapperTypography>}
              <WrapperTypography variant="body2" color="neutralMedium">
                {credentialInfo}
              </WrapperTypography>
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
