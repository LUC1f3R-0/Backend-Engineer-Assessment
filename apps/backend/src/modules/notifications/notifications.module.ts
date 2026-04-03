import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicePushToken } from '../devices/entities/device-push-token.entity';
import { FcmService } from './fcm.service';

@Module({
  imports: [TypeOrmModule.forFeature([DevicePushToken])],
  providers: [FcmService],
  exports: [FcmService],
})
export class NotificationsModule {}
