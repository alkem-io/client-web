import { User } from '@/core/apollo/generated/graphql-schema';
import { AlkemioAvatar } from '@/core/ui/image/AlkemioAvatar';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import { UserAvatarsProvider } from '@/domain/community/user/containers/UserAvatarsProvider/UserAvatarsProvider';
import { Box, Button } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface GroupMembersDetailsProps {
  members: User[];
  editLink?: boolean;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  const { t } = useTranslation();
  return (
    <>
      <WrapperTypography variant={'h4'}>Members</WrapperTypography>
      <UserAvatarsProvider users={members}>
        {populated => {
          const avatars = populated;
          return (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexGrow: 1,
                  pb: 3,
                  flexWrap: 'wrap',
                  gap: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                {avatars.map(u => (
                  <AlkemioAvatar key={u.id} src={u.profile.visual?.uri} name={u.profile.displayName} userId={u.id} />
                ))}
              </Box>
              <div style={{ flexBasis: '100%' }} />
              {members.length - populated.length > 0 && (
                <WrapperTypography variant="h3" as="h3" color="positive">
                  {`... + ${members.length - populated.length} other members`}
                </WrapperTypography>
              )}
            </>
          );
        }}
      </UserAvatarsProvider>
      {editLink && (
        <Button component={Link} to={'members'}>
          {t('buttons.edit-members')}
        </Button>
      )}
    </>
  );
};

export default GroupMembersDetails;
