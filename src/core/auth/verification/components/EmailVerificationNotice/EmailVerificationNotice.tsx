import { Button, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AUTH_VERIFY_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { BlockTitle } from '@/core/ui/typography';
import translateWithElements from '@/domain/shared/i18n/TranslateWithElements/TranslateWithElements';

const EmailVerificationNotice = ({ returnUrl }: { returnUrl: string }) => {
  const { t } = useTranslation();
  const tLink = translateWithElements(<Link />);

  return (
    <>
      <BlockTitle sx={{ textAlign: 'center', marginBottom: theme => theme.spacing(4) }}>
        {tLink('pages.verification-required.message', {
          again: { href: AUTH_VERIFY_PATH },
        })}
      </BlockTitle>
      <Button component={Link} href={returnUrl} variant="contained">
        {t('kratos.messages.verification-flow-continue')}
      </Button>
    </>
  );
};

export default EmailVerificationNotice;
