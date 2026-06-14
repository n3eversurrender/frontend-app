<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="notifications-container q-mx-auto" style="max-width: 800px;">
      <!-- ===== HEADER ===== -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Notifikasi</h1>
          <div class="text-caption text-grey-6">Informasi terbaru, pengingat, dan saran pengoptimalan daya.</div>
        </div>
        <q-btn
          v-if="unreadCount > 0"
          flat
          dense
          color="primary"
          icon="done_all"
          label="Tandai Semua Dibaca"
          no-caps
          class="rounded-borders q-px-sm"
          @click="handleMarkAllAsRead"
        />
      </div>

      <!-- ===== FILTER TABS ===== -->
      <div class="row items-center justify-between q-mb-md">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey-7 bg-white rounded-borders shadow-1"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="all" label="Semua" no-caps />
          <q-tab name="unread" label="Belum Dibaca" no-caps>
            <q-badge v-if="unreadCount > 0" color="red" floating>{{ unreadCount }}</q-badge>
          </q-tab>
          <q-tab name="dss" label="DSS Rekomendasi" no-caps />
        </q-tabs>
      </div>

      <!-- ===== LOADING STATE ===== -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-circle color="primary" size="48px" />
        <div class="text-grey-6 q-mt-sm full-width text-center">Memuat notifikasi...</div>
      </div>

      <template v-else>
        <!-- ===== EMPTY STATE ===== -->
        <q-card
          v-if="filteredNotifications.length === 0"
          flat
          bordered
          class="text-center q-pa-xl bg-white"
          style="border-radius: 16px;"
        >
          <q-card-section>
            <q-avatar size="80px" color="blue-1" text-color="blue-7" class="q-mb-md">
              <q-icon name="notifications_off" size="40px" />
            </q-avatar>
            <div class="text-h6 text-weight-bold text-grey-8">Tidak ada notifikasi</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Semua pemberitahuan dan rekomendasi Anda akan muncul di sini.
            </div>
          </q-card-section>
        </q-card>

        <!-- ===== NOTIFICATION LIST ===== -->
        <div v-else class="column q-gutter-md">
          <transition-group name="list" tag="div" class="column q-gutter-md">
            <q-card
              v-for="notification in filteredNotifications"
              :key="notification.id"
              flat
              bordered
              class="notification-card"
              :class="{ 'notification-card--unread': !notification.read_at }"
              style="border-radius: 16px; border-left: 5px solid;"
              :style="{ 'border-left-color': getTypeConfig(notification.type).color }"
            >
              <q-card-section class="row items-start no-wrap q-pa-md">
                <!-- Icon Avatar -->
                <q-avatar
                  :color="getTypeConfig(notification.type).bgColor"
                  :text-color="getTypeConfig(notification.type).iconColor"
                  size="40px"
                  class="q-mr-md flex-shrink-0"
                >
                  <q-icon :name="getTypeConfig(notification.type).icon" size="22px" />
                </q-avatar>

                <!-- Content Column -->
                <div class="column col justify-center">
                  <div class="row items-center justify-between no-wrap q-mb-xs">
                    <span
                      class="text-caption text-weight-bold text-uppercase tracking-wider"
                      :style="{ color: getTypeConfig(notification.type).iconColor }"
                    >
                      {{ getTypeConfig(notification.type).label }}
                    </span>
                    <span class="text-caption text-grey-5">
                      {{ formatTimeAgo(notification.created_at) }}
                    </span>
                  </div>
                  
                  <div class="text-body2 text-grey-9 text-weight-medium">
                    {{ notification.message }}
                  </div>

                  <!-- Metadata / Details if DSS Recommendation -->
                  <div
                    v-if="notification.type === 'dss_recommendation' && getParsedData(notification.data).deviceId"
                    class="text-caption text-grey-6 q-mt-xs bg-grey-1 q-pa-sm rounded-borders"
                  >
                    Tips ini dihasilkan secara otomatis oleh Decision Support System berdasarkan data logger Anda.
                  </div>

                  <!-- Action Buttons Row -->
                  <div class="row items-center q-gutter-sm q-mt-sm">
                    <!-- Action Link / Button based on Notification Type -->
                    <template v-if="notification.type === 'daily_reminder'">
                      <q-btn
                        unelevated
                        size="sm"
                        color="primary"
                        label="Isi Pemakaian"
                        icon="edit"
                        no-caps
                        class="rounded-borders q-px-sm"
                        to="/usage"
                      />
                    </template>
                    <template v-if="notification.type === 'monthly_reminder' || notification.type === 'report_ready'">
                      <q-btn
                        unelevated
                        size="sm"
                        color="purple-7"
                        label="Unduh Laporan PDF"
                        icon="download"
                        no-caps
                        :loading="downloadingId === notification.id"
                        class="rounded-borders q-px-sm"
                        @click="handleDownloadReport(notification)"
                      />
                    </template>
                    <template v-if="notification.type === 'dss_recommendation'">
                      <q-btn
                        unelevated
                        size="sm"
                        color="amber-9"
                        label="Analisis Device"
                        icon="insights"
                        no-caps
                        class="rounded-borders q-px-sm"
                        to="/usage"
                      />
                    </template>

                    <q-space />

                    <!-- Mark as Read / Delete Action -->
                    <q-btn
                      v-if="!notification.read_at"
                      flat
                      round
                      dense
                      size="sm"
                      color="grey-6"
                      icon="done"
                      class="mark-read-btn"
                      @click="handleMarkAsRead(notification.id)"
                    >
                      <q-tooltip>Tandai dibaca</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </transition-group>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotification, type NotificationItem } from 'src/composables/useNotification';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const {
  notifications,
  unreadCount,
  loading,
  fetchNotifications,
  fetchUnreadCount,
  markOneAsRead,
  markAllAsRead,
} = useNotification();

