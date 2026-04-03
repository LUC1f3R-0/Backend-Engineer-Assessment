import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { DevicePushToken } from '../devices/entities/device-push-token.entity';

jest.mock('../../config/app.config', () => ({
  loadEnv: jest.fn(),
  getAppConfig: jest.fn(),
}));

jest.mock('firebase-admin', () => {
  const mockSend = jest.fn();
  const mockApps: unknown[] = [];
  const api = {
    apps: mockApps,
    initializeApp: jest.fn(() => {
      mockApps.push({});
    }),
    credential: {
      cert: jest.fn(() => ({})),
    },
    /** Required: FcmService.ensureFirebaseApp returns admin.app() and aborts if falsy. */
    app: jest.fn(() => ({})),
    messaging: jest.fn(() => ({ send: mockSend })),
    __test: { mockSend, mockApps },
  };
  return { ...api, default: api };
});

import * as AppConfig from '../../config/app.config';
import { FcmService } from './fcm.service';

type FirebaseAdminTest = typeof import('firebase-admin') & {
  __test: { mockSend: jest.Mock; mockApps: unknown[] };
};

describe('FcmService', () => {
  let service: FcmService;
  let repo: jest.Mocked<Pick<Repository<DevicePushToken>, 'findOne'>>;
  let mockSend: jest.Mock;
  let mockApps: unknown[];

  const deviceId = '33333333-3333-3333-3333-333333333333';
  const order = {
    orderId: '11111111-1111-1111-1111-111111111111',
    deviceId,
    totalAmount: '10.75',
  };

  const baseConfig = () => ({
    nodeEnv: 'test',
    port: 8080,
    xApiKey: '',
    swaggerEnabled: false,
    corsOrigins: ['http://localhost:4200'] as string[],
    isCloudRun: false,
    deviceCookieMaxAgeSec: 34560000,
    deviceCookieSecure: false,
    deviceCookieDomain: undefined as string | undefined,
    firebaseProjectId: 'test-project',
    firebaseClientEmail: 'svc@test.iam.gserviceaccount.com',
    firebasePrivateKey: '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----',
  });

  beforeEach(async () => {
    const admin = jest.requireMock<FirebaseAdminTest>('firebase-admin');
    mockSend = admin.__test.mockSend;
    mockApps = admin.__test.mockApps;
    mockSend.mockReset();
    mockSend.mockResolvedValue('message-id-test');
    mockApps.length = 0;

    (AppConfig.getAppConfig as jest.Mock).mockReturnValue(baseConfig());

    repo = {
      findOne: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: getRepositoryToken(DevicePushToken),
          useValue: repo,
        },
      ],
    }).compile();

    service = moduleRef.get(FcmService);
  });

  it('does not call messaging when Firebase env is incomplete', async () => {
    (AppConfig.getAppConfig as jest.Mock).mockReturnValue({
      ...baseConfig(),
      firebaseProjectId: '',
      firebaseClientEmail: '',
      firebasePrivateKey: '',
    });

    await service.sendOrderPlacedNotification(order);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not call messaging when order has no deviceId', async () => {
    await service.sendOrderPlacedNotification({ ...order, deviceId: null });

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not call messaging when no push token row exists', async () => {
    repo.findOne.mockResolvedValue(null);

    await service.sendOrderPlacedNotification(order);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('calls messaging.send with stored FCM token', async () => {
    repo.findOne.mockResolvedValue({
      id: 'tok-row',
      deviceId,
      platform: 'web',
      token: 'fake-fcm-registration-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.sendOrderPlacedNotification(order);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'fake-fcm-registration-token',
        notification: expect.objectContaining({
          title: 'Order placed',
        }),
        data: { orderId: order.orderId, type: 'order_placed' },
      }),
    );
  });

  it('logs and does not throw when send fails', async () => {
    repo.findOne.mockResolvedValue({
      id: 'tok-row',
      deviceId,
      platform: 'web',
      token: 'bad-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockSend.mockRejectedValue(new Error('firebase invalid token'));

    await expect(service.sendOrderPlacedNotification(order)).resolves.toBeUndefined();
  });
});
