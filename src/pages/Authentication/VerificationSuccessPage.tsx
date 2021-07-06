import { ReactComponent as CheckCircle } from 'bootstrap-icons/icons/check-circle.svg';
import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/core/Button';
import Icon from '../../components/core/Icon';
import Markdown from '../../components/core/Markdown';
import Typography from '../../components/core/Typography';
import Image from '../../components/core/Image';
import { createStyles } from '../../hooks/useTheme';

const useVerificationSuccessStyles = createStyles(theme => ({
  logo: {
    height: theme.shape.spacing(4),
  },
}));
interface VerificationSuccessPageProps {}

export const VerificationSuccessPage: FC<VerificationSuccessPageProps> = () => {
  const { t } = useTranslation();
  const styles = useVerificationSuccessStyles();

  return (
    <Container>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Link to={'/about'} href="https://alkem.io/about/">
            <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
          </Link>
        </Col>
      </Row>
      <Typography variant={'h2'} className={'text-center'}>
        <Icon component={CheckCircle} color={'primary'} size={'xl'} />
      </Typography>
      <Typography variant={'h2'} className={'text-center'}>
        {t('pages.verification-success.header')}
      </Typography>
      <Typography variant={'h3'} className={'text-center'}>
        {t('pages.verification-success.subheader')}
      </Typography>
      <Markdown children={t('pages.verification-success.message')} />
      <div className={'mt-4 text-center'}>
        <Button as={Link} to={'/'}>
          {t('buttons.home')}
        </Button>
      </div>
    </Container>
  );
};
export default VerificationSuccessPage;
