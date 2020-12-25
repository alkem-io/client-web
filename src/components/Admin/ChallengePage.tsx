import React, { FC } from 'react';
import { Row } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';

import Button from '../core/Button';
import Card from '../core/Card';

import { useUpdateNavigation } from '../../hooks/useNavigation';
import { Theme } from '../../context/ThemeProvider';
import { PageProps } from '../../pages';

const challengePageData = [
  {
    name: 'Challenge info',
    buttons: [{ description: 'Edit', url: '/edit' }],
  },
  {
    name: 'Challenge groups',
    buttons: [{ description: 'Manage groups', url: '/groups' }],
  },
  {
    name: 'Opportunities',
    buttons: [
      { description: 'Manage', url: '/opportunities' },
      { description: 'Create new', url: '/opportunities/new' },
    ],
  },
];

export const ChallengePage: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  useUpdateNavigation({ currentPaths: paths });

  return (
    <>
      {challengePageData.map((x, i) => (
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
                <Button key={j} as={Link} to={`${url}${b.url}`} text={b.description} className={'mr-2'} />
              ))}
            </div>
          </Card>
        </Row>
      ))}
    </>
  );
};

export default ChallengePage;
