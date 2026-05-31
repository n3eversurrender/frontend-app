import { ref } from 'vue';
import { api } from 'src/boot/axios';

const isPushSupported = ref(false);
const isPushSubscribed = ref(false);
const pushLoading = ref(false);

/**
 * Convert VAPID public key dari base64url ke Uint8Array
 * Diperlukan oleh PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  /**
   * Cek apakah browser mendukung Push Notification
   */
  function checkSupport(): boolean {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    isPushSupported.value = supported;
    return supported;
  }

  /**
   * Cek apakah user sudah subscribe push notification
   */
  async function checkSubscription(): Promise<boolean> {
    if (!checkSupport()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      isPushSubscribed.value = !!subscription;
      return !!subscription;
    } catch (error) {
      console.error('Failed to check push subscription:', error);
      return false;
    }
  }

  /**
   * Subscribe ke push notification
   * 1. Minta izin notifikasi dari user
   * 2. Subscribe ke PushManager dengan VAPID public key
   * 3. Kirim subscription ke backend
   */
  async function subscribeToPush(): Promise<boolean> {
    if (!checkSupport()) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    pushLoading.value = true;

    try {
      // 1. Minta izin notifikasi
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // 2. Dapatkan service worker registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Cek apakah sudah subscribe
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Sudah subscribe, kirim ulang ke backend untuk memastikan tersimpan
        await sendSubscriptionToServer(existingSubscription);
        isPushSubscribed.value = true;
        return true;
      }

      // 4. Subscribe baru dengan VAPID public key
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not found in environment variables');
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      // 5. Kirim subscription ke backend
      await sendSubscriptionToServer(subscription);
      isPushSubscribed.value = true;
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    } finally {
      pushLoading.value = false;
    }
  }

  /**
   * Unsubscribe dari push notification
   */
  async function unsubscribeFromPush(): Promise<boolean> {
    pushLoading.value = true;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Hapus dari backend
        try {
          await api.delete('/notifications/push/unsubscribe', {
            data: { endpoint: subscription.endpoint },
          });
        } catch (error) {
          console.warn('Failed to unsubscribe from server:', error);
        }

        // Unsubscribe dari browser
        await subscription.unsubscribe();
      }

      isPushSubscribed.value = false;
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    } finally {
      pushLoading.value = false;
    }
  }

  /**
   * Kirim subscription data ke backend
   */
  async function sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    const subscriptionJSON = subscription.toJSON();
    await api.post('/notifications/push/subscribe', {
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys?.p256dh,
        auth: subscriptionJSON.keys?.auth,
      },
    });
  }

  return {
    isPushSupported,
    isPushSubscribed,
    pushLoading,
    checkSupport,
    checkSubscription,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
