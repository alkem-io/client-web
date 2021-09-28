import React, { FC } from 'react';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { AuthorizationCredential } from '../../models/graphql-schema';
import AvatarContainer from '../../components/core/AvatarContainer';
import Avatar from '../../components/core/Avatar';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { useUsersWithCredentialsQuery } from '../../hooks/generated/graphql';
import Loading from '../../components/core/Loading/Loading';
import { useUserContext } from '../../hooks';
import AuthenticationBackdrop from '../../components/AuthenticationBackdrop';

const useStyles = makeStyles(theme => ({
  noDataText: {
    paddingTop: theme.spacing(2),
  },
}));

interface Props {
  organizationId?: string;
  credential: AuthorizationCredential;
  icon: React.ReactElement;
  title: string;
  subtitle?: string;
  noDataText: string;
}

const UserSection: FC<Props> = ({ organizationId, credential, icon, title, subtitle = '', noDataText }) => {
  const styles = useStyles();

  const { user: _user } = useUserContext();
  const user = _user?.user;

  const { data, loading } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        resourceID: organizationId,
        type: credential,
      },
    },
    skip: !organizationId || !user,
  });
  const users = data?.usersWithAuthorizationCredential;

  return (
    <AuthenticationBackdrop show={user != null} blockName={title}>
      <Section avatar={icon}>
        <SectionHeader text={title} />
        <SubHeader text={subtitle} />
        <Body>
          {loading && <Loading text="" />}
          {users && (
            <AvatarContainer>
              {users.length > 0 &&
                users.map(({ id, profile, displayName }, i) => (
                  <Avatar key={i} src={profile?.avatar} name={displayName} userId={id} />
                ))}
              {!users.length && (
                <Typography variant={'subtitle1'} className={styles.noDataText}>
                  {noDataText}
                </Typography>
              )}
            </AvatarContainer>
          )}
        </Body>
      </Section>
    </AuthenticationBackdrop>
  );
};
export default UserSection;
