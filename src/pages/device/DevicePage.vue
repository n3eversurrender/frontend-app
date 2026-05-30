<template>
  <!-- Add Usage Dialog -->
  <AddUsageDialog
    v-if="selectedDevice"
    v-model="showAddUsageDialog"
    :device="selectedDevice"
    @usage-added="onUsageAdded"
  />
  <q-page class="q-pa-md">
    <!-- ===== Title + Add Button ===== -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6 text-weight-bold">Home Management</div>

      <!-- Button for Desktop/Tablet (Hidden on Mobile) -->
      <q-btn 
        class="gt-xs"
        unelevated
        icon="add"
        label="Add"
        style="background-color: #22b07e; color: white; border-radius: 8px; font-weight: 600;"
        @click="goToAdd" 
      />
    </div>

    <!-- ===== Segmented Control (Households | Devices) ===== -->
    <div class="segment-box q-mt-sm">
      <div class="custom-toggle-wrapper">
        <q-btn
          :class="['custom-tab-btn', { active: activeTab === 'households' }]"
          unelevated
          no-caps
          label="Households"
          @click="activeTab = 'households'"
        />
        <q-btn
          :class="['custom-tab-btn', { active: activeTab === 'devices' }]"
          unelevated
          no-caps
          label="Devices"
          @click="activeTab = 'devices'"
        />
      </div>
    </div>

    <!-- ===== Tab Content ===== -->
    <div class="q-mt-md">
      <!-- HOUSEHOLDS TAB -->
      <div v-if="activeTab === 'households'">
        <div v-if="households.length === 0" class="text-center q-pa-lg">
          <q-icon name="home" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm text-body2">No households yet</div>
          <q-btn
            flat
            color="primary"
            label="Add your first household"
            size="sm"
            class="q-mt-sm"
            @click="goToAdd"
          />
        </div>

        <div v-else class="row q-col-gutter-sm">
          <div v-for="household in households" :key="household.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="household-card" flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="row items-center justify-between q-mb-xs">
                  <div
                    class="text-subtitle2 text-weight-medium ellipsis"
                    style="max-width: calc(100% - 40px)"
                  >
                    {{ household.name }}
                  </div>
                  <q-btn flat round dense icon="more_vert" size="xs" color="grey-7">
                    <q-menu>
                      <q-list style="min-width: 120px">
                        <q-item clickable v-close-popup @click="editHousehold(household)">
                          <q-item-section avatar>
                            <q-icon name="edit" size="xs" />
                          </q-item-section>
                          <q-item-section>Edit</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="deleteHousehold(household)">
                          <q-item-section avatar>
                            <q-icon name="delete" size="xs" color="negative" />
                          </q-item-section>
                          <q-item-section class="text-negative">Delete</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>

                <div class="q-mb-xs">
                  <div class="row items-start q-gutter-x-xs">
                    <q-icon name="location_on" size="14px" color="grey-6" class="q-mt-xs" />
                    <div class="text-grey-7 text-caption" style="flex: 1; line-height: 1.3">
                      {{ household.address }}
                    </div>
                  </div>
                </div>

                <div class="row items-center justify-between q-mt-sm">
                  <div class="tariff-badge-small">
                    <q-icon name="bolt" size="12px" />
                    <span class="q-ml-xs">{{ getTariffCode(household.tariff_class_id) }}</span>
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ getDeviceCount(household.id) }} devices
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- DEVICES TAB -->
      <div v-else>
        <div v-if="devices.length === 0" class="text-center q-pa-lg">
          <q-icon name="devices" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm text-body2">No devices yet</div>
          <q-btn
            flat
            color="primary"
            label="Add your first device"
            size="sm"
            class="q-mt-sm"
            @click="goToAdd"
          />
        </div>

        <div v-else class="q-gutter-y-sm">
          <DeviceCard
            v-for="device in devices"
            :key="device.id"
            :device="device"
            :household-name="getHouseholdName(device.household_id)"
            @add-usage="openAddUsageDialog"
            @toggle="toggleDevice"
            @edit="editDevice"
            @delete="deleteDevice"
          />
        </div>
      </div>
    </div>

    <!-- ===== Floating Action Button (Mobile Only) ===== -->
    <q-page-sticky position="bottom-right" :offset="[18, 80]" class="lt-sm">
      <q-btn
        fab
        icon="add"
        style="background-color: #22b07e; color: white;"
        @click="goToAdd"
        label="Add"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import DeviceCard from 'src/components/device/DeviceCard.vue';
import AddUsageDialog from 'src/components/device/AddUsageDialog.vue';

const router = useRouter();
const $q = useQuasar();

