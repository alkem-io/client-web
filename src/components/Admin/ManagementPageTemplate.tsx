import React, { FC } from 'react';
import { Container, Row } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';

import Button from '../core/Button';
import Card from '../core/Card';

import { useUpdateNavigation } from '../../hooks';
import { Theme } from '../../themes';
import { PageProps } from '../../pages';

interface Props extends PageProps {
  data: Array<{
    name: string;
    buttons: Array<{
      description: string;
      url: string;
    }>;
  }>;
}

export const ManagementPageTemplate: FC<Props> = ({ data, paths }) => {
  const { url } = useRouteMatch();

  useUpdateNavigation({ currentPaths: paths });

  return (
    <Container>
      {data.map((x, i) => (
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
              {x.buttons.map((btn, index) => (
                <Button key={index} as={Link} to={`${url}${btn.url}`} text={btn.description} className={'mr-2'} />
              ))}
            </div>
          </Card>
        </Row>
      ))}
    </Container>
  );
};

export default ManagementPageTemplate;
