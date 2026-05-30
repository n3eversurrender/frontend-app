<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="text-h6 q-ml-sm">Add Device</div>
    </div>

    <q-form @submit.prevent="submitDevice" class="q-gutter-md">
      <div>
        <label class="text-body2 text-grey-8">Device Name <span class="text-negative">*</span></label>
        <q-input
          v-model="form.name"
          outlined
          dense
          placeholder="e.g. Living Room AC"
          :rules="[(val) => !!val || 'Device name is required']"
        />
      </div>

      <div>
        <label class="text-body2 text-grey-8">Wattage (W) <span class="text-negative">*</span></label>
        <q-input
          v-model.number="form.wattage"
          type="number"
          outlined
          dense
          placeholder="e.g. 750"
          :rules="[(val) => val > 0 || 'Wattage must be greater than 0']"
        />
      </div>

      <div>
        <label class="text-body2 text-grey-8">Device Category <span class="text-negative">*</span></label>
        <q-select
          v-model="form.category_id"
          :options="categories"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          outlined
          dense
          placeholder="Select Category"
          :rules="[(val) => !!val || 'Category is required']"
        />
      </div>

      <div>
        <label class="text-body2 text-grey-8">Household <span class="text-negative">*</span></label>
        <q-select
          v-model="form.household_id"
          :options="households"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          outlined
          dense
          placeholder="Select Household"
          :rules="[(val) => !!val || 'Household is required']"
        />
      </div>

      <div class="row justify-center q-mt-xl">
        <q-btn
          type="submit"
          label="Save Device"
          unelevated
          class="col-12 col-sm-8 col-md-6"
          style="background-color: #22b07e; color: white; border-radius: 12px; font-weight: 600; padding: 12px 0;"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

const form = ref({
  name: '',
  wattage: null,
  category_id: null,
  household_id: null,
});

const categories = ref([]);
const households = ref([]);

const fetchData = async () => {
  try {
    const [catRes, houseRes] = await Promise.all([
      api.get('/device-categories'),
      api.get('/households'),
    ]);
    
    if (catRes.data?.data?.categories) {
      categories.value = catRes.data.data.categories;
    }
    
    if (houseRes.data?.data?.households) {
      households.value = houseRes.data.data.households;
    }
  } catch (error) {
    console.error('Failed to fetch data', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load options',
    });
  }
};

onMounted(() => {
  void fetchData();
});

const submitDevice = async () => {
  try {
    await api.post('/devices', {
      name: form.value.name,
      wattage: form.value.wattage,
      category_id: form.value.category_id,
      household_id: form.value.household_id,
      is_active: true
    });
    
    $q.notify({
      type: 'positive',
      message: 'Device added successfully!',
    });
    
    router.back();
  } catch (error) {
    console.error('Failed to add device', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add device',
    });
  }
};
</script>

<style scoped>
.q-page {
  max-width: 600px;
  margin: 0 auto;
}
</style>
