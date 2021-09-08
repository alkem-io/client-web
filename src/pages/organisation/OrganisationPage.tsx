import { ReactComponent as Globe } from 'bootstrap-icons/icons/globe2.svg';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../common';
import { createStyles, useUpdateNavigation, useOrganisation } from '../../hooks';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { Image } from '../../components/core/Image';
import Divider from '../../components/core/Divider';
import { useMembershipOrganisationQuery, useUsersWithCredentialsQuery } from '../../hooks/generated/graphql';
import { Loading } from '../../components/core';
import Icon from '../../components/core/Icon';
import MembershipSection from './MembershipSection';
import { AuthorizationCredential, User } from '../../models/graphql-schema';
import InfoSection from './InfoSection';

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

  const { profile, displayName } = organisation || {};
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
    skip: !organisation,
  });
  const { ecoversesHosting = [], challengesLeading = [] } = data?.membershipOrganisation || {};

  const { data: _orgOwners } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        resourceID: organisation?.id,
        type: AuthorizationCredential.OrganisationOwner,
      },
    },
    skip: !organisation,
  });
  const orgOwners = (_orgOwners?.usersWithAuthorizationCredential || []) as User[];

  if (orgLoading) {
    return <Loading text={t('loading.message', { blockName: t('common.organisation') })} />;
  }

  return (
    <>
      <Section avatar={avatar ? <Image src={avatar} alt={`${displayName} logo`} className={styles.banner} /> : <div />}>
        <SectionHeader text={displayName} />
        <SubHeader text={description} />
        <Body>
          <InfoSection organisation={organisation} owners={orgOwners} />
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
