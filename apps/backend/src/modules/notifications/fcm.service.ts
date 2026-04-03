import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import admin from 'firebase-admin';
import { Repository } from 'typeorm';
import { getAppConfig } from '../../config/app.config';
import { DevicePushToken } from '../devices/entities/device-push-token.entity';

/** Minimal order fields needed for FCM (avoids circular imports with OrdersService). */
export type OrderPlacedNotification = {
  orderId: string;
  deviceId: string | null;
  totalAmount: string;
};

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(
    @InjectRepository(DevicePushToken)
    private readonly pushTokens: Repository<DevicePushToken>,
  ) {}

  private ensureFirebaseApp(): admin.app.App | null {
    const cfg = getAppConfig();
    const { firebaseProjectId, firebaseClientEmail, firebasePrivateKey } = cfg;
    if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
      this.logger.warn(
        'FCM: Firebase Admin credentials missing (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY); push send disabled',
      );
      return null;
    }
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseProjectId,
          clientEmail: firebaseClientEmail,
          privateKey: firebasePrivateKey,
        }),
      });
      this.logger.log('FCM: Firebase Admin initialized');
    }
    return admin.app();
  }

  /**
   * Sends a web push for a newly placed order. Never throws: failures are logged only
   * so order creation is never affected.
   */
  async sendOrderPlacedNotification(order: OrderPlacedNotification): Promise<void> {
    try {
      const app = this.ensureFirebaseApp();
      if (!app) {
        return;
      }

      const { orderId, deviceId, totalAmount } = order;
      if (!deviceId) {
        this.logger.log(`FCM: skip — order ${orderId} has no deviceId`);
        return;
      }

      const row = await this.pushTokens.findOne({ where: { deviceId } });
      if (!row?.token?.trim()) {
        this.logger.log(`FCM: skip — no push token stored for device ${deviceId}`);
        return;
      }

      this.logger.log(`FCM: sending order_placed for order ${orderId} (device ${deviceId})`);

      const messageId = await admin.messaging().send({
        token: row.token.trim(),
        notification: {
          title: 'Order placed',
          body: `Your order is pending. Total: ${totalAmount}`,
        },
        data: {
          orderId,
          type: 'order_placed',
        },
      });

      this.logger.log(`FCM: send succeeded for order ${orderId} (messageId=${messageId})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`FCM: send failed for order ${order.orderId} — ${msg}`);
    }
  }
}
