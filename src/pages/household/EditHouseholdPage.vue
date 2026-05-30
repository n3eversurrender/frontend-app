<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="text-h6 q-ml-sm">Edit Household</div>
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
          label="Update Household"
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
import { useRouter, useRoute } from 'vue-router';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const form = ref({
  name: '',
  address: '',
  tariff_class_id: null,
});

const tariffClasses = ref([]);
const householdId = String(route.params.id);

const fetchData = async () => {
  try {
    const res = await api.get('/tariff-classes');
    if (res.data?.data?.tariff_classes) {
      tariffClasses.value = res.data.data.tariff_classes;
    } else if (res.data?.data?.data) {
      tariffClasses.value = res.data.data.data;
    }

    const houseRes = await api.get(`/households/${householdId}`);
    const household = houseRes.data?.data;
    if (household) {
      form.value.name = household.name;
      form.value.address = household.address;
      form.value.tariff_class_id = household.tariff_class_id;
    }
  } catch (error) {
    console.error('Failed to fetch data', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load data',
    });
  }
};

onMounted(() => {
  void fetchData();
});

const submitHousehold = async () => {
  try {
    await api.put(`/households/${householdId}`, {
      name: form.value.name,
      address: form.value.address,
      tariff_class_id: form.value.tariff_class_id,
    });
    
    $q.notify({
      type: 'positive',
      message: 'Household updated successfully!',
    });
    
    router.back();
  } catch (error) {
    console.error('Failed to update household', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update household',
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
