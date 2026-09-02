import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

export type AuthorizationCredentialRule = {
  name?: string;
  cascade: boolean;
  grantedPrivileges: string[];
  criterias: { type: string; resourceID?: string }[];
};

export type AuthorizationPrivilegeRule = {
  name?: string;
  sourcePrivilege: string;
  grantedPrivileges: string[];
};

export type AuthorizationPolicyView = {
  id: string;
  type?: string;
  credentialRules: AuthorizationCredentialRule[];
  privilegeRules: AuthorizationPrivilegeRule[];
};

type AuthorizationPolicyInspectorProps = {
  policyIdInput: string;
  onPolicyIdInputChange: (value: string) => void;
  onLookup: () => void;
  loading: boolean;
  policy?: AuthorizationPolicyView;
  notFound: boolean;
  /** Slot for the per-user privileges lookup, rendered under the policy. */
  userPrivilegesSlot?: ReactNode;
};

function Privileges({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map(privilege => (
        <Badge key={privilege} variant="secondary">
          {privilege}
        </Badge>
      ))}
    </div>
  );
}

/**
 * Diagnostic inspector for an authorization policy — look up by ID and display
 * its type, credential rules, and privilege rules. Pure presentation; the
 * lookup query lives in the integration layer.
 */
export function AuthorizationPolicyInspector({
  policyIdInput,
  onPolicyIdInputChange,
  onLookup,
  loading,
  policy,
  notFound,
  userPrivilegesSlot,
}: AuthorizationPolicyInspectorProps) {
  const { t } = useTranslation('crd-admin');
  const inputId = useId();

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={event => {
          event.preventDefault();
          onLookup();
        }}
      >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={inputId} className="text-body-emphasis">
            {t('authPolicies.idLabel')}
          </label>
          <Input
            id={inputId}
            value={policyIdInput}
            onChange={event => onPolicyIdInputChange(event.target.value)}
            placeholder={t('authPolicies.idLabel')}
          />
        </div>
        <Button type="submit" disabled={loading || !policyIdInput.trim()}>
          {t('authPolicies.lookup')}
        </Button>
      </form>

      {notFound && <p className="text-body text-destructive">{t('authPolicies.notFound')}</p>}

      {policy && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <section className="flex items-center gap-2">
              <h3 className="text-subheader font-semibold">{t('authPolicies.type')}</h3>
              {policy.type ? <Badge>{policy.type}</Badge> : null}
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-subheader font-semibold">{t('authPolicies.credentialRules')}</h3>
              {policy.credentialRules.map(rule => (
                <div
                  key={`cred-${rule.name ?? ''}-${rule.grantedPrivileges.join(',')}`}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3"
                >
                  {rule.name ? <p className="text-body-emphasis">{rule.name}</p> : null}
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-muted-foreground">{t('authPolicies.cascade')}</span>
                    <Badge variant="outline">{rule.cascade ? t('authPolicies.true') : t('authPolicies.false')}</Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">{t('authPolicies.grantedPrivileges')}</span>
                    <Privileges values={rule.grantedPrivileges} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">{t('authPolicies.criteria')}</span>
                    <div className="flex flex-wrap gap-1">
                      {rule.criterias.map(criteria => (
                        <span key={`${criteria.type}-${criteria.resourceID ?? ''}`} className="flex gap-1">
                          <Badge variant="outline">{criteria.type}</Badge>
                          {criteria.resourceID ? <Badge variant="outline">{criteria.resourceID}</Badge> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-subheader font-semibold">{t('authPolicies.privilegeRules')}</h3>
              {policy.privilegeRules.map(rule => (
                <div
                  key={`priv-${rule.name ?? ''}-${rule.sourcePrivilege}`}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3"
                >
                  {rule.name ? <p className="text-body-emphasis">{rule.name}</p> : null}
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-muted-foreground">{t('authPolicies.sourcePrivilege')}</span>
                    <Badge variant="outline">{rule.sourcePrivilege}</Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">{t('authPolicies.grantedPrivileges')}</span>
                    <Privileges values={rule.grantedPrivileges} />
                  </div>
                </div>
              ))}
            </section>
          </div>

          {userPrivilegesSlot ? <div>{userPrivilegesSlot}</div> : null}
        </div>
      )}
    </div>
  );
}
