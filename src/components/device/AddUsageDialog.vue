<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card class="add-usage-dialog">
      <!-- ===== Header ===== -->
      <q-card-section class="dialog-header row items-center q-pb-sm">
        <div class="dialog-header-icon q-mr-sm">
          <q-icon name="bolt" size="20px" color="white" />
        </div>
        <div>
          <div class="text-subtitle1 text-weight-bold text-white">
            {{ isEditMode ? 'Edit Usage' : 'Add Usage' }}
          </div>
          <div class="text-caption device-name-label">{{ device.name }}</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" color="white" size="sm" @click="closeDialog" />
      </q-card-section>

      <!-- ===== Form ===== -->
      <q-card-section class="q-pt-md q-pb-sm q-px-lg">
        <q-form ref="formRef" @submit.prevent="submitForm">
          <!-- Device Name (read-only info) -->
          <div class="info-row q-mb-md">
            <q-icon name="devices" size="16px" color="green-7" class="q-mr-xs" />
            <span class="text-caption text-grey-7">Device</span>
            <span class="text-caption text-weight-medium q-ml-auto">{{ device.name }}</span>
          </div>

          <!-- Usage Date -->
          <div class="form-label q-mb-xs">
            <q-icon name="calendar_today" size="14px" class="q-mr-xs" />
            Usage Date
          </div>
          <q-input
            v-model="form.usage_date"
            outlined
            dense
            type="date"
            placeholder="YYYY-MM-DD"
            class="q-mb-md usage-input"
            :rules="[(val) => !!val || 'Usage date is required']"
            lazy-rules
          />

          <!-- Usage Hours -->
          <div class="form-label q-mb-xs">
            <q-icon name="schedule" size="14px" class="q-mr-xs" />
            Usage Hours
          </div>
          <q-input
            v-model.number="form.usage_hours"
            outlined
            dense
            type="number"
            placeholder="e.g. 5"
            step="0.5"
            class="q-mb-md usage-input"
            :rules="[
              (val) =>
                (val !== null && val !== '' && val !== undefined) || 'Usage hours is required',
              (val) => Number(val) > 0 || 'Usage hours must be greater than 0',
            ]"
            lazy-rules
          >
            <template #append>
              <span class="text-caption text-grey-6">hrs</span>
            </template>
          </q-input>

          <!-- Estimated kWh preview -->
          <div v-if="estimatedKwh > 0" class="kwh-preview q-mb-md">
            <q-icon name="electric_bolt" size="14px" color="green-7" class="q-mr-xs" />
            <span class="text-caption text-grey-7">Est. consumption:</span>
            <span class="text-caption text-weight-bold text-green-8 q-ml-xs">
              {{ estimatedKwh.toFixed(2) }} kWh
            </span>
          </div>
        </q-form>
      </q-card-section>

      <!-- ===== Actions ===== -->
      <q-card-actions class="q-px-lg q-pb-lg q-pt-xs" align="right">
        <q-btn
          flat
          label="Cancel"
          no-caps
          color="grey-7"
          class="cancel-btn"
          @click="closeDialog"
          :disable="loading"
        />
        <q-btn
          unelevated
          :label="isEditMode ? 'Update Usage' : 'Save Usage'"
          no-caps
          icon="check"
          class="save-btn"
          :loading="loading"
          @click="submitForm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar, type QForm } from 'quasar';
import { useDeviceUsage } from 'src/composables/useDeviceUsage';
import { computed, ref, watch } from 'vue';

// ===== Props & Emits =====
export interface Device {
  id: number;
  name: string;
  wattage: number;
  household_id: number;
  is_active: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  device: Device;
  usageToEdit?: {
    id: number;
    usage_date: string;
    usage_hours: number;
  } | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'usage-added': [];
  'usage-updated': [];
}>();

// ===== Composable =====
const { loading, createUsage, updateUsage } = useDeviceUsage();
const $q = useQuasar();
const formRef = ref<QForm | null>(null);

const isEditMode = computed(() => !!props.usageToEdit);

// ===== Dialog state =====
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// ===== Form =====
const today = new Date().toLocaleDateString('sv').slice(0, 10);

const form = ref({
  usage_date: today,
  usage_hours: null as number | null,
});

// Reset form when dialog opens
watch(
  () => props.modelValue,
  (opened) => {
    if (opened) {
      if (props.usageToEdit) {
        form.value = {
          usage_date: props.usageToEdit.usage_date.slice(0, 10),
          usage_hours: props.usageToEdit.usage_hours,
        };
      } else {
        form.value = {
          usage_date: today,
          usage_hours: null,
        };
      }
      formRef.value?.resetValidation();
    }
  },
);

// ===== Estimated kWh =====
const estimatedKwh = computed(() => {
  if (!form.value.usage_hours || form.value.usage_hours <= 0) return 0;
  return (props.device.wattage * form.value.usage_hours) / 1000;
});

// ===== Actions =====
function closeDialog() {
  dialogOpen.value = false;
}

async function submitForm() {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;

  let result;
  if (isEditMode.value && props.usageToEdit) {
    result = await updateUsage(props.device.id, props.usageToEdit.id, {
      usage_date: form.value.usage_date,
      usage_hours: Number(form.value.usage_hours),
    });
  } else {
    result = await createUsage(props.device.id, {
      usage_date: form.value.usage_date,
      usage_hours: Number(form.value.usage_hours),
    });
  }

  if (result.success) {
    if (isEditMode.value) {
      emit('usage-updated');
    } else {
      emit('usage-added');
    }
    closeDialog();
  } else {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: result.message,
      position: 'top',
      timeout: 4000,
    });
  }
}

// No alias needed
</script>

<style scoped>
.add-usage-dialog {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #22b07e 0%, #1a8f65 100%);
  padding: 16px 20px;
}

.dialog-header-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-name-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  margin-top: 1px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
}

.usage-input :deep(.q-field__control) {
  border-radius: 10px;
}

.usage-input :deep(.q-field__control:hover) {
  border-color: #22b07e;
}

.usage-input :deep(.q-field__control.text-negative) {
  border-color: #c10015;
}

.info-row {
  display: flex;
  align-items: center;
  background: #f5fdf9;
  border: 1px solid #d1f0e4;
  border-radius: 8px;
  padding: 8px 12px;
  gap: 4px;
}

.kwh-preview {
  display: flex;
  align-items: center;
  background: #f0fff8;
  border: 1px solid #c8eedd;
  border-radius: 8px;
  padding: 8px 12px;
}

.cancel-btn {
  border-radius: 8px;
  padding: 6px 16px;
}

.save-btn {
  background: linear-gradient(135deg, #22b07e 0%, #1a8f65 100%);
  color: white;
  border-radius: 8px;
  padding: 6px 20px;
  font-weight: 600;
  min-width: 120px;
  transition: all 0.2s ease;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 176, 126, 0.35);
}

/* Mobile responsiveness */
@media (max-width: 599px) {
  .add-usage-dialog {
    max-width: 100%;
    margin: 16px;
    border-radius: 12px;
  }
}
</style>
