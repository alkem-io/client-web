import { createStyles } from '../../hooks/useTheme';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Tag, { TagProps } from '../core/Tag';
import Typography from '../core/Typography';
import Card from '../core/Card';

const useMemberOfStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.shape.spacing(1),
    marginTop: theme.shape.spacing(1),
    backgroundColor: theme.palette.neutralLight,
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
    <Card primaryTextProps={{ text: 'Member of' }} className={'mt-2'}>
      {membershipItems(ecoverses, t('general.ecoverse'), 'primary')}
      {membershipItems(groups, t('general.group'), 'primary')}
      {membershipItems(challenges, t('general.challenge'), 'neutral')}
      {membershipItems(opportunities, t('general.opportunity'), 'primary')}
      {membershipItems(organizations, t('general.organization'), 'positive')}
    </Card>
  );
};
export default MemberOf;
