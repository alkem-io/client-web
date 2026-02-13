# Research: Splitting Build for Separate Deployments

**Date:** 2026-02-07
**Goal:** Extract admin section (and later authentication, chat, whiteboards) into separate deployable units with independent build, deploy, and release cycles.

---

## Current Architecture

### Application Structure

- Single-page React 19 + TypeScript app built with Vite
- Entry point: `/index.html` → `src/index.tsx` → `src/root.tsx`
- Admin code in: `/src/main/admin/` and `/src/domain/platformAdmin/`
- Admin routes at `/admin/*` via `PlatformAdminRoute.tsx`
- All routes share: Apollo Client, auth providers, MUI theme, i18n, Sentry, etc.

### Current Build

- Single Vite config (`vite.config.mjs`) outputs to `build/`
- Single `index.html` serves entire SPA
- React Router handles all client-side routing
- Lazy loading via `lazyWithGlobalErrorHandler` for code splitting
- Build scripts: `pnpm build`, `pnpm build:sentry`

### Current Deployment

- Docker multi-stage: Node for build, nginx for serving
- nginx serves SPA with fallback to index.html
- Kubernetes deployment with single pod
- GitHub Actions workflows per environment

### Shared Dependencies (admin uses all of these)

- Apollo Client (GraphQL) - all admin queries from generated hooks
- Authentication context - auth check, privilege verification
- MUI + Emotion - all UI components
- i18n (react-i18next) - all strings
- React Router - routing
- Sentry/APM - error tracking

### Deep Provider Nesting

The `root.tsx` file shows 15+ nested providers that all apps would need:

- `RootThemeProvider` (MUI + Emotion theming)
- `ConfigProvider` (platform configuration from GraphQL)
- `SentryErrorBoundaryProvider` (error tracking)
- `AuthenticationProvider` (Kratos-based auth)
- `AlkemioApolloProvider` (GraphQL client with cache)
- `UserProvider` (current user context)
- `PendingMembershipsDialogProvider`, `InAppNotificationsProvider`, `UserMessagingProvider`

---

## Options Analysis

### Option 1: Vite Multi-Page Application (MPA)

Create multiple HTML entry points within a single Vite build, each serving a different application segment.

#### Implementation

**Directory Structure:**

```
/
├── index.html           # Main app entry
├── admin.html           # Admin app entry
├── auth.html            # Authentication entry
├── src/
│   ├── entries/
│   │   ├── main.tsx     # Main app bootstrap
│   │   ├── admin.tsx    # Admin app bootstrap
│   │   └── auth.tsx     # Auth app bootstrap
│   ├── core/            # Shared code (unchanged)
│   ├── domain/          # Domain code (unchanged)
│   └── shared-providers/
│       └── AppShell.tsx # Extracted provider tree
```

**Vite Configuration:**

```javascript
// vite.config.mjs
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        auth: resolve(__dirname, 'auth.html'),
      },
    },
  },
});
```

**Nginx Configuration Changes:**

```nginx
# Route /admin/* to admin.html
location /admin {
    try_files $uri /admin.html;
}

# Route /login, /logout, etc. to auth.html
location ~ ^/(login|logout|registration|verify|recovery|settings|sign_up) {
    try_files $uri /auth.html;
}

# Default routes to main index.html
location / {
    try_files $uri /index.html;
}
```

#### Pros

- **Single Build Process**: One `pnpm build` produces all artifacts
- **Shared Vendor Chunks**: Rollup naturally deduplicates common dependencies (React, MUI, Apollo)
- **Minimal CI/CD Changes**: Same Docker build, just with multiple entry points
- **Shared Code Stays Shared**: No duplication of `/src/core/` or GraphQL generated files
- **Simple Dev Experience**: Single dev server, hot reload works across all entries
- **URL Structure Preserved**: `/admin/*` paths work as expected

#### Cons

- **Not Truly Independent Deploys**: All apps built and deployed together
- **No Separate Release Cycles**: Cannot deploy admin fix without rebuilding main
- **Provider Duplication in Runtime**: Each entry point bootstraps its own provider tree (memory overhead)
- **Partial Solution**: Addresses code organization but not independent deployment

