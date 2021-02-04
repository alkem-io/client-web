import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC } from 'react';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { User } from '../../generated/graphql';
import { shuffleCollection } from '../../utils/shuffleCollection';
import Avatar from '../core/Avatar';
import AvatarContainer from '../core/AvatarContainer';
import Button from '../core/Button';
import Icon from '../core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../core/Section';
import Typography from '../core/Typography';

interface CommunitySectionProps {
  title: string;
  subTitle: string;
  body?: string;
  users: User[];
  onExplore?: () => void;
}

export const CommunitySection: FC<CommunitySectionProps> = ({ title, subTitle, body, users, onExplore }) => {
  return (
    <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
      <SectionHeader text={title} />
      <SubHeader text={subTitle} />
      <Body text={body}>
        <AvatarsProvider users={users}>
          {populated => (
            <>
              <AvatarContainer className="d-flex" title={'Active community members'}>
                {shuffleCollection(populated).map((u, i) => (
                  <Avatar className={'d-inline-flex'} key={i} src={u.profile?.avatar} name={u.name} />
                ))}
              </AvatarContainer>
              <div style={{ flexBasis: '100%' }} />
              {users.length - populated.length > 0 && (
                <Typography variant="h3" as="h3" color="positive">
                  {`... + ${users.length - populated.length} other members`}
                </Typography>
              )}
            </>
          )}
        </AvatarsProvider>
        {onExplore && <Button text="Explore and connect" onClick={() => onExplore()} />}
      </Body>
    </Section>
  );
};
export default CommunitySection;
