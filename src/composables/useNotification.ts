import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface NotificationItem {
  id: string;
  type: string;
  notified_user_id: number;
  data: string; // JSON string
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// Global shared reactive states so counts are synchronized across components
const unreadCount = ref(0);
const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);

export function useNotification() {
  async function fetchNotifications(query: Record<string, unknown> = {}) {
    loading.value = true;
    try {
      const response = await api.get('/notifications', { params: query });
      if (response.data && response.data.data) {
        notifications.value = response.data.data.notifications || [];
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await api.get('/notifications', {
        params: { read_at: 'null', limit: 100 },
      });
      if (response.data && response.data.data) {
        unreadCount.value = response.data.data.count || 0;
      }
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
    }
  }

  async function markOneAsRead(id: string) {
    try {
      const response = await api.put(`/notifications/${id}/mark-as-read`);
      if (response.data && response.data.statusCode === 200) {
        const index = notifications.value.findIndex((n) => n.id === id);
        const item = notifications.value[index];
        if (item && !item.read_at) {
          item.read_at = new Date().toISOString();
          if (unreadCount.value > 0) {
            unreadCount.value -= 1;
          }
        }
      }
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-as-read');
      if (response.data && response.data.statusCode === 200) {
        // Update local state
        notifications.value.forEach((n) => {
          if (!n.read_at) {
            n.read_at = new Date().toISOString();
          }
        });
        unreadCount.value = 0;
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markOneAsRead,
    markAllAsRead,
  };
}