#### CI/CD Changes

- Minor: Update nginx config to route to multiple HTML files
- No workflow changes needed

#### Bundle Size Impact

- Slightly larger total bundle (multiple entry chunks)
- Shared vendor chunks reduce duplication
- Individual app chunks smaller than current monolith

#### Migration Effort: **LOW** (1-2 weeks)

---

### Option 2: Monorepo with pnpm Workspaces

Split the codebase into multiple packages with their own `package.json`, using pnpm workspaces for dependency management. Each app can be built and deployed independently.

#### Implementation

**Directory Structure:**

```
/
├── pnpm-workspace.yaml
├── packages/
│   ├── shared/                    # @alkemio/shared
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── core/              # Moved from src/core
│   │   │   ├── domain/shared/     # Shared domain types
│   │   │   └── providers/         # AppShell, common providers
│   │   └── tsconfig.json
│   │
│   ├── graphql/                   # @alkemio/graphql
│   │   ├── package.json
│   │   ├── codegen.yml
│   │   └── src/generated/         # Generated Apollo hooks
│   │
│   ├── admin/                     # @alkemio/admin
│   │   ├── package.json
│   │   ├── vite.config.mjs
│   │   ├── index.html
│   │   └── src/
│   │       ├── index.tsx
│   │       └── domain/platformAdmin/
│   │
│   ├── auth/                      # @alkemio/auth
│   │   ├── package.json
│   │   ├── vite.config.mjs
│   │   ├── index.html
│   │   └── src/
│   │
│   └── main/                      # @alkemio/main
│       ├── package.json
│       ├── vite.config.mjs
│       ├── index.html
│       └── src/
```

**pnpm-workspace.yaml:**

```yaml
packages:
  - 'packages/*'
```

**Package Dependencies:**

```json
// packages/admin/package.json
{
  "name": "@alkemio/admin",
  "dependencies": {
    "@alkemio/shared": "workspace:*",
    "@alkemio/graphql": "workspace:*"
  }
}
```

#### Pros

- **Independent Builds**: Each app has its own `pnpm build`
- **Independent Deploys**: Deploy admin without touching main
- **Clear Dependency Graph**: Explicit package dependencies
- **Shared Code Properly Managed**: `@alkemio/shared` package
- **GraphQL Codegen Centralized**: One source of truth for generated types
- **Scalable**: Easy to add `/chat`, `/whiteboards` later
- **Better Test Isolation**: Run admin tests independently

#### Cons

- **Significant Refactoring**: Move code between packages, update all imports
- **Circular Dependency Risk**: Must carefully design package boundaries
- **Complex Builds**: Need turborepo/nx for efficient monorepo builds
- **Duplicate Node Modules**: Each package has its own `node_modules` (mitigated by pnpm)
- **Docker Complexity**: Either multiple images or multi-stage build with selective copying
- **Auth State Sharing Challenge**: Need shared auth context or token passing

#### CI/CD Changes

**Major Overhaul Required:**

- Separate workflows per package
- Selective builds based on changed files
- Multiple Docker images or complex multi-stage build
- Separate K8s deployments per app

**Sample Workflow:**

```yaml
# .github/workflows/build-admin.yml
on:
  push:
    paths:
      - 'packages/admin/**'
      - 'packages/shared/**'
      - 'packages/graphql/**'
```

#### Bundle Size Impact

- Potentially smaller individual bundles
- Risk of duplicated shared code if not configured correctly
- Requires careful Rollup externalization

#### Migration Effort: **HIGH** (4-8 weeks)

---

### Option 3: Micro-Frontends with Module Federation

Use Webpack/Vite Module Federation to load separately built applications at runtime. Each app is a "remote" that can be deployed independently.

#### Implementation

**Architecture:**

