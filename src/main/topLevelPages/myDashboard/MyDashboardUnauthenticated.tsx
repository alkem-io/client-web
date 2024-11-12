import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExploreSpaces from './ExploreSpaces/ExploreSpaces';
import { Actions } from '../../../core/ui/actions/Actions';
import { AUTH_SIGN_UP_PATH } from '../../../core/auth/authentication/constants/authentication.constants';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';

interface MyDashboardUnauthenticatedProps {}

const MyDashboardUnauthenticated: FC<MyDashboardUnauthenticatedProps> = () => {
  const { t } = useTranslation();

  return (
    <PageContentBlock columns={12}>
      <ExploreSpaces />
      <Actions justifyContent={'center'}>
        <Button
          component={Link}
          to={AUTH_SIGN_UP_PATH}
          variant="contained"
          size="large"
          sx={{ width: 'auto', textTransform: 'none', a: { textDecoration: 'underline' } }}
          startIcon={<AccountCircleOutlinedIcon />}
        >
          {t('authentication.sign-up')}
        </Button>
      </Actions>
    </PageContentBlock>
  );
};

export default MyDashboardUnauthenticated;
