/**
 * True only under the Vite dev server (`pnpm start`): hot module replacement
 * exists there and in no built image, whatever mode the image was built in.
 * The test runner provides it too, so its `test` mode is excluded.
 */
const isLocalDevServer = (): boolean => Boolean(import.meta.hot) && import.meta.env.MODE !== 'test';

/**
 * An empty setting falls back to the local stack's address, on the dev server
 * only, so a fresh checkout reaches the server repo's local chat server and
 * call-token service without a local override file. Built images keep empty
 * values empty.
 */
const orLocalDevDefault = (value: string, localDefault: string, devServer = isLocalDevServer()): string =>
  value !== '' ? value : devServer ? localDefault : '';

export { isLocalDevServer, orLocalDevDefault };
