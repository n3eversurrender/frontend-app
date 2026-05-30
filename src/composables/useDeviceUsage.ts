import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface CreateDeviceUsagePayload {
  usage_date: string;
  usage_hours: number;
}

export interface DeviceUsage {
  id: number;
  device_id: number;
  usage_date: string;
  usage_hours: number;
  estimated_kwh: number;
  created_at: string;
}

export function useDeviceUsage() {
  const loading = ref(false);

  async function createUsage(
    deviceId: number,
    payload: CreateDeviceUsagePayload
  ): Promise<{ success: boolean; message: string; data?: DeviceUsage }> {
    loading.value = true;
    try {
      const response = await api.post(`/devices/${deviceId}/device-usages`, payload);
      return {
        success: true,
        message: response.data?.message ?? 'Usage recorded successfully',
        data: response.data?.data as DeviceUsage,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err.response?.data?.message ?? err.message ?? 'Failed to record usage';
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  }

  async function fetchUsages(deviceId: number) {
    loading.value = true;
    try {
      const response = await api.get(`/devices/${deviceId}/device-usages`);
      return {
        success: true,
        data: (response.data?.data?.device_usages ?? []) as DeviceUsage[],
      };
    } catch {
      return { success: false, data: [] as DeviceUsage[] };
    } finally {
      loading.value = false;
    }
  }

  async function updateUsage(
    deviceId: number,
    usageId: number,
    payload: CreateDeviceUsagePayload
  ): Promise<{ success: boolean; message: string; data?: DeviceUsage }> {
    loading.value = true;
    try {
      const response = await api.put(`/devices/${deviceId}/device-usages/${usageId}`, payload);
      return {
        success: true,
        message: response.data?.message ?? 'Usage updated successfully',
        data: response.data?.data as DeviceUsage,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err.response?.data?.message ?? err.message ?? 'Failed to update usage';
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  }

  async function deleteUsage(
    deviceId: number,
    usageId: number
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true;
    try {
      const response = await api.delete(`/devices/${deviceId}/device-usages/${usageId}`);
      return {
        success: true,
        message: response.data?.message ?? 'Usage deleted successfully',
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err.response?.data?.message ?? err.message ?? 'Failed to delete usage';
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    createUsage,
    fetchUsages,
    updateUsage,
    deleteUsage
  };
}
