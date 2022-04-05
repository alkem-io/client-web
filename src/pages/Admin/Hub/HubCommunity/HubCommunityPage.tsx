import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { HubSettingsSection } from '../../../../components/composite/layout/HubSettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { HubSettingsPageProps } from '../../../../components/composite/layout/HubSettingsLayout/types';
import Card from '../../../../components/core/Card';
import { Container, Grid } from '@mui/material';
import Button from '../../../../components/core/Button';
import { Link as RouterLink } from 'react-router-dom';
import { managementData } from '../../../../components/Admin/managementData';

const { buttons } = managementData.hubLvl.find(({ name }) => name === 'Community')!;

const HubCommunityPage: FC<HubSettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  return (
    <HubSettingsLayout currentTab={HubSettingsSection.Community} tabRoutePrefix={routePrefix}>
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
    </HubSettingsLayout>
  );
};

export default HubCommunityPage;
