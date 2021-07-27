import React, { FC, memo, useMemo, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Theme } from '../../context/ThemeProvider';
import { useOrganizationCardQuery } from '../../hooks/generated/graphql';
import { Organisation } from '../../models/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import OrganizationPopUp from '../Organizations/OrganizationPopUp';
import Loading from '../core/Loading';
import TagContainer from '../core/TagContainer';
import Tag from '../core/Tag';

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

  const tags = (org?.profile?.tagsets || []).flatMap(x => x.tags);
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  if (loading) return <Loading text={''} />;

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
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TagContainer>
                {truncatedTags.map((t, i) => (
                  <Tag key={i} text={t} color="neutralMedium" />
                ))}
                {tags.length > 3 && (
                  <OverlayTrigger
                    placement={'right'}
                    overlay={<Tooltip id={'more-tags'}>{tags.slice(3).join(', ')}</Tooltip>}
                  >
                    <span>
                      <Tag text={<>{`+ ${tags.length - truncatedTags.length} more`}</>} color="neutralMedium" />
                    </span>
                  </OverlayTrigger>
                )}
              </TagContainer>
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
