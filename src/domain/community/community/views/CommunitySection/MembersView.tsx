import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import UserAvatar from '../../UserAvatar/UserAvatar';
import { Loading } from '../../../../../common/components/core';
import AvatarContainer from '../../../../../common/components/core/AvatarContainer';
import WrapperTypography from '../../../../../common/components/core/WrapperTypography';
import UserCardsContainer from '../../../../../containers/user/UserCardsContainer';
import { User } from '../../../../../core/apollo/generated/graphql-schema';
import shuffleCollection from '../../../../../common/utils/shuffleCollection';

interface MembersProps {
  shuffle?: boolean;
  users: User[];
  entityId: string;
}

export const MembersView: FC<MembersProps> = ({ shuffle = false, users, entityId }) => {
  const { t } = useTranslation();

  const shuffled = shuffle ? shuffleCollection(users) : users;
  const userIDs = shuffled.slice(0, 20).map(x => x.id);

  return (
    <UserCardsContainer userIDs={userIDs} resourceId={entityId}>
      {(entities, state) => {
        const { users: populated } = entities;
        const { loading } = state;

        if (loading) return <Loading />;

        return (
          <>
            <AvatarContainer title={t('components.members-view.title')}>
              {populated.map((u, i) => (
                <UserAvatar key={i} {...u} />
              ))}
            </AvatarContainer>
            <div style={{ flexBasis: '100%' }} />
            {users.length - populated.length > 0 && (
              <WrapperTypography variant="h3" as="h3" color="positive">
                {`... + ${users.length - populated.length} other members`}
              </WrapperTypography>
            )}
          </>
        );
      }}
    </UserCardsContainer>
  );
};
export default MembersView;
