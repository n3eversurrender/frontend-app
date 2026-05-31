/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

declare const self: any;

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

void self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  );
}

// ===== Web Push Notification Handlers =====

/**
 * Handle incoming push notifications
 */
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Smart Energy Monitoring';
    const options: any = {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-128x128.png',
      vibrate: [200, 100, 200],
      tag: data.data?.action || 'default',
      renotify: true,
      data: data.data || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    // Fallback jika data bukan JSON
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Smart Energy Monitoring', {
        body: text,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-128x128.png',
      })
    );
  }
});

/**
 * Handle notification click — buka/fokus app saat user tap notifikasi
 */
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList: any[]) => {
        // Jika app sudah terbuka, fokus ke tab tersebut
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Jika belum terbuka, buka tab baru
        return self.clients.openWindow('/');
      })
  );
});

