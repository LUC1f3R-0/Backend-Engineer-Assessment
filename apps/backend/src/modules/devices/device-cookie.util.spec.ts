jest.mock('../../config/app.config', () => ({
  getAppConfig: jest.fn(),
}));

import { getAppConfig } from '../../config/app.config';
import { appendDeviceSessionCookies } from './device-cookie.util';

describe('device-cookie.util — Set-Cookie for cross-origin SPAs', () => {
  it('uses SameSite=None and Secure when deviceCookieSecure is true (HTTPS / production)', () => {
    jest.mocked(getAppConfig).mockReturnValue({
      deviceCookieMaxAgeSec: 34560000,
      deviceCookieSecure: true,
      deviceCookieDomain: undefined,
    } as ReturnType<typeof getAppConfig>);

    const res = { append: jest.fn() };
    appendDeviceSessionCookies(res as never, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a'.repeat(64));

    const lines = res.append.mock.calls.map((c) => c[1] as string);
    expect(lines.some((l) => l.includes('SameSite=None'))).toBe(true);
    expect(lines.some((l) => l.includes('Secure'))).toBe(true);
    expect(lines.some((l) => l.includes('HttpOnly'))).toBe(true);
  });

  it('uses SameSite=Lax when deviceCookieSecure is false (local HTTP)', () => {
    jest.mocked(getAppConfig).mockReturnValue({
      deviceCookieMaxAgeSec: 34560000,
      deviceCookieSecure: false,
      deviceCookieDomain: undefined,
    } as ReturnType<typeof getAppConfig>);

    const res = { append: jest.fn() };
    appendDeviceSessionCookies(res as never, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'b'.repeat(64));

    const lines = res.append.mock.calls.map((c) => c[1] as string);
    expect(lines.some((l) => l.includes('SameSite=Lax'))).toBe(true);
    expect(lines.some((l) => l.includes('SameSite=None'))).toBe(false);
  });
});
