<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="text-h6 q-ml-sm">Add Household</div>
    </div>

    <q-form @submit.prevent="submitHousehold" class="q-gutter-md">
      <div>
        <label class="text-body2 text-grey-8">Household Name <span class="text-negative">*</span></label>
        <q-input
          v-model="form.name"
          outlined
          dense
          placeholder="e.g. Main House"
          :rules="[(val) => !!val || 'Household name is required']"
        />
      </div>

      <div>
        <label class="text-body2 text-grey-8">Address <span class="text-negative">*</span></label>
        <q-input
          v-model="form.address"
          type="textarea"
          rows="3"
          outlined
          dense
          placeholder="e.g. Jl. Merdeka No. 123"
          :rules="[(val) => !!val || 'Address is required']"
        />
      </div>

      <div>
        <label class="text-body2 text-grey-8">Tariff Class <span class="text-negative">*</span></label>
        <q-select
          v-model="form.tariff_class_id"
          :options="tariffClasses"
          option-label="code"
          option-value="id"
          emit-value
          map-options
          outlined
          dense
          placeholder="Select Tariff Class"
          :rules="[(val) => !!val || 'Tariff class is required']"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.code }}</q-item-label>
                <q-item-label caption>Rp {{ scope.opt.price_per_kwh }}/kWh - {{ scope.opt.type }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="row justify-center q-mt-xl">
        <q-btn
          type="submit"
          label="Save Household"
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
  address: '',
  tariff_class_id: null,
});

const tariffClasses = ref([]);

const fetchData = async () => {
  try {
    const res = await api.get('/tariff-classes');
    if (res.data?.data?.tariff_classes) {
      tariffClasses.value = res.data.data.tariff_classes;
    } else if (res.data?.data?.data) { // Terkadang ada nested structure
      tariffClasses.value = res.data.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch tariff classes', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load tariff classes',
    });
  }
};

onMounted(() => {
  void fetchData();
});

const submitHousehold = async () => {
  try {
    await api.post('/households', {
      name: form.value.name,
      address: form.value.address,
      tariff_class_id: form.value.tariff_class_id,
    });
    
    $q.notify({
      type: 'positive',
      message: 'Household added successfully!',
    });
    
    router.back();
  } catch (error) {
    console.error('Failed to add household', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add household',
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
