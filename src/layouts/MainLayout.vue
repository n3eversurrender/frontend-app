<template>
  <q-layout view="hHh lpR fFf">
    <!-- Sidebar kiri (hanya tampil di desktop) -->
    <SideNav />

    <!-- Konten halaman -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom navigation (hanya mobile) -->
    <BottomNav v-if="isMobile" />
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import BottomNav from 'src/components/BottomNav/BottomNav.vue';
import SideNav from 'src/components/SideNav/SideNav.vue';
import { computed, onMounted, ref } from 'vue';

const $q = useQuasar();

// Jika width < 768 → dianggap mobile
const isMobile = computed(() => $q.screen.width < 768);

// PWA Install Prompt Logic
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt.value = e as BeforeInstallPromptEvent;

    // Only show if not already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      $q.notify({
        message: 'Experience the app better!',
        caption: 'Install Smart Energy on your device for a faster and smoother experience.',
        color: 'green-8',
        icon: 'download',
        position: 'top',
        timeout: 0,
        actions: [
          {
            label: 'Install',
            color: 'white',
            handler: () => {
              if (deferredPrompt.value) {
                const promptEvent = deferredPrompt.value;
                void promptEvent
                  .prompt()
                  .then(() => {
                    return promptEvent.userChoice;
                  })
                  .then(({ outcome }) => {
                    if (outcome === 'accepted') {
                      console.log('PWA: User accepted the install prompt');
                    }
                    deferredPrompt.value = null;
                  });
              }
            },
          },
          {
            label: 'Later',
            color: 'green-2',
            handler: () => {
              /* dismiss */
            },
          },
        ],
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    // Log install to analytics or similar
    console.log('PWA: App installed');
    deferredPrompt.value = null;
  });
});
</script>

<style scoped>
/* Best practice: Berikan padding bawah pada container agar konten tidak tertutup floating navbar di mobile */
@media (max-width: 767px) {
  :deep(.q-page-container) {
    padding-bottom: 100px !important;
  }
}
</style>
