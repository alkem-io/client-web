import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../components/composite/layout/ChallengeSettingsLayout/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import Card from '../../../../components/core/Card';
import { Container, Grid } from '@mui/material';
import Button from '../../../../components/core/Button';
import { Link as RouterLink } from 'react-router-dom';
import { managementData } from '../../../../components/Admin/managementData';

const { buttons } = managementData.challengeLvl.find(({ name }) => name === 'Community')!;

const ChallengeCommunityPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <Container maxWidth="xl">
        <Card
          classes={{
            background: theme => theme.palette.neutral.main,
          }}
        >
          <Grid container spacing={2}>
            {buttons.map((btn, index) => (
              <Grid key={index} item>
                <Button as={RouterLink} to={`${routePrefix}${btn.url}`} text={btn.description} />
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunityPage;
