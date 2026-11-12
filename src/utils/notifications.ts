export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Notification permission error:', err);
    return false;
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        badge: '/icon.png',
        icon: '/icon.png',
        ...options,
      });
    } catch (err) {
      console.warn('Failed to display browser notification:', err);
    }
  }
}
