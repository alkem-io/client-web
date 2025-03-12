import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { Container, ContainerProps } from '@mui/material';
import Grid from '@mui/material/Grid';
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface AuthenticationLayoutProps extends ContainerProps {}

export const AuthenticationLayout: FC<AuthenticationLayoutProps> = ({ children, ...rest }) => {
  return (
    <Container maxWidth="xl" {...rest}>
      <Grid container spacing={2}>
        <Grid item container justifyContent="center" sx={{ m: 2 }}>
          <Link to={'/about'}>
            <ImageFadeIn src="/logo.png" alt="Alkemio" sx={{ height: 40 }} />
          </Link>
        </Grid>
      </Grid>
      {children}
    </Container>
  );
};

export default AuthenticationLayout;
