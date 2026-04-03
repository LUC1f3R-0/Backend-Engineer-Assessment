import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

jest.mock('../../config/app.config', () => ({
  getAppConfig: jest.fn(() => ({
    xApiKey: 'expected-key',
  })),
}));

describe('ApiKeyGuard', () => {
  const guard = new ApiKeyGuard();

  function ctx(method: string, headers: Record<string, string>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method, headers }),
      }),
    } as ExecutionContext;
  }

  it('allows OPTIONS (CORS preflight)', () => {
    expect(guard.canActivate(ctx('OPTIONS', {}))).toBe(true);
  });

  it('rejects when x-api-key is missing', () => {
    expect(() => guard.canActivate(ctx('PUT', {}))).toThrow(UnauthorizedException);
  });

  it('rejects when x-api-key does not match', () => {
    expect(() => guard.canActivate(ctx('PUT', { 'x-api-key': 'wrong' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('allows PUT when x-api-key matches (push-token, orders, etc.)', () => {
    expect(
      guard.canActivate(ctx('PUT', { 'x-api-key': 'expected-key' })),
    ).toBe(true);
  });
});
