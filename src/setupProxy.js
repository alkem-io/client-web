const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: 'http://localhost:4455',
      changeOrigin: true,
    })
  );

  app.use(
    '/sessions',
    createProxyMiddleware({
      target: 'http://localhost:4433',
      changeOrigin: true,
    })
  );

  app.use(
    '/self-service',
    createProxyMiddleware({
      target: 'http://localhost:4433',
      changeOrigin: true,
    })
  );
};