```
Shell App (Host)
├── Loads config, auth, providers
├── Renders navigation
└── Dynamically loads remotes:
    ├── @alkemio/admin (remote)
    ├── @alkemio/auth (remote)
    └── @alkemio/main (remote)
```

**Vite Federation Config (Shell):**

```javascript
// shell/vite.config.mjs
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        admin: 'http://localhost:3002/assets/remoteEntry.js',
        auth: 'http://localhost:3003/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', '@apollo/client', '@mui/material'],
    }),
  ],
});
```

**Remote Config (Admin):**

```javascript
// admin/vite.config.mjs
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'admin',
      filename: 'remoteEntry.js',
      exposes: {
        './AdminApp': './src/AdminApp.tsx',
      },
      shared: ['react', 'react-dom', '@apollo/client', '@mui/material'],
    }),
  ],
});
```

**Shell Loading Remote:**

```tsx
// shell/src/routes/AdminRoute.tsx
const AdminApp = React.lazy(() => import('admin/AdminApp'));

export const AdminRoute = () => (
  <Suspense fallback={<Loading />}>
    <AdminApp />
  </Suspense>
);
```

#### Pros

- **True Independent Deployment**: Deploy admin without rebuilding shell
- **Runtime Composition**: Apps loaded on demand
- **Shared Dependencies at Runtime**: React, MUI loaded once
- **Technology Flexibility**: Could use different React versions (not recommended)
- **Best for Separate Teams**: Clear ownership boundaries

#### Cons

- **Vite Module Federation is Less Mature**: `@originjs/vite-plugin-federation` has limitations
- **Complex Shared State**: Apollo cache, auth context must be passed carefully
- **Version Mismatches**: Shared dependencies can conflict
- **Runtime Overhead**: Remote loading adds latency
- **Debugging Complexity**: Harder to trace issues across boundaries
- **Build Tooling Shift**: May need to consider Webpack for better federation support
- **CDN Complexity**: Must serve remotes from consistent URLs

#### Authentication State Sharing

```tsx
// Shell passes auth context to remotes
<AdminApp apolloClient={sharedClient} authContext={authContext} user={currentUser} />
```

#### CI/CD Changes

- **Separate Pipelines Required**: Each remote has its own build/deploy
- **Shell Must Know Remote URLs**: Configuration management for remote endpoints
- **Versioning Complexity**: Remote compatibility with shell

**Sample Architecture:**

```
                    ┌─────────────────┐
                    │   Shell (CDN)   │
                    │   index.html    │
                    └────────┬────────┘
                             │ loads
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Admin Remote │    │  Auth Remote │    │  Main Remote │
│ /admin/*     │    │  /login/*    │    │  /spaces/*   │
└──────────────┘    └──────────────┘    └──────────────┘
```

#### Bundle Size Impact

- **Smaller Initial Load**: Shell loads minimal code
- **Lazy Remote Loading**: Admin code only loaded when visiting `/admin`
- **Shared Chunk Deduplication**: If configured correctly

#### Migration Effort: **VERY HIGH** (8-12 weeks)

---

### Option 4: Shared Library Approach (Recommended Hybrid)

Extract shared code into publishable npm packages (or pnpm workspace packages), but keep each app as a simple standalone Vite project that imports these packages. Apps are built completely independently but share common code via package dependencies.

#### Implementation

**Directory Structure:**

```
/
├── packages/
│   ├── ui-kit/                    # @alkemio/ui-kit (published to npm)
│   │   ├── package.json
│   │   └── src/
│   │       ├── theme/             # MUI theme, typography
│   │       ├── components/        # Reusable UI components
│   │       └── providers/         # ThemeProvider, etc.
│   │
│   ├── graphql-client/            # @alkemio/graphql-client
│   │   ├── package.json
│   │   ├── codegen.yml
│   │   └── src/
│   │       ├── client.ts          # Apollo client factory
│   │       └── generated/         # Types and hooks
│   │
│   └── auth-sdk/                  # @alkemio/auth-sdk
│       ├── package.json
│       └── src/
│           ├── provider.tsx       # AuthProvider
│           ├── hooks.ts           # useAuth, useUser
│           └── kratos/            # Kratos integration
│
├── apps/
│   ├── admin/                     # Standalone Vite app
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── vite.config.mjs
│   │   └── src/
│   │
│   ├── auth/                      # Standalone Vite app
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── src/
│   │
│   └── main/                      # Standalone Vite app
│       ├── package.json
│       ├── Dockerfile
│       └── src/
```

