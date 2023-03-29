import { UserCardProps } from '../../../composite/common/cards';
import { ValueType } from '../filterFn';

interface ValueGetterProps extends Omit<UserCardProps, 'roleName'> {
  roleName?: string;
}

/**
 * @deprecated find a better way to handle filters
 */
export const userCardValueGetter = ({
  id,
  displayName,
  roleName,
  country,
  city,
  tags,
}: ValueGetterProps): ValueType => ({
  id: id ?? '',
  values: [displayName ?? '', roleName ?? '', country ?? '', city ?? '', (tags ?? []).join(' ')],
});

export const userCardTagsGetter = ({ tags }: UserCardProps): string[] => tags ?? [];
