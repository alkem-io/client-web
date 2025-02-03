import useRoleSetAdmin from '@/domain/access/RoleSetAdmin/useRoleSetAdmin';
import { useSubSpace } from '../../hooks/useSubSpace';
import { Box, Button, Input, MenuItem, Select } from '@mui/material';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';
import { useState } from 'react';

const Block1 = () => {
  const { roleSetId } = useSubSpace();
  const { usersByRole, organizationsByRole } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: [RoleName.Member, RoleName.Lead],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
  });
  return (
    <Box border="1px solid black">
      Block 1<br />
      <ul>
        Members:
        {usersByRole[RoleName.Member]?.map(user => (
          <li key={user.id}>{user.profile.displayName}</li>
        ))}
      </ul>
      <ul>
        Leads:
        {usersByRole[RoleName.Lead]?.map(user => (
          <li key={user.id}>{user.profile.displayName}</li>
        ))}
      </ul>
      <ul>
        Orgs Members:
        {organizationsByRole[RoleName.Member]?.map(user => (
          <li key={user.id}>{user.profile.displayName}</li>
        ))}
      </ul>
      <ul>
        Orgs Leads:
        {organizationsByRole[RoleName.Lead]?.map(user => (
          <li key={user.id}>{user.profile.displayName}</li>
        ))}
      </ul>
    </Box>
  );
};

const Block2 = () => {
  const [filter, setFilter] = useState('');
  const [roleToManage, setRoleToManage] = useState<RoleName>(RoleName.Lead);

  const { roleSetId } = useSubSpace();
  const { usersByRole, removeRoleFromUser, assignRoleToUser } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: [RoleName.Member, RoleName.Lead, RoleName.Admin],
    contributorTypes: [RoleSetContributorType.User],
  });
  const { users: availableUsers } = useRoleSetAvailableUsers({
    roleSetId,
    mode: 'roleSet',
    role: roleToManage,
    skip: !roleSetId || !filter,
    filter,
    usersAlreadyInRole: usersByRole[roleToManage],
  });

  return (
    <Box border="1px solid black">
      Block 2<br />
      <ul>
        Members:
        {usersByRole[RoleName.Member]?.map(user => (
          <li key={user.id}>
            {user.profile.displayName}
            <Button onClick={() => removeRoleFromUser(user.id, RoleName.Member)}>Remove</Button>
          </li>
        ))}
      </ul>
      <ul>
        Leads:
        {usersByRole[RoleName.Lead]?.map(user => (
          <li key={user.id}>
            {user.profile.displayName}
            <Button onClick={() => removeRoleFromUser(user.id, RoleName.Lead)}>Remove</Button>
          </li>
        ))}
      </ul>
      <ul>
        Admins:
        {usersByRole[RoleName.Admin]?.map(user => (
          <li key={user.id}>
            {user.profile.displayName}
            <Button onClick={() => removeRoleFromUser(user.id, RoleName.Admin)}>Remove</Button>
          </li>
        ))}
      </ul>
      <Select value={roleToManage} onChange={e => setRoleToManage(e.target.value as RoleName)}>
        <MenuItem value={RoleName.Lead}>Lead</MenuItem>
        <MenuItem value={RoleName.Admin}>Admin</MenuItem>
      </Select>
      <Input value={filter} onChange={e => setFilter(e.target.value)} sx={{ border: '1px solid red' }} />
      <ul>
        Available {roleToManage}s:
        {availableUsers?.map(user => (
          <li key={user.id}>
            {user.profile.displayName}
            <Button onClick={() => assignRoleToUser(user.id, roleToManage)}>Make {roleToManage}</Button>
          </li>
        ))}
      </ul>
    </Box>
  );
};

const CarlosRoleSetTest = () => {
  return (
    <>
      <Block1 />
      <Block2 />
    </>
  );
};

export default CarlosRoleSetTest;
