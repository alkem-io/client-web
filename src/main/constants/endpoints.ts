import { env } from '../env';

const domain = env?.VITE_APP_ALKEMIO_DOMAIN ?? '';
export const publicGraphQLEndpoint = `${domain}/api/public/graphql`;
export const privateGraphQLEndpoint = `${domain}/api/private/graphql`;

/**
 * Runtime-resolved platform base address (e.g. `https://alkem.io`,
 * `https://acc-alkem.io`, or `http://localhost:3000` locally) — the only
 * place the MCP connection recipe (contract `connection-recipe`, A-14)
 * should read it from. Never hard-code an environment literal in a
 * component; consume this export instead.
 */
export const platformBaseAddress = domain;

/**
 * Same-origin base path for the AI assistant HTTP+SSE surface
 * (`assistant-service`, reverse-proxied through the edge). Cookie-authenticated;
 * the browser holds no credentials and sends no Authorization header.
 * See specs/004-web-ai-assistant/contracts/browser-assistant-sse.md.
 */
export const assistantBasePath = env?.VITE_APP_ASSISTANT_BASE_PATH ?? '/api/private/rest/assistant';
export const assistantEndpoint = `${domain}${assistantBasePath}`;
