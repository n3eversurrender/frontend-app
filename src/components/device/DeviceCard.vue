<template>
  <q-card :class="['device-card', { 'device-inactive': !device.is_active }]" flat bordered>
    <q-card-section class="row items-center q-pa-sm">
      <!-- Device Icon -->
      <div class="col-auto q-mr-sm">
        <q-avatar :color="device.is_active ? 'green-1' : 'grey-3'" text-color="white" size="44px">
          <q-icon
            :name="deviceIcon"
            :color="device.is_active ? 'positive' : 'grey-6'"
            size="22px"
          />
        </q-avatar>
      </div>

      <!-- Device Info -->
      <div class="col">
        <div class="text-subtitle2 text-weight-medium ellipsis">{{ device.name }}</div>
        <div class="text-caption text-grey-7 ellipsis" style="font-size: 11px">
          {{ householdName }}
        </div>
        <div class="row items-center q-gutter-x-xs q-mt-xs">
          <q-chip
            dense
            size="sm"
            icon="flash_on"
            color="orange-1"
            text-color="orange-8"
            class="chip-small"
          >
            {{ device.wattage }}W
          </q-chip>
          <q-chip
            dense
            size="sm"
            :color="device.is_active ? 'green-1' : 'grey-3'"
            :text-color="device.is_active ? 'positive' : 'grey-7'"
            class="chip-small"
          >
            {{ device.is_active ? 'Active' : 'Inactive' }}
          </q-chip>
        </div>
      </div>

      <!-- Add Usage Button -->
      <div class="col-auto q-mr-xs">
        <q-btn
          unelevated
          no-caps
          icon="add"
          label="Add Usage"
          size="xs"
          class="add-usage-btn"
          :disable="!device.is_active"
          @click.stop="emit('add-usage', device)"
        />
      </div>

      <!-- Toggle -->
      <div class="col-auto col-toggle">
        <q-toggle
          :model-value="device.is_active"
          color="positive"
          size="sm"
          @update:model-value="emit('toggle', device)"
        />
      </div>

      <!-- More Options -->
      <div class="col-auto q-ml-xs">
        <q-btn flat round dense icon="more_vert" size="xs" color="grey-7">
          <q-menu>
            <q-list style="min-width: 120px">
              <q-item clickable v-close-popup @click="emit('edit', device)">
                <q-item-section avatar>
                  <q-icon name="edit" size="xs" />
                </q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="emit('delete', device)">
                <q-item-section avatar>
                  <q-icon name="delete" size="xs" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// ===== Interfaces =====
export interface Device {
  id: number;
  name: string;
  wattage: number;
  household_id: number;
  is_active: boolean;
}

// ===== Props & Emits =====
const props = defineProps<{
  device: Device;
  householdName?: string;
}>();

const emit = defineEmits<{
  'add-usage': [device: Device];
  toggle: [device: Device];
  edit: [device: Device];
  delete: [device: Device];
}>();

// ===== Computed =====
const householdName = computed(() => props.householdName ?? 'Unknown');

const deviceIcon = computed(() => {
  const name = props.device.name.toLowerCase();
  if (name.includes('ac') || name.includes('air conditioner')) return 'ac_unit';
  if (name.includes('tv') || name.includes('television')) return 'tv';
  if (name.includes('fridge') || name.includes('refrigerator')) return 'kitchen';
  if (name.includes('computer') || name.includes('pc')) return 'computer';
  if (name.includes('light') || name.includes('lamp')) return 'lightbulb';
  if (name.includes('fan')) return 'mode_fan';
  if (name.includes('washer') || name.includes('washing')) return 'local_laundry_service';
  if (name.includes('heater') || name.includes('water heater')) return 'water_drop';
  return 'power';
});
</script>

<style scoped>
.device-card {
  border-radius: 10px;
  transition: all 0.25s ease;
  border: 1px solid #e0e0e0;
}

.device-card:hover {
  box-shadow: 0 4px 16px rgba(34, 176, 126, 0.1);
  border-color: #b2dfcf;
}

.device-inactive {
  opacity: 0.65;
  background-color: #fcfcfc;
  filter: grayscale(0.4);
}

.device-inactive .col,
.device-inactive .col-auto:not(.col-toggle) {
  pointer-events: none;
}

.device-inactive :deep(.add-usage-btn) {
  background: #bbb !important;
}

.add-usage-btn {
  background: linear-gradient(135deg, #22b07e, #1a8f65);
  color: white;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  transition: all 0.2s ease;
}

.add-usage-btn :deep(.q-btn__content) {
  gap: 2px;
}

.add-usage-btn :deep(.q-icon) {
  margin-right: 0;
}

.add-usage-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.chip-small {
  font-size: 10px;
  padding: 2px 6px;
  height: 20px;
}

.chip-small :deep(.q-icon) {
  font-size: 12px;
}
</style>
