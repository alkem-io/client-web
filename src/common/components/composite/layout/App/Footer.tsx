import React, { FC } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Container, Link, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import WrapperToolbar from '../../../core/WrapperToolbar';
import WrapperTypography from '../../../core/WrapperTypography';
import Image from '../../../../../domain/shared/components/Image';
import { useConfig } from '../../../../../hooks';
import { RouterLink } from '../../../core/RouterLink';
import useCurrentBreakpoint from '../../../../../hooks/useCurrentBreakpoint';
import { useTranslation } from 'react-i18next';

const useFooterStyles = makeStyles(theme => ({
  footer: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  logo: {
    height: theme.spacing(2),
  },
  footerSecondary: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const Footer: FC = ({ children }) => {
  const { t } = useTranslation();
  const styles = useFooterStyles();
  const { platform } = useConfig();
  const breakpoint = useCurrentBreakpoint();

  return (
    <>
      <Box p={2} />
      <Paper elevation={2}>
        <Container maxWidth={breakpoint} className={styles.footer}>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={false}
              justifyContent={'center'}
              component={Box}
              textAlign="center"
              display={{ xs: 'block', sm: 'none' }}
            >
              <Link component={RouterLink} to={'/about'}>
                <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
              </Link>
            </Grid>
            <Grid item xs={12}>
              <WrapperToolbar dense>
                <Grid container justifyContent={'center'} wrap={'nowrap'} spacing={2}>
                  <Grid container justifyContent={'center'} alignItems="center" spacing={2} wrap={'nowrap'}>
                    <Grid item>
                      <Link href={platform?.terms || ''} target={'_blank'} rel="noopener noreferrer">
                        {t('footer.terms')}
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href={platform?.privacy || ''} target={'_blank'} rel="noopener noreferrer">
                        {t('footer.privacy')}
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href={platform?.security || ''} target={'_blank'} rel="noopener noreferrer">
                        {t('footer.security')}
                      </Link>
                    </Grid>
                    <Grid item component={Box} display={{ xs: 'none', sm: 'block', lg: 'block' }}>
                      <Link component={RouterLink} to={'/about'}>
                        <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href={platform?.feedback || ''} target={'_blank'} rel="noopener noreferrer">
                        {t('footer.feedback')}
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href={platform?.support || ''} target={'_blank'} rel="noopener noreferrer">
                        {t('footer.support')}
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link href={platform?.about || ''} target={'_blank'} rel="noopener noreferrer">
                        {t('footer.about')}
                      </Link>
                    </Grid>
                  </Grid>
                </Grid>
              </WrapperToolbar>
            </Grid>
            <Grid item xs={12}>
              <WrapperToolbar dense className={styles.footerSecondary}>
                <Grid container justifyContent={'flex-start'}>
                  <WrapperTypography variant="caption" color="neutralMedium" weight="boldLight">
                    {t('footer.copyright')}
                  </WrapperTypography>
                </Grid>
                <Grid container justifyContent={'flex-end'}>
                  {children}
                </Grid>
              </WrapperToolbar>
            </Grid>
          </Grid>
        </Container>
      </Paper>
    </>
  );
};

export default Footer;