**Shared Package Example:**

```typescript
// packages/auth-sdk/src/provider.tsx
export const AlkemioAuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { session, isAuthenticated, loading } = useKratosWhoami();

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, session }}>
      {children}
    </AuthContext.Provider>
  );
};

// packages/auth-sdk/src/hooks.ts
export const useAuth = () => useContext(AuthContext);
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading]);
};
```

**App Consuming Shared Packages:**

```tsx
// apps/admin/src/main.tsx
import { AlkemioAuthProvider } from '@alkemio/auth-sdk';
import { AlkemioThemeProvider } from '@alkemio/ui-kit';
import { createGraphQLClient } from '@alkemio/graphql-client';
import { ApolloProvider } from '@apollo/client';

const client = createGraphQLClient(import.meta.env.VITE_GRAPHQL_ENDPOINT);

const AdminApp = () => (
  <AlkemioThemeProvider>
    <ApolloProvider client={client}>
      <AlkemioAuthProvider>
        <AdminRoutes />
      </AlkemioAuthProvider>
    </ApolloProvider>
  </AlkemioThemeProvider>
);
```

#### Shared State Handling

**Option A: Shared Kratos Session (Recommended)**

- All apps use the same Kratos domain for auth
- Session cookies shared across subdomains
- Each app independently calls `/sessions/whoami`

**Option B: JWT Token Passing**

- Store JWT in localStorage
- All apps read from same storage key
- Refresh token logic in `@alkemio/auth-sdk`

#### Nginx/Traefik Routing

```nginx
# Each app served by its own container, routed by path
upstream admin-app { server admin-pod:80; }
upstream auth-app { server auth-pod:80; }
upstream main-app { server main-pod:80; }

location /admin {
    proxy_pass http://admin-app;
}

location ~ ^/(login|logout|registration) {
    proxy_pass http://auth-app;
}

location / {
    proxy_pass http://main-app;
}
```

#### Pros

- **True Independent Builds and Deploys**: Each app is completely standalone
- **Clear Separation of Concerns**: UI kit, auth, GraphQL are proper packages
- **No Runtime Federation Complexity**: Simple static imports
- **Version Control of Shared Code**: Apps can pin package versions
- **Better for Multiple Teams**: Clear ownership of packages
- **Easy to Add New Apps**: Just create new app, import packages
- **Standard npm/pnpm Patterns**: Well-understood tooling

#### Cons

- **Package Publishing Overhead**: Need npm publishing pipeline (or use pnpm workspace)
- **Duplicate React/MUI in Each Bundle**: Unless careful about externalization
- **Coordination for Breaking Changes**: Package updates affect all apps
- **GraphQL Schema Must Be Shared**: All apps need compatible GraphQL types

#### CI/CD Changes

**Package CI:**

```yaml
# .github/workflows/publish-packages.yml
on:
  push:
    paths: ['packages/**']
jobs:
  publish:
    steps:
      - run: pnpm -r --filter './packages/*' publish
```

**App CI (per app):**

```yaml
# .github/workflows/build-admin.yml
on:
  push:
    paths: ['apps/admin/**']
    branches: [develop]
jobs:
  build:
    steps:
      - run: pnpm install
      - run: cd apps/admin && pnpm build
      - run: docker build -t alkemio-admin:${{ github.sha }} apps/admin
```

#### Bundle Size Impact

- Larger individual bundles (each includes React, MUI)
- Can be mitigated with:
  - CDN-hosted shared libs (importmap)
  - Careful tree-shaking in shared packages

#### Migration Effort: **MEDIUM-HIGH** (4-6 weeks)

---