// ===== TypeScript Interfaces =====
interface Household {
  id: number;
  name: string;
  address: string;
  tariff_class_id: number;
  device_count?: number;
}

interface TariffClass {
  id: number;
  code: string;
  type: string;
  price_per_kwh: number;
}

interface Device {
  id: number;
  name: string;
  wattage: number;
  household_id: number;
  is_active: boolean;
}

const activeTab = ref<'households' | 'devices'>('households');

const households = ref<Household[]>([]);
const devices = ref<Device[]>([]);
const tariffClasses = ref<TariffClass[]>([]);

// ===== Add Usage Dialog State =====
const showAddUsageDialog = ref(false);
const selectedDevice = ref<Device | null>(null);

function openAddUsageDialog(device: Device) {
  selectedDevice.value = device;
  showAddUsageDialog.value = true;
}

function onUsageAdded() {
  // Refresh device data after a usage is recorded
  void fetchData();
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: 'Usage recorded! Analytics updated.',
    position: 'top',
    timeout: 2500,
  });
}

const fetchData = async () => {
  try {
    const [houseRes, devRes, tariffRes] = await Promise.all([
      api.get('/households'),
      api.get('/devices'),
      api.get('/tariff-classes')
    ]);
    
    if (tariffRes.data?.data?.tariff_classes) {
      tariffClasses.value = tariffRes.data.data.tariff_classes;
    } else if (tariffRes.data?.data?.data) {
      tariffClasses.value = tariffRes.data.data.data;
    }

    if (houseRes.data?.data?.households) {
      households.value = houseRes.data.data.households;
    }
    if (devRes.data?.data?.devices) {
      devices.value = devRes.data.data.devices;
    }
  } catch (error) {
    console.error('Failed to fetch data', error);
  }
};

onMounted(() => {
  void fetchData();
});

function goToAdd() {
  if (activeTab.value === 'households') {
    void router.push('/add-household');
  } else {
    void router.push('/add-device');
  }
}

function getHouseholdName(householdId: number): string {
  const household = households.value.find((h) => h.id === householdId);
  return household ? household.name : 'Unknown';
}

function getTariffCode(tariffId: number): string {
  if (!tariffId) return 'No Tariff';
  const tariff = tariffClasses.value.find(t => t.id === tariffId);
  return tariff ? tariff.code : 'No Tariff';
}

function getDeviceCount(householdId: number): number {
  return devices.value.filter(d => d.household_id === householdId).length;
}

function toggleDevice(device: Device) {
  const newStatus = !device.is_active;
  api
    .put(`/devices/${device.id}`, { is_active: newStatus })
    .then(() => {
      device.is_active = newStatus;
    })
    .catch((error) => {
      console.error('Toggle device failed:', error);
      $q.notify({ type: 'negative', message: 'Failed to update device status' });
    });
}

function editHousehold(household: Household) {
  console.log('Edit household:', household);
  void router.push(`/edit-household/${household.id}`);
}

function deleteHousehold(household: Household) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete ${household.name}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    api.delete(`/households/${household.id}`)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Household deleted' });
        void fetchData();
      })
      .catch((error) => {
        console.error(error);
        $q.notify({ type: 'negative', message: 'Failed to delete household' });
      });
  });
}

function editDevice(device: Device) {
  console.log('Edit device:', device);
  void router.push(`/edit-device/${device.id}`);
}

function deleteDevice(device: Device) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete "${device.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    api.delete(`/devices/${device.id}`)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Device deleted' });
        void fetchData();
      })
      .catch((error) => {
        console.error(error);
        $q.notify({ type: 'negative', message: 'Failed to delete device' });
      });
  });
}
</script>

<style scoped>
.segment-box {
  background: #f4f4f4;
  border-radius: 22px;
  padding: 4px;
}

.custom-toggle-wrapper {
  display: flex;
  gap: 4px;
}

.custom-tab-btn {
  flex: 1;
  background-color: transparent;
  color: #9e9e9e;
  border-radius: 18px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 13px;
  padding: 8px 12px;
}

.custom-tab-btn.active {
  background-color: #22b07e !important;
  color: white !important;
}

.household-card {
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.household-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tariff-badge-small {
  display: inline-flex;
  align-items: center;
  background: #fff3e0;
  color: #f57c00;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.device-card {
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.device-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chip-small {
  font-size: 10px;
  padding: 2px 6px;
  height: 20px;
}

.chip-small :deep(.q-icon) {
  font-size: 12px;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .q-page {
    padding: 12px !important;
  }

  .text-h6 {
    font-size: 18px;
  }

  .household-card {
    margin-bottom: 8px;
  }

  .device-card {
    margin-bottom: 8px;
  }
}
</style>
