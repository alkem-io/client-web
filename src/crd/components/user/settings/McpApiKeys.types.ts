/**
 * Plain TypeScript types shared by the MCP API key CRD components
 * (McpApiKeysCard, McpApiKeyCreateDialog, McpApiKeyRevealPanel).
 *
 * Deliberately mirrors, but does not import, the GraphQL-generated
 * McpApiKeyOperation / McpApiKeyStatus enums (CRD components must not import
 * generated types — see src/crd/CLAUDE.md). The integration container in
 * src/main/crdPages/ maps the generated enums to these string literal unions.
 */

export type McpApiKeyOperationOption = 'read' | 'tools';

export type McpApiKeyStatusOption = 'active' | 'expired' | 'revoked';

export type McpApiKeyRowData = {
  id: string;
  name: string;
  operations: McpApiKeyOperationOption[];
  createdDate: Date;
  expiresAt: Date | undefined;
  lastUsedAt: Date | undefined;
  lastUsedFromIp: string | undefined;
  /** Precomputed by the container: REVOKED takes precedence over EXPIRED (FR-032). */
  status: McpApiKeyStatusOption;
};

export type McpApiKeyRevealData = {
  /** The plaintext key. Held only in memory for the life of the reveal panel. */
  apiKey: string;
  key: McpApiKeyRowData;
};
