import React, { useEffect } from 'react'
import { ensureDeviceSession } from '../api/devices.api'
import { registerFcmTokenAndForeground } from './firebase-messaging'

/**
 * Ensures anonymous device HttpOnly cookies exist so orders and FCM can bind to the same device.
 * Then registers FCM (permission, token → backend) when Firebase env is set.
 * Safe to mount once at app root; failures are non-fatal (e.g. offline).
 */
export default function DeviceRegistrationRoot() {
  useEffect(() => {
    void (async () => {
      try {
        await ensureDeviceSession()
      } catch (err: unknown) {
        console.warn('Device session skipped:', err)
      }
      try {
        await registerFcmTokenAndForeground()
      } catch (err: unknown) {
        console.warn('FCM registration skipped:', err)
      }
    })()
  }, [])

  return null
}
