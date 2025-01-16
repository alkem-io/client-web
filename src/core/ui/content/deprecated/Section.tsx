import { Box, Container, Typography } from '@mui/material';
import Grid, { GridSize } from '@mui/material/Grid';
import React, { PropsWithChildren } from 'react';

export const Header = ({ text }: { text?: string }) => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h2" textTransform="uppercase" mt={1.5} mb={1}>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
};

type SectionProps = {
  avatar?: React.ReactNode;
  details?: React.ReactNode;
};

/**
 * @deprecated
 */
const Section = ({ children, avatar, details }: PropsWithChildren<SectionProps>) => {
  return (
    <Container maxWidth="xl" sx={{ pt: 2, pb: 2, background: 'background.paper', position: 'relative' }}>
      <Grid container spacing={2}>
        <Grid item md={12} lg={3} zIndex={1}>
          <Box
            sx={{
              pt: 4,
              display: 'flex',
              flexDirection: 'row-reverse',
              overflow: 'hidden',
              justifyContent: 'center',

              '&.mini': {
                width: 100,
              },
            }}
          >
            {avatar}
          </Box>
        </Grid>
        <Grid item container direction={'column'} zIndex={1} xs={12} md={(8 + (!details ? 4 : 0)) as GridSize} lg={6}>
          <Box
            sx={theme => ({
              p: 4,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',

              [theme.breakpoints.down('xl')]: {
                pl: 2,
                pr: 2,
              },
            })}
          >
            {children}
          </Box>
        </Grid>
        {details && (
          <Grid item xs={12} md={4} lg={3} zIndex={1}>
            <div>{details}</div>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Section;
