/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, forwardRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonProps } from '@mui/material';
import { useUserContext } from '../../../../domain/community/user';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { TopLevelRoutePath } from '../../../routing/TopLevelRoutePath';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface CreateSpaceBtnProps extends ButtonProps {
  component: ComponentType<any>;
  children: ReactNode;
}

/**
 * CreateSpaceBtn Component
 *
 * This component renders a button that holds the link logic based on privileges.
 * It accepts a custom component as a prop and forwards all additional props to it.
 *
 * @component
 * @param { ComponentType<any> } component - The custom component to render.
 * @param { ReactNode } children - The content to display inside the component.
 * @param { ButtonProps } props - Additional props to pass to the component (could be extended if not sufficient).
 */
export const CreateSpaceBtn = forwardRef<any, CreateSpaceBtnProps>(
  ({ component: Component, children, ...props }, ref) => {
    const { t } = useTranslation();
    const { accountPrivileges } = useUserContext();

    let createLink = t('pages.home.sections.startingSpace.url');

    if (accountPrivileges.includes(AuthorizationPrivilege.CreateSpace)) {
      createLink = `/${TopLevelRoutePath.CreateSpace}`;
    }

    return (
      <Component ref={ref} component={RouterLink} to={createLink} {...props}>
        {children}
      </Component>
    );
  }
);