const activeTab = ref('all');
const downloadingId = ref<string | null>(null);

// Fetch data on mount
onMounted(async () => {
  await fetchNotifications({ limit: 100 });
  await fetchUnreadCount();
});

// Parsed Notifications based on selected tab
const filteredNotifications = computed(() => {
  const list = [...notifications.value];
  
  // Sort by created_at descending
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (activeTab.value === 'unread') {
    return list.filter((n) => !n.read_at);
  } else if (activeTab.value === 'dss') {
    return list.filter((n) => n.type === 'dss_recommendation');
  }
  return list;
});

interface NotificationData {
  deviceId?: number;
  period?: string;
  action?: string;
}

// Parse custom JSON string in notification.data
function getParsedData(dataStr: string): NotificationData {
  if (!dataStr) return {};
  try {
    return JSON.parse(dataStr) as NotificationData;
  } catch {
    return {};
  }
}

// Configs for colors and icons based on notification type
function getTypeConfig(type: string) {
  switch (type) {
    case 'dss_recommendation':
      return {
        label: 'Rekomendasi DSS',
        icon: 'insights',
        color: '#f59e0b', // Amber
        bgColor: 'amber-1',
        iconColor: 'amber-9',
      };
    case 'daily_reminder':
      return {
        label: 'Pengingat Harian',
        icon: 'today',
        color: '#3b82f6', // Blue
        bgColor: 'blue-1',
        iconColor: 'blue-8',
      };
    case 'monthly_reminder':
    case 'report_ready':
      return {
        label: 'Laporan Bulanan',
        icon: 'picture_as_pdf',
        color: '#8b5cf6', // Purple
        bgColor: 'purple-1',
        iconColor: 'purple-8',
      };
    case 'usage_alert':
      return {
        label: 'Peringatan Pemakaian',
        icon: 'warning',
        color: '#ef4444', // Red
        bgColor: 'red-1',
        iconColor: 'red-8',
      };
    default:
      return {
        label: 'Notifikasi Sistem',
        icon: 'info',
        color: '#0d9488', // Teal
        bgColor: 'teal-1',
        iconColor: 'teal-8',
      };
  }
}

// Mark dynamic relative time ago (Indonesian)
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari yang lalu`;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Bulk mark read handler
async function handleMarkAllAsRead() {
  $q.loading.show({ message: 'Menandai semua notifikasi...' });
  await markAllAsRead();
  $q.loading.hide();
  $q.notify({
    type: 'positive',
    message: 'Semua notifikasi ditandai dibaca!',
    position: 'top',
    timeout: 1000,
  });
}

// Single mark read handler
async function handleMarkAsRead(id: string) {
  await markOneAsRead(id);
}

// Monthly Report Downloader integration
async function handleDownloadReport(notification: NotificationItem) {
  const meta = getParsedData(notification.data);
  const period = meta.period || new Date().toLocaleDateString('sv').slice(0, 7);
  
  downloadingId.value = notification.id;
  
  // Calculate first and last day of period
  const parts = period.split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const month = Number(parts[1]) || (new Date().getMonth() + 1);
  const startDate = `${period}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${period}-${String(lastDay).padStart(2, '0')}`;

  try {
    const response = await api.get('/export-report/pdf', {
      params: { startDate, endDate },
      responseType: 'blob',
    });

    const blob = new Blob([response.data as Blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Pemakaian_${startDate}_ke_${endDate}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Laporan berhasil diunduh!',
      icon: 'check_circle',
      position: 'top',
    });

    // Mark as read after downloading report automatically
    if (!notification.read_at) {
      await markOneAsRead(notification.id);
    }
  } catch (err) {
    console.error('Failed to download report PDF', err);
    $q.notify({
      type: 'negative',
      message: 'Gagal mengunduh laporan bulanan. Coba lagi nanti.',
      icon: 'error',
      position: 'top',
    });
  } finally {
    downloadingId.value = null;
  }
}
</script>

<style scoped>
.notification-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

.notification-card--unread {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.mark-read-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.mark-read-btn:hover {
  opacity: 1;
  background: #f1f5f9;
}

/* Animations for listing item transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
