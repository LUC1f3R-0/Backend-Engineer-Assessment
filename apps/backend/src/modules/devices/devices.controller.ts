import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { DevicesService } from './devices.service';

const HDR_DEVICE_SECRET = 'x-device-secret';

@ApiTags('devices')
@ApiSecurity('x-api-key')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get('session')
  @ApiOperation({ summary: 'Ensure anonymous device session (HttpOnly cookies); call on app load' })
  async session(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ deviceId: string }> {
    const r = await this.devicesService.ensureSession(req, res);
    return { deviceId: r.deviceId };
  }

  @Put('push-token')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Register or update FCM push token (anonymous device via ensureSession + HttpOnly cookies; same bootstrap as orders)',
  })
  upsertPushTokenCookie(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: Record<string, unknown>,
  ): ReturnType<DevicesService['upsertPushTokenFromCookies']> {
    const token = typeof body.token === 'string' ? body.token : '';
    const platform = typeof body.platform === 'string' ? body.platform : 'web';
    return this.devicesService.upsertPushTokenFromCookies(req, res, token, platform);
  }

  @Delete('push-token')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Remove push token for the current anonymous device (ensureSession + HttpOnly cookies; same bootstrap as orders)',
  })
  deletePushTokenCookie(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): ReturnType<DevicesService['deletePushTokenFromCookies']> {
    return this.devicesService.deletePushTokenFromCookies(req, res);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a device identity (legacy; prefer GET /devices/session for browser cookies)' })
  register(): Promise<{ deviceId: string; deviceSecret: string }> {
    return this.devicesService.registerDevice();
  }

  @Put(':deviceId/push-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Register or update push token for this device (FCM token string later)' })
  upsertPushToken(
    @Param('deviceId') deviceId: string,
    @Headers(HDR_DEVICE_SECRET) deviceSecret: string | undefined,
    @Body() body: Record<string, unknown>,
  ): ReturnType<DevicesService['upsertPushToken']> {
    const token = typeof body.token === 'string' ? body.token : '';
    const platform = typeof body.platform === 'string' ? body.platform : 'web';
    return this.devicesService.upsertPushToken(deviceId, deviceSecret, token, platform);
  }

  @Delete(':deviceId/push-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove stored push token for this device' })
  async deletePushToken(
    @Param('deviceId') deviceId: string,
    @Headers(HDR_DEVICE_SECRET) deviceSecret: string | undefined,
  ): Promise<void> {
    await this.devicesService.deletePushToken(deviceId, deviceSecret);
  }
}
