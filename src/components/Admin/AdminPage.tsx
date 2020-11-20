import React, { FC, Fragment } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import Button from '../core/Button';
import Card from '../core/Card';
import { CardContainer } from '../core/Container';

type AdminPageProps = PageProps;

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
];

export const AdminPage: FC<AdminPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { url } = useRouteMatch();
  return (
    <>
      <CardContainer>
        {adminPageData.map((x, i) => (
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
            <div>
              {x.buttons.map((b, j) => (
                <Fragment key={j}>
                  <Button text={b.description} as={Link} to={`${url}${b.url}`} />{' '}
                </Fragment>
              ))}
            </div>
          </Card>
        ))}
      </CardContainer>
    </>
  );
};
export default AdminPage;
