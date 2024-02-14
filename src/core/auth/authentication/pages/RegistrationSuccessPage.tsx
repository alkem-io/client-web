import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { BlockTitle, PageTitle } from '../../../ui/typography';
import { useReturnUrl } from '../utils/SignUpReturnUrl';
import RouterLink from '../../../ui/link/RouterLink';
import { AUTH_VERIFY_PATH } from '../constants/authentication.constants';
import PageContent from '../../../ui/content/PageContent';
import PageContentColumn from '../../../ui/content/PageContentColumn';
import PageContentBlockSeamless from '../../../ui/content/PageContentBlockSeamless';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();

  const returnUrl = useReturnUrl();

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlockSeamless sx={{ alignItems: 'center' }}>
          <FixedHeightLogo />
          <PageTitle>{t('pages.registrationSuccess.header')}</PageTitle>
          <BlockTitle component="p" textAlign="center">
            <Trans
              i18nKey="pages.registrationSuccess.message"
              components={{
                resend: <RouterLink to={AUTH_VERIFY_PATH} underline="always" />,
              }}
            />
          </BlockTitle>
          <BlockTitle component="p">
            <RouterLink to={returnUrl ?? ''} underline="hover">
              {t('pages.registrationSuccess.continue')}
            </RouterLink>
          </BlockTitle>
        </PageContentBlockSeamless>
      </PageContentColumn>
    </PageContent>
  );
};

export default RegistrationSuccessPage;
