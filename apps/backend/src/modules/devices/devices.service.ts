import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import { Repository } from 'typeorm';
import {
  appendDeviceSessionCookies,
  DEVICE_COOKIE_ID,
  DEVICE_COOKIE_SECRET,
  parseCookieHeader,
} from './device-cookie.util';
import { DevicePushToken } from './entities/device-push-token.entity';
import { Device } from './entities/device.entity';

const SECRET_HEX_LENGTH = 64;

function hashDeviceSecret(plain: string): string {
  return createHash('sha256').update(plain, 'utf8').digest('hex');
}

function safeEqualStrings(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export type RegisterDeviceResponse = {
  deviceId: string;
  deviceSecret: string;
};

export type PushTokenResponse = {
  deviceId: string;
  platform: string;
  updatedAt: Date;
};

export type DeviceSessionResult = {
  deviceId: string;
  deviceSecret: string;
};

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly devices: Repository<Device>,
    @InjectRepository(DevicePushToken)
    private readonly pushTokens: Repository<DevicePushToken>,
  ) {}

  async registerDevice(): Promise<RegisterDeviceResponse> {
    const deviceSecret = randomBytes(32).toString('hex');
    if (deviceSecret.length !== SECRET_HEX_LENGTH) {
      throw new BadRequestException('Unexpected secret length');
    }
    const secretHash = hashDeviceSecret(deviceSecret);
    const row = this.devices.create({ secretHash });
    const saved = await this.devices.save(row);
    return { deviceId: saved.id, deviceSecret };
  }

  /**
   * Validates HttpOnly device cookies or creates a new device and sets cookies.
   * Refreshes cookie Max-Age when the session is valid.
   */
  async ensureSession(req: Request, res: Response): Promise<DeviceSessionResult> {
    const cookies = parseCookieHeader(req.headers.cookie);
    const id = cookies[DEVICE_COOKIE_ID];
    const secret = cookies[DEVICE_COOKIE_SECRET];
    if (id && secret && isUuid(id) && secret.length === SECRET_HEX_LENGTH) {
      try {
        const device = await this.getDeviceByIdOrThrow(id);
        this.verifyDeviceSecret(device, secret);
        appendDeviceSessionCookies(res, id, secret);
        return { deviceId: id, deviceSecret: secret };
      } catch {
        /* invalid or stale cookie — create new device below */
      }
    }
    const created = await this.registerDevice();
    appendDeviceSessionCookies(res, created.deviceId, created.deviceSecret);
    return created;
  }

  /**
   * Browser push-token routes: same semantics as POST /orders — run ensureSession so a missing Cookie
   * header (first visit or before cookies apply) still binds the token to the device created/refreshed here.
   */
  async upsertPushTokenFromCookies(
    req: Request,
    res: Response,
    token: string,
    platform: string,
  ): Promise<PushTokenResponse> {
    const trimmed = token?.trim();
    if (!trimmed) {
      throw new BadRequestException('token is required');
    }
    const { deviceId, deviceSecret } = await this.ensureSession(req, res);
    return this.upsertPushToken(deviceId, deviceSecret, trimmed, platform);
  }

  async deletePushTokenFromCookies(req: Request, res: Response): Promise<void> {
    const { deviceId, deviceSecret } = await this.ensureSession(req, res);
    return this.deletePushToken(deviceId, deviceSecret);
  }

  private async getDeviceByIdOrThrow(deviceId: string): Promise<Device> {
    if (!isUuid(deviceId)) {
      throw new BadRequestException('Invalid device id');
    }
    const d = await this.devices.findOne({ where: { id: deviceId } });
    if (!d) {
      throw new NotFoundException('Device not found');
    }
    return d;
  }

  private verifyDeviceSecret(device: Device, plainSecret: string): void {
    if (!plainSecret || typeof plainSecret !== 'string') {
      throw new UnauthorizedException('Missing device secret');
    }
    if (plainSecret.length !== SECRET_HEX_LENGTH) {
      throw new UnauthorizedException('Invalid device secret');
    }
    const h = hashDeviceSecret(plainSecret);
    if (!safeEqualStrings(h, device.secretHash)) {
      throw new UnauthorizedException('Invalid device secret');
    }
  }

  async upsertPushToken(
    deviceId: string,
    deviceSecret: string | undefined,
    token: string,
    platform: string,
  ): Promise<PushTokenResponse> {
    const trimmed = token?.trim();
    if (!trimmed) {
      throw new BadRequestException('token is required');
    }
    const plat = (platform ?? 'web').trim().slice(0, 32) || 'web';
    const device = await this.getDeviceByIdOrThrow(deviceId);
    this.verifyDeviceSecret(device, deviceSecret);

    const existing = await this.pushTokens.findOne({ where: { deviceId } });
    if (existing) {
      existing.token = trimmed;
      existing.platform = plat;
      const saved = await this.pushTokens.save(existing);
      return { deviceId, platform: saved.platform, updatedAt: saved.updatedAt };
    }
    const created = this.pushTokens.create({
      deviceId,
      token: trimmed,
      platform: plat,
    });
    const saved = await this.pushTokens.save(created);
    return { deviceId, platform: saved.platform, updatedAt: saved.updatedAt };
  }

  async deletePushToken(deviceId: string, deviceSecret: string | undefined): Promise<void> {
    const device = await this.getDeviceByIdOrThrow(deviceId);
    this.verifyDeviceSecret(device, deviceSecret);
    await this.pushTokens.delete({ deviceId });
  }
}
