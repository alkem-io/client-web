import React, { FC, useMemo, useState } from 'react';
import { FormControl, InputGroup, ListGroup } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useEcoverseChallengeGroupsQuery } from '../../generated/graphql';

export const GroupPage: FC = () => {
  const { data, loading } = useEcoverseChallengeGroupsQuery();
  const { path } = useRouteMatch();
  const [filterBy, setFilterBy] = useState(''); //<string | undefined>(undefined);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const groups = (data && data.groups) || [];
  const filteredGroups = useMemo(
    () => groups.filter(g => (filterBy ? g.name.toLowerCase().includes(filterBy.toLowerCase()) : true)),
    [filterBy, groups]
  );

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <h2 style={{ textAlign: 'center' }}>Groups</h2>
        <hr />
        <InputGroup>
          <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
        </InputGroup>
        <hr />
        <ListGroup>
          {filteredGroups.map(u => (
            <ListGroup.Item as={Link} action key={u.id} to={`${path}/${u.id}/edit`}>
              {u.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </>
    );
  }
};
export default GroupPage;
