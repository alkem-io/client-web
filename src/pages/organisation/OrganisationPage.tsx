import { ReactComponent as Globe } from 'bootstrap-icons/icons/globe2.svg';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LinkIcon from '@material-ui/icons/Link';
import EmailIcon from '@material-ui/icons/MailOutline';
import { PageProps } from '../common';
import { createStyles, useUpdateNavigation, useOrganisation } from '../../hooks';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { Image } from '../../components/core/Image';
import Divider from '../../components/core/Divider';
import { useMembershipOrganisationQuery } from '../../hooks/generated/graphql';
import { Loading } from '../../components/core';
import Icon from '../../components/core/Icon';
import MembershipSection from './MembershipSection';
import { OrganizationVerificationEnum } from '../../models/graphql-schema';
import { OrganisationVerifiedState } from '../../components/composite';

const useStyles = createStyles(() => ({
  banner: {
    maxWidth: 320,
    height: 'initial',
    margin: '0 auto',
  },
}));

const OrganisationPage: FC<PageProps> = ({ paths }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const { organisation, organisationId, loading: orgLoading } = useOrganisation();
  const currentPaths = useMemo(
    () => (organisation ? [...paths, { value: url, name: organisation.displayName, real: true }] : paths),
    [paths, organisation]
  );
  useUpdateNavigation({ currentPaths });

  const {
    profile,
    displayName,
    contactEmail,
    website,
    verified = OrganizationVerificationEnum.NotVerified,
  } = organisation || {};
  const { avatar, description } = profile || {};

  const {
    data,
    loading: membershipLoading,
    error: membershipError,
  } = useMembershipOrganisationQuery({
    variables: {
      input: {
        organisationID: organisationId,
      },
    },
  });
  const { ecoversesHosting = [], challengesLeading = [] } = data?.membershipOrganisation || {};

  if (orgLoading) {
    return <Loading text={t('loading.message', { blockName: t('common.organisation') })} />;
  }

  return (
    <>
      <Section avatar={avatar ? <Image src={avatar} alt={`${displayName} logo`} className={styles.banner} /> : <div />}>
        <SectionHeader text={displayName} />
        <SubHeader text={description} />
        <Body>
          <Grid container spacing={1}>
            <Grid item>
              <LinkIcon fontSize={'small'} />
              <Typography component={'a'} href={website}>
                {website}
              </Typography>
            </Grid>
            <Grid item>
              <EmailIcon fontSize={'small'} />
              <Typography component={'a'} href={`mailto:${contactEmail}`}>
                {contactEmail}
              </Typography>
            </Grid>
            <Grid item>
              <OrganisationVerifiedState state={verified} />
            </Grid>
          </Grid>
        </Body>
      </Section>
      <Divider />
      <MembershipSection
        icon={<Icon component={Globe} color="primary" size="xl" />}
        entities={ecoversesHosting}
        entityName={t('common.ecoverses')}
        link={true}
        loading={membershipLoading}
        error={!!membershipError}
        title={t('common.ecoverses')}
        tableTitle={t('pages.organisation.hosted-ecoverses')}
        noDataText={t('pages.organisation.no-rows')}
      />
      <Divider />
      <MembershipSection
        icon={<Icon component={CompassIcon} color="primary" size="xl" />}
        entities={challengesLeading}
        entityName={t('common.challenges')}
        link={false}
        loading={membershipLoading}
        error={!!membershipError}
        title={t('common.challenges')}
        tableTitle={t('pages.organisation.leading-challenges')}
        noDataText={t('pages.organisation.no-rows')}
      />
      <Divider />
    </>
  );
};

export default OrganisationPage;
