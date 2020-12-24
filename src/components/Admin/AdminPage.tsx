import React, { FC } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import Button from '../core/Button';
import Card from '../core/Card';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { Theme } from '../../context/ThemeProvider';
import { PageProps } from '../../pages';

import { Row } from 'react-bootstrap';

const adminPageData = [
  {
    name: 'Users',
    buttons: [
      { description: 'New user', url: '/users/new' },
      { description: 'Edit users', url: '/users' },
    ],
  },
  {
    name: 'Ecoverse groups',
    buttons: [{ description: 'Edit groups', url: '/groups' }],
  },
  {
    name: 'Challenges',
    buttons: [
      { description: 'Manage', url: '/challenges' },
      { description: 'Create New', url: '/challenges/new' },
    ],
  },
];

export const AdminPage: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  return (
    <>
      {adminPageData.map((x, i) => (
        <Row key={i} className={'mb-4'}>
          <Card
            key={i}
            classes={{
              background: (theme: Theme) => theme.palette.neutral,
            }}
            primaryTextProps={{
              text: x.name || '',
              classes: {
                color: (theme: Theme) => theme.palette.neutral,
                lineHeight: '36px',
              },
            }}
          >
            <div className={'d-flex wrap'}>
              {x.buttons.map((b, j) => (
                <Button key={j} text={b.description} as={Link} to={`${url}${b.url}`} className={'mr-2'} />
              ))}
            </div>
          </Card>
        </Row>
      ))}
    </>
  );
};
export default AdminPage;
