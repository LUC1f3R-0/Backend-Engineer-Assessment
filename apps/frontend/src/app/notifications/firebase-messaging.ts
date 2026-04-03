import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { upsertPushToken } from '../api/devices.api'

function readFirebaseOptions(): FirebaseOptions | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null
  }
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }
}

let fcmOnce: Promise<void> | null = null

/**
 * After device session cookies exist: request notification permission, register SW, get FCM token,
 * POST token to backend, and subscribe to foreground messages.
 * No-ops when config is incomplete, messaging unsupported, or permission denied.
 */
export function registerFcmTokenAndForeground(): Promise<void> {
  if (fcmOnce) {
    return fcmOnce
  }
  fcmOnce = runFcm()
  return fcmOnce
}

async function runFcm(): Promise<void> {
  const options = readFirebaseOptions()
  const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined)?.trim()
  if (!options || !vapidKey) {
    return
  }
  if (!(await isSupported())) {
    return
  }
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  const app = getApps().length ? getApp() : initializeApp(options)
  const messaging = getMessaging(app)

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') {
    return
  }

  let registration: ServiceWorkerRegistration
  try {
    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    await registration.update()
  } catch {
    return
  }

  let token: string
  try {
    token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })
  } catch {
    return
  }
  if (!token) {
    return
  }

  try {
    await upsertPushToken(token, 'web')
  } catch {
    return
  }

  onMessage(messaging, (payload) => {
    const n = payload.notification
    if (!n?.title || Notification.permission !== 'granted') {
      return
    }
    new Notification(n.title, {
      body: n.body,
      icon: typeof n.icon === 'string' ? n.icon : undefined,
    })
  })
}
