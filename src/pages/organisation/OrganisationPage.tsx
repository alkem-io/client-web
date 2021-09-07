import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { Typography } from '@material-ui/core';
import { PageProps } from '../common';
import { createStyles, useUpdateNavigation, useOrganisation } from '../../hooks';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { Image } from '../../components/core/Image';
import Divider from '../../components/core/Divider';

const useStyles = createStyles(() => ({
  banner: {
    maxWidth: 320,
    height: 'initial',
    margin: '0 auto',
  },
}));

const OrganisationPage: FC<PageProps> = ({ paths }) => {
  const styles = useStyles();
  const { url } = useRouteMatch();
  const { organisation } = useOrganisation();
  const currentPaths = useMemo(
    () => (organisation ? [...paths, { value: url, name: organisation.displayName, real: true }] : paths),
    [paths, organisation]
  );
  useUpdateNavigation({ currentPaths });

  const { profile, displayName, legalEntityName, contactEmail } = organisation || {};
  const { avatar, description } = profile || {};

  return (
    <>
      <Section avatar={avatar ? <Image src={avatar} alt={`${displayName} logo`} className={styles.banner} /> : <div />}>
        <SectionHeader text={displayName} />
        <SubHeader text={description} />
        <Body>
          <Typography variant={'h5'}>{legalEntityName}</Typography>
          <Typography component={'a'} href={`mailto:${contactEmail}`}>
            {contactEmail}
          </Typography>
        </Body>
      </Section>
      <Divider />
    </>
  );
};

export default OrganisationPage;
