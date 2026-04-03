import { httpClient } from './http-client'

function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data
  }
  throw new Error('Unexpected API response shape')
}

export type DeviceSessionResponse = {
  deviceId: string
}

/**
 * Ensures HttpOnly device cookies exist; call once at app load (before orders / FCM).
 */
export async function ensureDeviceSession(): Promise<DeviceSessionResponse> {
  const res = await httpClient.get<unknown>('/api/devices/session')
  return unwrapData<DeviceSessionResponse>(res.data)
}

/** Register or update FCM token for the current cookie-bound device. */
export async function upsertPushToken(token: string, platform = 'web'): Promise<void> {
  await httpClient.put('/api/devices/push-token', { token, platform })
}

export async function deletePushToken(): Promise<void> {
  await httpClient.delete('/api/devices/push-token')
}
