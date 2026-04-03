/**
 * Ensures Cloud Run (K_SERVICE) always gets Secure + SameSite=None device cookies
 * even if NODE_ENV is not "production" in the container.
 */
describe('getAppConfig — deviceCookieSecure', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('is true when K_SERVICE is set even if NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    process.env.K_SERVICE = 'cloud-run-service';

    // eslint-disable-next-line @typescript-eslint/no-require-imports -- fresh module after resetModules
    const { getAppConfig } = require('./app.config');

    expect(getAppConfig().deviceCookieSecure).toBe(true);
    expect(getAppConfig().isCloudRun).toBe(true);
  });
});
