import LinkCard from '@/core/ui/card/LinkCard';
import { Caption } from '@/core/ui/typography';
import { Box, CardContent, Skeleton, Typography, styled } from '@mui/material';
import { PropsWithChildren } from 'react';

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

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1.5),
  flexGrow: 1,
  background: theme.palette.background.default,
}));

const StyledCard = styled(LinkCard)(() => ({
  height: '100%',
  width: '100%',
  minWidth: 254, // magic
  display: 'flex',
  flexDirection: 'column',
}));

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

const claimParser = claims => {
  return (
    <>
      <Typography variant="h6" color="neutralMedium.main" fontWeight="medium" fontSize={16}>
        Claims:
      </Typography>
      {claims.map(claim => (
        <Box key={claim.name} sx={{ whiteSpace: 'initial', wordBreak: 'break-all' }}>
          <Typography variant="h6" color="neutralMedium.main" fontWeight="medium" fontSize={16}>
            {claim.name}: {claim.value}
          </Typography>
        </Box>
      ))}
    </>
  );
};

const CredentialCard = ({ entities: details, loading = false, children }: PropsWithChildren<CredentialCardProps>) => {
  const { claims, description, issued, expires, issuer, name } = details || {};

  const url = issuerURLResolver(issuer);
  const issuerName = issuerResolver(issuer);
  const issueDate = issued ? new Date(Date.parse(issued)) : undefined;
  const expiryDate = expires ? new Date(Date.parse(expires)) : undefined;

  const descriptionText = description;
  const credentialInfo = `Credential issued by ${issuerName}${
    issueDate ? ` on ${issueDate.toLocaleDateString()}` : ''
  }`;

  return (
    <StyledCard to={url} aria-label="credential-card">
      <StyledCardContent>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" animation="wave" />
            <Skeleton variant="rectangular" animation="wave" />
            <Skeleton variant="rectangular" animation="wave" height={100} />
          </Box>
        ) : (
          <>
            <Box display="flex" flexDirection="column" justifyContent="space-between">
              <Typography color="primary.main" fontWeight="bold" fontSize={16}>
                {name}
              </Typography>
              {expiryDate && (
                <Caption textTransform="uppercase" fontWeight="medium">
                  Valid before {expiryDate.toLocaleDateString()}
                </Caption>
              )}
            </Box>
            <Box paddingY={1}>
              {descriptionText && <Typography fontSize={16}>{descriptionText}</Typography>}
              <Typography fontSize={16} color="neutralMedium.main">
                {credentialInfo}
              </Typography>
              <pre>{claimParser(claims)}</pre>
            </Box>
          </>
        )}
        {children}
      </StyledCardContent>
    </StyledCard>
  );
};

export default CredentialCard;
