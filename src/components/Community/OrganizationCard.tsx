import React, { FC, memo, useMemo, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Theme } from '../../context/ThemeProvider';
import { useMembershipOrganisationQuery, useOrganizationCardQuery } from '../../generated/graphql';
import { MembershipResultEntry, Organisation } from '../../types/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import OrganizationPopUp from '../Organizations/OrganizationPopUp';
import Loading from '../core/Loading';

interface OrganizationCardStylesProps extends Organisation {
  terms?: Array<string>;
}

const OrganizationCardStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral, 0.15)}`,
    },
    border: `1px solid ${hexToRGBA(theme.palette.primary, 0.3)}`,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  relative: {
    position: 'relative',
  },
  divCentered: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.shape.spacing(1),
  },
  section: {
    padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(3)}px`,
  },
  avatarsDiv: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.shape.spacing(1),
  },
  avatarDiv: {
    display: 'flex',
    gap: theme.shape.spacing(1),
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  body: {
    flexGrow: 0,
  },
}));

// todo: remove avatar & fix type
type MembershipResultEntry_ = MembershipResultEntry & { avatar: string };
type AvatarInfo = { avatar?: string; displayName?: string; more?: string };
const getAvatarInfo = (results: MembershipResultEntry_[] = []): AvatarInfo[] => {
  const avatars: AvatarInfo[] = results
    .map(x => ({
      avatar: x.avatar,
      displayName: x.displayName,
    }))
    .splice(0, 3);

  if (results.length - 3 > 0) {
    avatars.push({ more: `+${results.length - 3} more` });
  }

  return avatars;
};

const OrganizationCardInner: FC<OrganizationCardStylesProps> = ({ id, terms }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = OrganizationCardStyles();
  const { data, loading } = useOrganizationCardQuery({
    variables: { id },
  });

  const tagProps = { text: 'Organization' };

  const org = data?.organisation;
  const displayName = org?.displayName || '';
  const avatar = org?.profile?.avatar || '';

  const { data: membership, loading: loading2 } = useMembershipOrganisationQuery({
    variables: {
      input: {
        organisationID: id,
      },
    },
  });

  // todo: remove avatar
  const ecoversesHosting = (membership?.membershipOrganisation.ecoversesHosting || []).map(x => ({
    ...x,
    avatar: '',
  }));
  const challengesLeading = (membership?.membershipOrganisation.challengesLeading || []).map(x => ({
    ...x,
    avatar: '',
  }));
  const ecoAvatars = useMemo(() => getAvatarInfo(ecoversesHosting), [ecoversesHosting]);
  const challAvatars = useMemo(() => getAvatarInfo(challengesLeading), [challengesLeading]);

  if (loading || loading2) return <Loading text={''} />;

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        bodyProps={{
          classes: {
            background: (theme: Theme) => theme.palette.background,
            padding: (theme: Theme) =>
              `${theme.shape.spacing(4)}px ${theme.shape.spacing(3)}px ${theme.shape.spacing(1)}px`,
          },
          className: styles.body,
        }}
        primaryTextProps={{
          text: (
            <div className={styles.divCentered}>
              {avatar && <Avatar size="md" src={avatar} />}
              {displayName}
            </div>
          ),
        }}
        sectionProps={{
          children: (ecoAvatars.length > 0 || challAvatars.length > 0) && (
            <div className={styles.avatarsDiv}>
              {challAvatars.length > 0 && (
                <div className={styles.avatarDiv}>
                  {challAvatars.map(x =>
                    x.more ? (
                      <span>{x.more}</span>
                    ) : (
                      <OverlayTrigger
                        placement={'top'}
                        overlay={<Tooltip id={'display-name'}>{x.displayName}</Tooltip>}
                      >
                        <span>
                          <Avatar size="md" src={x.avatar} />
                        </span>
                      </OverlayTrigger>
                    )
                  )}
                </div>
              )}
              {ecoAvatars.length > 0 && (
                <div className={styles.avatarDiv}>
                  {ecoAvatars.map(x =>
                    x.more ? (
                      <span>{x.more}</span>
                    ) : (
                      <OverlayTrigger
                        placement={'top'}
                        overlay={<Tooltip id={'display-name'}>{x.displayName}</Tooltip>}
                      >
                        <span>
                          <Avatar size="md" src={x.avatar} />
                        </span>
                      </OverlayTrigger>
                    )
                  )}
                </div>
              )}
            </div>
          ),
          className: styles.section,
        }}
        tagProps={tagProps}
        matchedTerms={{ terms }}
        onClick={() => {
          !isModalOpened && setIsModalOpened(true);
        }}
      >
        {isModalOpened && org && <OrganizationPopUp id={org?.id} onHide={() => setIsModalOpened(false)} />}
      </Card>
    </div>
  );
};

export const OrganizationCard = memo(OrganizationCardInner);