## Comparison Matrix

| Criteria              | Option 1: MPA | Option 2: Monorepo | Option 3: Module Federation | Option 4: Shared Library |
| --------------------- | ------------- | ------------------ | --------------------------- | ------------------------ |
| Independent Deploys   | No            | Yes                | Yes                         | Yes                      |
| Implementation Effort | Low           | High               | Very High                   | Medium-High              |
| Runtime Complexity    | Low           | Low                | High                        | Low                      |
| Shared Code Handling  | Excellent     | Good               | Complex                     | Good                     |
| CI/CD Changes         | Minimal       | Major              | Major                       | Major                    |
| Dev Experience        | Excellent     | Good               | Fair                        | Good                     |
| Bundle Size           | Good          | Good               | Best (lazy)                 | Fair                     |
| Auth State Sharing    | Built-in      | Needs design       | Complex                     | Cookie-based             |
| Scalability           | Limited       | Excellent          | Excellent                   | Excellent                |
| Team Independence     | Low           | High               | Highest                     | High                     |

---

## Recommendation

### Phase 1: Start with Option 1 (Vite MPA) - Immediate Win

**Rationale:**

- Minimal disruption to existing codebase
- Validates the concept of separate entry points
- Establishes nginx routing patterns
- Low risk, can be done in 1-2 weeks

**Deliverables:**

1. Create `admin.html` and `src/entries/admin.tsx`
2. Update Vite config with multiple inputs
3. Update nginx config for path-based routing
4. Verify admin works independently

### Phase 2: Migrate to Option 4 (Shared Library) - Long-term Solution

**Rationale:**

- Best balance of independence and simplicity
- Builds on Phase 1 learnings
- Standard patterns, good tooling support
- Enables truly independent release cycles

**Deliverables:**

1. Extract `@alkemio/ui-kit` package
2. Extract `@alkemio/graphql-client` package
3. Extract `@alkemio/auth-sdk` package
4. Create `apps/admin` as standalone app
5. Set up separate CI/CD workflows
6. Deploy admin to separate pod/service

### Why Not Module Federation?

- Vite's module federation is less mature than Webpack's
- Runtime complexity is significant
- Shared state management is tricky
- Debugging cross-boundary issues is difficult
- Overkill for current team structure

### Incremental Migration Path

```
Week 1-2:   Option 1 (MPA) for /admin
Week 3-4:   Extract @alkemio/ui-kit
Week 5-6:   Extract @alkemio/auth-sdk, @alkemio/graphql-client
Week 7-8:   Create apps/admin using shared packages
Week 9-10:  Set up separate CI/CD for admin
Week 11-12: Create apps/auth (authentication flows)
Week 13+:   Create apps/main, deprecate MPA approach
```

---

## Critical Files for Implementation

| File                                                      | Purpose                                             |
| --------------------------------------------------------- | --------------------------------------------------- |
| `vite.config.mjs`                                         | Modify for MPA entry points                         |
| `src/root.tsx`                                            | Extract provider tree to shared package             |
| `src/domain/platformAdmin/routing/PlatformAdminRoute.tsx` | Entry point for admin app                           |
| `.build/.nginx/nginx.conf`                                | Update for path-based routing                       |
| `Dockerfile`                                              | Modify for multiple entry points or separate images |
| `.github/workflows/*.yml`                                 | Add separate workflows per app                      |

---

## Questions to Resolve Before Implementation

1. **Authentication Strategy**: Should we rely on shared Kratos cookies or implement token-based auth across apps?
2. **GraphQL Schema Versioning**: How do we handle schema changes that affect multiple apps?
3. **Deployment Topology**: Single nginx routing to multiple pods, or separate ingress per app?
4. **Development Workflow**: Should devs run all apps locally or just the one they're working on?
5. **Shared Component Versioning**: Semantic versioning for packages or always use latest?

---

## Next Steps

1. Team review of this document
2. Decide on Phase 1 implementation timeline
3. Create technical spike for MPA setup
4. Identify package boundaries for Phase 2
