import React, { useMemo, useState } from 'react';
import { validate as validateUUID } from 'uuid';
import { useAuthorizationPrivilegesForUserQuery } from '@core/apollo/generated/apollo-hooks';
import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';
import Loading from '@core/ui/loading/Loading';
import Gutters from '@core/ui/grid/Gutters';
import { BlockTitle } from '@core/ui/typography';
import useAdminGlobalUserList from '@domain/community/user/adminUsers/useAdminGlobalUserList';
import { SearchableTableItem } from '@domain/platform/admin/components/SearchableTable';

interface AuthorizationDialogProps {
  authorizationPolicyId: string;
}

const AuthorizationPrivilegesForUser = ({ authorizationPolicyId }: AuthorizationDialogProps) => {
  const [isUserSelectorOpen, setIsUserSelectorOpen] = useState(false);

  const {
    userList,
    loading: loadingUsers,
    onSearchTermChange,
  } = useAdminGlobalUserList({
    skip: !isUserSelectorOpen,
    pageSize: 20,
  });

  const [userId, setUserId] = useState<string | null>(null);

  const user = useMemo(() => userList.find(user => user.id === userId), [userList, userId]);

  const { data, loading } = useAuthorizationPrivilegesForUserQuery({
    variables: {
      authorizationPolicyId: authorizationPolicyId,
      userId: userId!,
    },
    skip: !authorizationPolicyId || !userId,
  });

  const handleUserInputChange = (_event: unknown, value: string | SearchableTableItem | null) => {
    if (value === null) {
      return;
    }
    if (typeof value === 'string') {
      setUserId(validateUUID(value) ? value : null);
      return;
    }
    setUserId(value.id);
  };

  return (
    <>
      <Autocomplete
        sx={{ width: 300 }}
        open={isUserSelectorOpen}
        onOpen={() => {
          setIsUserSelectorOpen(true);
        }}
        onClose={() => {
          setIsUserSelectorOpen(false);
        }}
        onChange={handleUserInputChange}
        getOptionLabel={option => (typeof option === 'string' ? option : option.value)}
        options={userList}
        loading={loading}
        freeSolo
        renderInput={params => (
          <TextField
            {...params}
            label="Search for a user or paste a user ID"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            onChange={event => {
              onSearchTermChange(event.target.value);
            }}
          />
        )}
      />
      {user && <BlockTitle>{`Authorization Privileges for User ${user?.value}`}</BlockTitle>}
      <Gutters row disablePadding flexWrap="wrap">
        {loading && <Loading />}
        {!loading &&
          data?.lookup.authorizationPrivilegesForUser?.map(privilege => (
            <Chip size="medium" key={privilege} label={privilege} />
          ))}
      </Gutters>
    </>
  );
};

export default AuthorizationPrivilegesForUser;
