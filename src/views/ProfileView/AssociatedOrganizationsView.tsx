import { Grid } from '@material-ui/core';
import React, { FC } from 'react';
import AssociatedOrganizationCard from '../../components/composite/common/cards/Organization/AssociatedOrganizationCard';
import ProfileCard, { ProfileCardProps } from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import AssociatedOrganizationContainer from '../../containers/organization/AssociatedOrganizationContainer';

interface AssociatedOrganizationsViewProps extends ProfileCardProps {
  organizationNameIDs: string[];
}

export const AssociatedOrganizationsView: FC<AssociatedOrganizationsViewProps> = ({ organizationNameIDs, ...rest }) => {
  return (
    <ProfileCard {...rest}>
      <Grid container direction="column" spacing={2}>
        {organizationNameIDs.map((oNameID, i) => (
          <AssociatedOrganizationContainer key={i} entities={{ organizationNameId: oNameID }}>
            {(entities, state) => (
              <Grid item>
                <AssociatedOrganizationCard
                  name={entities.name}
                  avatar={entities.avatar}
                  information={entities.information}
                  role={entities.role}
                  members={entities.membersCount}
                  verified={entities.verified}
                  url={entities.url}
                  loading={state.loading}
                  aria-label="organization"
                />
              </Grid>
            )}
          </AssociatedOrganizationContainer>
        ))}
      </Grid>
    </ProfileCard>
  );
};
export default AssociatedOrganizationsView;
