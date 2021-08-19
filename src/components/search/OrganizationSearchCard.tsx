import React, { FC, memo, useMemo, useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { createStyles } from '../../hooks';
import hexToRGBA from '../../utils/hexToRGBA';
import OrganizationPopUp from '../Organizations/OrganizationPopUp';
import TagContainer from '../core/TagContainer';
import Tag from '../core/Tag';
import { OrganisationSearchResultFragment } from '../../models/graphql-schema';
import EntitySearchCardProps from './EntitySearchCardProps';

const OrganizationCardStyles = createStyles(theme => ({
  card: {
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral.main, 0.15)}`,
    },
    border: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.3)}`,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  relative: {
    position: 'relative',
  },
  divCentered: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  section: {
    padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`,
  },
  avatarsDiv: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  avatarDiv: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  body: {
    flexGrow: 0,
  },
}));

const OrganizationSearchCardInner: FC<EntitySearchCardProps<OrganisationSearchResultFragment>> = ({
  terms,
  entity: organisation,
}) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = OrganizationCardStyles();

  const tagProps = { text: 'Organization' };

  const displayName = organisation?.displayName || '';
  const avatar = organisation?.profile?.avatar || '';

  const tags = (organisation?.profile?.tagsets || []).flatMap(x => x.tags);
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        bodyProps={{
          classes: {
            background: theme => theme.palette.background.paper,
            padding: theme => `${theme.spacing(4)}px ${theme.spacing(3)}px ${theme.spacing(1)}px`,
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
                  <Tooltip placement="right" title={tags.slice(3).join(', ')} id="more-tags" arrow>
                    <span>
                      <Tag text={<>{`+ ${tags.length - truncatedTags.length} more`}</>} color="neutralMedium" />
                    </span>
                  </Tooltip>
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
        {isModalOpened && organisation && (
          <OrganizationPopUp id={organisation?.id} onHide={() => setIsModalOpened(false)} />
        )}
      </Card>
    </div>
  );
};

export const OrganizationSearchCard = memo(OrganizationSearchCardInner);
