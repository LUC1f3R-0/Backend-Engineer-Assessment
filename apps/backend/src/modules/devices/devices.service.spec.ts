import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createHash } from 'crypto';

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: jest.fn().mockReturnValue(Buffer.alloc(32, 2)),
  };
});

jest.mock('../../config/app.config', () => ({
  loadEnv: jest.fn(),
  getAppConfig: jest.fn(() => ({
    nodeEnv: 'test',
    port: 8080,
    xApiKey: '',
    swaggerEnabled: false,
    corsOrigins: [],
    isCloudRun: false,
    deviceCookieMaxAgeSec: 34560000,
    deviceCookieSecure: false,
    deviceCookieDomain: undefined,
    firebaseProjectId: '',
    firebaseClientEmail: '',
    firebasePrivateKey: '',
  })),
}));

import { DevicePushToken } from './entities/device-push-token.entity';
import { Device } from './entities/device.entity';
import { DevicesService } from './devices.service';

function hashDeviceSecret(plain: string): string {
  return createHash('sha256').update(plain, 'utf8').digest('hex');
}

describe('DevicesService — browser push-token uses ensureSession (no cookie required on request)', () => {
  let service: DevicesService;
  let devicesRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let pushTokensRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };

  const deviceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const expectedPlainSecret = Buffer.alloc(32, 2).toString('hex');
  const expectedSecretHash = hashDeviceSecret(expectedPlainSecret);

  beforeEach(async () => {
    devicesRepo = {
      create: jest.fn((row) => row),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    pushTokensRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((row) => row),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: getRepositoryToken(Device), useValue: devicesRepo },
        { provide: getRepositoryToken(DevicePushToken), useValue: pushTokensRepo },
      ],
    }).compile();

    service = moduleRef.get(DevicesService);
  });

  it('upsertPushTokenFromCookies with no Cookie header creates a device and stores the push token', async () => {
    devicesRepo.save.mockResolvedValue({ id: deviceId, secretHash: expectedSecretHash });
    devicesRepo.findOne.mockResolvedValue({ id: deviceId, secretHash: expectedSecretHash });
    pushTokensRepo.findOne.mockResolvedValue(null);
    pushTokensRepo.save.mockImplementation(async (row) => ({
      ...row,
      updatedAt: new Date(),
    }));

    const req = { headers: {} } as import('express').Request;
    const res = { append: jest.fn() } as unknown as import('express').Response;

    const result = await service.upsertPushTokenFromCookies(req, res, 'fcm-token-value', 'web');

    expect(result.deviceId).toBe(deviceId);
    expect(result.platform).toBe('web');
    expect(devicesRepo.save).toHaveBeenCalled();
    expect(pushTokensRepo.save).toHaveBeenCalled();
    expect(res.append).toHaveBeenCalled();
  });

  it('rejects empty token before touching the database session', async () => {
    const req = { headers: {} } as import('express').Request;
    const res = { append: jest.fn() } as unknown as import('express').Response;

    await expect(service.upsertPushTokenFromCookies(req, res, '   ', 'web')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(devicesRepo.save).not.toHaveBeenCalled();
  });
});
