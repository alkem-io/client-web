import React, { FC } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import Button from '../core/Button';
import Card from '../core/Card';

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
    name: 'Groups',
    buttons: [{ description: 'Edit groups', url: '/groups' }],
  },
  {
    name: 'Challenges',
    buttons: [{ description: 'Edit challenges', url: '/challenges' }],
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
            bodyProps={{
              classes: {
                // background: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.5),
              },
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
