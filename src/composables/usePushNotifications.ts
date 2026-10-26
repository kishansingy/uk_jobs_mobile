import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { deviceApi } from '@/api'

export async function registerPushNotifications() {
  // Only runs in native Capacitor context (Android/iOS)
  if (!Capacitor.isNativePlatform()) return

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  // Send token to backend when received
  PushNotifications.addListener('registration', async (token) => {
    try {
      await deviceApi.register(token.value, Capacitor.getPlatform())
    } catch { /* non-fatal */ }
  })

  // Handle foreground notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification.title)
  })

  // Handle tap on notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data as Record<string, string>
    // Deep-link routing based on notification payload
    if (data?.type === 'job_alert' && data?.job_id) {
      window.location.hash = `#/jobs/${data.job_id}`
    } else if (data?.type === 'application') {
      window.location.hash = '#/tools/alerts'
    }
  })
}
