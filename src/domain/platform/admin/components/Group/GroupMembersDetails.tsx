import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Avatar from '@/core/ui/avatar/Avatar';
import { User } from '@/core/apollo/generated/graphql-schema';
import { Caption } from '@/core/ui/typography';
import { UserAvatarsProvider } from '@/domain/community/user/containers/UserAvatarsProvider/UserAvatarsProvider';
import UserPopUp from '@/domain/community/user/userPopUp/UserPopUp';

interface GroupMembersDetailsProps {
  members: User[];
  editLink?: boolean;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  const { t } = useTranslation();
  const [isPopUpShown, setIsPopUpShown] = useState(false);
  const [memberId, setMemberId] = useState<string>();

  const onMemberClick = (id: string) => {
    setMemberId(id);
    setIsPopUpShown(true);
  };

  const onHidePopUp = () => {
    setIsPopUpShown(false);
    setMemberId(undefined);
  };

  return (
    <>
      <Caption variant={'h4'}>Members</Caption>
      <UserAvatarsProvider users={members}>
        {populated => {
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
                {populated.map(u => (
                  <>
                    <Tooltip placement={'bottom'} id={'membersTooltip'} title={u.profile.displayName}>
                      <Avatar
                        src={u.profile.visual?.uri}
                        aria-label="User avatar"
                        alt={t('common.avatar-of', { user: u.profile.displayName })}
                        onClick={() => onMemberClick(u.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {u.profile.displayName?.[0]}
                      </Avatar>
                    </Tooltip>
                  </>
                ))}
              </Box>
              <div style={{ flexBasis: '100%' }} />
              {members.length - populated.length > 0 && (
                <Caption color="positive.main">{`... + ${members.length - populated.length} other members`}</Caption>
              )}
            </>
          );
        }}
      </UserAvatarsProvider>
      {isPopUpShown && memberId && <UserPopUp id={memberId} onHide={onHidePopUp} />}
      {editLink && (
        <Button component={Link} to={'members'}>
          {t('buttons.edit-members')}
        </Button>
      )}
    </>
  );
};

export default GroupMembersDetails;
