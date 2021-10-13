import { createStyles } from '../../../../hooks/useTheme';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Tag, { TagProps } from '../../../core/Tag';
import Typography from '../../../core/Typography';
import Card from '../../../core/Card';
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

  const membershipItems = (names: string[], tagText: string, tagColor: TagProps['color'] = 'neutralMedium') => {
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
      <Card primaryTextProps={{ text: t('pages.user-profile.member-of') }}>
        {membershipItems(ecoverses, t('common.ecoverse'))}
        {membershipItems(groups, t('common.group'))}
        {membershipItems(challenges, t('common.challenge'))}
        {membershipItems(opportunities, t('common.opportunity'))}
        {membershipItems(organizations, t('common.organization'))}
      </Card>
    </Box>
  );
};
export default MemberOf;
