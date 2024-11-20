import RouterLink, { RouterLinkProps } from '@/core/ui/link/RouterLink';
import { MouseEventHandler } from 'react';
import SwapColors from '@/core/ui/palette/SwapColors';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { Box, Button, Grow } from '@mui/material';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { Link } from 'react-router-dom';
import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { Trans } from 'react-i18next';
import { CardText, PageTitle } from '@/core/ui/typography';

const SignInLink = ({ onClick, ...props }: Omit<RouterLinkProps, 'to'>) => {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <SwapColors>
      <RouterLink to={buildLoginUrl()} onClick={handleClick} blank={false} {...props} />
    </SwapColors>
  );
};

const CreateAccountBanner = () => {
  return (
    <Grow in appear>
      <PageContentBlockSeamless disablePadding>
        <Button
          component={Link}
          to={AUTH_SIGN_UP_PATH}
          variant="contained"
          size="large"
          sx={{ textTransform: 'none', a: { textDecoration: 'underline' } }}
        >
          <Box>
            <Trans
              i18nKey="pages.home.sections.createAccountBanner.message"
              components={{
                big: <PageTitle component="span" />,
                small: <CardText color="inherit" component="span" />,
                signin: <SignInLink />,
              }}
            />
          </Box>
        </Button>
      </PageContentBlockSeamless>
    </Grow>
  );
};

export default CreateAccountBanner;
