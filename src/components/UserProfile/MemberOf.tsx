import { createStyles } from '../../hooks/useTheme';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Tag, { TagProps } from '../core/Tag';
import Typography from '../core/Typography';
import Card from '../core/Card';
import { Box } from '@material-ui/core';

const useMemberOfStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.neutralLight.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noPadding: {
    padding: 0,
  },
}));

export type MemberOfProps = {
  groups: string[];
  challenges: string[];
  opportunities: string[];
  ecoverses: string[];
  organizations: string[];
};

const MemberOf: FC<MemberOfProps> = ({ groups, challenges, opportunities, ecoverses, organizations }) => {
  const { t } = useTranslation();
  const styles = useMemberOfStyles();

  const membershipItems = (names: string[], tagText: string, tagColor: TagProps['color']) => {
    return (
      names &&
      names.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <Typography as="span" className={styles.noPadding}>
            {x}
          </Typography>
          <Tag text={tagText} color={tagColor} />
        </div>
      ))
    );
  };

  return (
    <Box marginY={1}>
      <Card primaryTextProps={{ text: 'Member of' }}>
        {membershipItems(ecoverses, t('common.ecoverse'), 'primary')}
        {membershipItems(groups, t('common.group'), 'primary')}
        {membershipItems(challenges, t('common.challenge'), 'neutral')}
        {membershipItems(opportunities, t('common.opportunity'), 'primary')}
        {membershipItems(organizations, t('common.organization'), 'positive')}
      </Card>
    </Box>
  );
};
export default MemberOf;
