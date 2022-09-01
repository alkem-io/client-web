import React, { FC, memo, useMemo, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '../../core/Avatar';
import Card from '../../core/Card';
import { makeStyles } from '@mui/styles';
import hexToRGBA from '../../../common/utils/hexToRGBA';
import OrganizationPopUp from '../entities/Organization/OrganizationPopUp';
import TagContainer from '../../core/TagContainer';
import Tag from '../../core/Tag';
import { OrganizationSearchResultFragment } from '../../../models/graphql-schema';
import EntitySearchCardProps from './EntitySearchCardProps';

const OrganizationCardStyles = makeStyles(theme => ({
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
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
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

const OrganizationSearchCardInner: FC<EntitySearchCardProps<OrganizationSearchResultFragment>> = ({
  terms,
  entity: organization,
}) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const styles = OrganizationCardStyles();

  const tagProps = { text: 'Organization' };

  const displayName = organization?.displayName || '';
  const avatar = organization?.profile?.avatar?.uri || '';

  const tags = (organization?.profile?.tagsets || []).flatMap(x => x.tags);
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        bodyProps={{
          classes: {
            background: theme => theme.palette.background.paper,
            padding: theme => `${theme.spacing(4)} ${theme.spacing(3)} ${theme.spacing(1)}`,
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
        {isModalOpened && organization && (
          <OrganizationPopUp id={organization?.id} onHide={() => setIsModalOpened(false)} />
        )}
      </Card>
    </div>
  );
};

export const OrganizationSearchCard = memo(OrganizationSearchCardInner);
