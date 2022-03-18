import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Button from '../../components/core/Button';
import Markdown from '../../components/core/Markdown';
import Typography from '../../components/core/Typography';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import { Box, Link } from '@mui/material';
import { useUserContext } from '../../hooks';
import { buildUserProfileUrl } from '../../utils/urlBuilders';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <Typography variant={'h2'}>
          <CheckCircleOutline color={'primary'} fontSize={'large'} />
        </Typography>
        <Typography variant={'h2'}>{t('pages.registration-success.header')}</Typography>
        <Typography variant={'h3'}>{t('pages.registration-success.subheader')}</Typography>
        <Markdown children={t('pages.registration-success.message')} />
      </Box>
      <Typography>
        <ul>
          <li>
            The key next step is to complete your{' '}
            <Link component={RouterLink} to={buildUserProfileUrl(user?.user.nameID || '')}>
              <strong>profile:</strong>
            </Link>{' '}
            This makes it easier for others to find you, and your profile is also used when applying to join
            communities.
          </li>
          <li>
            <Link component={RouterLink} to={'/'}>
              <strong>Browse:</strong>
            </Link>{' '}
            Explore the Challenge Hubs, each with their own community around the hosted Challenges.
          </li>
          <li>
            Apply to become a member of one or more Challenge Hubs. Your application is then reviewed based on your
            profile and provided information.
          </li>
          <li>
            <Link component={RouterLink} to={'/search'}>
              <strong>Search</strong>
            </Link>{' '}
            for relevant Challenges and Contributors (Users and Organizations).
          </li>
        </ul>
      </Typography>

      <Typography>As with any community, the more everyone brings in the more everyone gets out!</Typography>
      <Typography>We really hope you enjoy engaging!</Typography>
      <Box marginTop={4} textAlign={'center'}>
        <Button as={RouterLink} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};
export default RegistrationSuccessPage;
