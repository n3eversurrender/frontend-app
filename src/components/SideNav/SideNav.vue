<template>
  <q-drawer
    v-model="drawerOpen"
    side="left"
    bordered
    :mini="miniState"
    :width="200"
    :mini-width="60"
    :breakpoint="768"
    :behavior="isMobile ? 'mobile' : 'desktop'"
    class="bg-white column"
  >
    <!-- Top Section -->
    <q-list>
      <!-- Toggle Button -->
      <q-item clickable v-ripple @click="miniState = !miniState">
        <q-item-section avatar>
          <q-icon name="menu" />
        </q-item-section>
        <q-item-section>Voltaris</q-item-section>
      </q-item>

      <q-separator class="q-my-sm" />

      <q-item clickable v-ripple to="/home">
        <q-item-section avatar>
          <q-icon name="home" />
        </q-item-section>
        <q-item-section>Home</q-item-section>
      </q-item>

      <q-item v-if="!isUserAdmin" clickable v-ripple to="/usage">
        <q-item-section avatar>
          <q-icon name="bar_chart" />
        </q-item-section>
        <q-item-section>Usage</q-item-section>
      </q-item>

      <q-item v-if="!isUserAdmin" clickable v-ripple to="/device">
        <q-item-section avatar>
          <q-icon name="devices" />
        </q-item-section>
        <q-item-section>Device</q-item-section>
      </q-item>

      <q-item v-if="isUserAdmin" clickable v-ripple to="/management">
        <q-item-section avatar>
          <q-icon name="settings_suggest" />
        </q-item-section>
        <q-item-section>Management</q-item-section>
      </q-item>

      <q-item clickable v-ripple to="/profile">
        <q-item-section avatar>
          <q-icon name="person" />
        </q-item-section>
        <q-item-section>Profile</q-item-section>
      </q-item>
    </q-list>

    <!-- Spacer -->
    <q-space />

    <!-- Bottom Section -->
    <q-list>
      <q-separator class="q-my-sm" />

      <q-item clickable v-ripple to="/notifications">
        <q-item-section avatar>
          <q-icon name="notifications">
            <q-badge v-if="notificationCount > 0" floating color="red">
              {{ notificationCount }}
            </q-badge>
          </q-icon>
        </q-item-section>
        <q-item-section>Notifications</q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="handleLogout">
        <q-item-section avatar>
          <q-icon name="logout" color="red" />
        </q-item-section>
        <q-item-section class="text-red">Logout</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuth } from 'src/composables/useAuth';
import { useNotification } from 'src/composables/useNotification';

const $q = useQuasar();
const { logout, isAdmin } = useAuth();
const isUserAdmin = isAdmin();

const { unreadCount, fetchUnreadCount } = useNotification();

const isMobile = computed(() => $q.screen.width < 768);
// Default: tutup di mobile, buka di desktop
const drawerOpen = ref($q.screen.width >= 768);
const miniState = ref(true);

// Notification count mapped to active backend unread count
const notificationCount = computed(() => unreadCount.value);

onMounted(() => {
  if (!isUserAdmin) {
    void fetchUnreadCount();
  }
});

function handleLogout() {
  void $q
    .dialog({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      cancel: true,
      persistent: true,
    })
    .onOk(() => {
      logout();
    });
}
</script>
