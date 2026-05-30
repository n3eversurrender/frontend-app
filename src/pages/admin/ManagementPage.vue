<template>
  <q-page class="q-pa-md">
    <!-- ===== Header Section ===== -->
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">System Management</div>
        <div class="text-caption text-grey-7">Admin control for core data</div>
      </div>
      <q-btn 
        class="gt-xs"
        unelevated
        icon="add"
        :label="activeTab === 'categories' ? 'Add Category' : 'Add Tariff'"
        style="background-color: #22b07e; color: white; border-radius: 8px; font-weight: 600;"
        @click="openAddDialog" 
      />
    </div>

    <!-- ===== Segmented Tabs ===== -->
    <div class="segment-box q-mt-sm">
      <div class="custom-toggle-wrapper">
        <q-btn
          :class="['custom-tab-btn', { active: activeTab === 'categories' }]"
          unelevated
          no-caps
          label="Device Categories"
          @click="activeTab = 'categories'"
        />
        <q-btn
          :class="['custom-tab-btn', { active: activeTab === 'tariffs' }]"
          unelevated
          no-caps
          label="Tariff Classes"
          @click="activeTab = 'tariffs'"
        />
      </div>
    </div>

    <!-- ===== List Content ===== -->
    <div class="q-mt-md">
      <!-- CATEGORIES TAB -->
      <div v-if="activeTab === 'categories'">
        <div v-if="categories.length === 0" class="text-center q-pa-xl">
          <q-icon name="category" size="64px" color="grey-3" />
          <div class="text-grey-5 q-mt-md">No categories found</div>
        </div>
        <q-list bordered separator class="rounded-borders bg-white shadow-1">
          <q-item v-for="cat in categories" :key="cat.id" class="q-py-md">
            <q-item-section avatar>
              <q-avatar color="green-1" text-color="green-8" icon="category" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-body1">{{ cat.name }}</q-item-label>
              <q-item-label caption class="ellipsis-2-lines">{{
                cat.description || 'No description provided'
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  size="sm"
                  @click="editCategory(cat)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="confirmDeleteCategory(cat)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Pagination Categories -->
        <div class="row justify-center q-mt-md">
          <q-pagination
            v-model="catPage"
            :max="catMaxPages || 1"
            direction-links
            flat
            color="grey-8"
            active-color="primary"
            @update:model-value="fetchData"
          />
        </div>
      </div>

      <!-- TARIFFS TAB -->
      <div v-else>
        <div v-if="tariffs.length === 0" class="text-center q-pa-xl">
          <q-icon name="bolt" size="64px" color="grey-3" />
          <div class="text-grey-5 q-mt-md">No tariff classes found</div>
        </div>
        <q-list bordered separator class="rounded-borders bg-white shadow-1">
          <q-item v-for="tariff in tariffs" :key="tariff.id" class="q-py-md">
            <q-item-section avatar>
              <q-avatar color="orange-1" text-color="orange-8" icon="bolt" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-body1"
                >{{ tariff.code }} - {{ tariff.type }}</q-item-label
              >
              <q-item-label caption>
                Price: <span class="text-weight-bold text-green-8">Rp {{ tariff.price_per_kwh }}</span>/kWh
              </q-item-label>
              <q-item-label v-if="tariff.voltage" caption>
                {{ tariff.voltage }} | {{ tariff.capacity_va }} VA
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  size="sm"
                  @click="editTariff(tariff)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="confirmDeleteTariff(tariff)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Pagination Tariffs -->
        <div class="row justify-center q-mt-md">
          <q-pagination
            v-model="tariffPage"
            :max="tariffMaxPages || 1"
            direction-links
            flat
            color="grey-8"
            active-color="primary"
            @update:model-value="fetchData"
          />
        </div>
      </div>
    </div>

    <!-- Floating Action Button (Mobile Only) -->
    <q-page-sticky position="bottom-right" :offset="[18, 80]" class="lt-sm">
      <q-btn
        fab
        icon="add"
        style="background-color: #22b07e; color: white;"
        @click="openAddDialog"
      />
    </q-page-sticky>

    <!-- ===== Category Dialog ===== -->
    <q-dialog v-model="categoryDialog.show" persistent>
      <q-card style="min-width: 350px; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ categoryDialog.isEdit ? 'Edit Category' : 'Add New Category' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input v-model="categoryDialog.form.name" label="Category Name *" outlined dense class="q-mb-md" />
          <q-input v-model="categoryDialog.form.description" label="Description" outlined dense type="textarea" rows="3" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn 
            unelevated 
            :label="categoryDialog.isEdit ? 'Update' : 'Save'" 
            style="background-color: #22b07e; color: white; min-width: 100px;" 
            @click="saveCategory"
            :loading="categoryDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ===== Tariff Dialog ===== -->
    <q-dialog v-model="tariffDialog.show" persistent>
      <q-card style="min-width: 350px; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ tariffDialog.isEdit ? 'Edit Tariff' : 'Add New Tariff' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input v-model="tariffDialog.form.code" label="Tariff Code (e.g. R-1) *" outlined dense />
            </div>
            <div class="col-12">
              <q-input v-model="tariffDialog.form.type" label="Type (e.g. Residential) *" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="tariffDialog.form.voltage" label="Voltage" outlined dense placeholder="220V" />
            </div>
            <div class="col-6">
              <q-input v-model.number="tariffDialog.form.capacity_va" type="number" label="Capacity (VA)" outlined dense />
            </div>
            <div class="col-12">
              <q-input 
                v-model.number="tariffDialog.form.price_per_kwh" 
                type="number" 
                label="Price per kWh (Rp) *" 
                outlined 
                dense 
                prefix="Rp"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn 
            unelevated 
            :label="tariffDialog.isEdit ? 'Update' : 'Save'" 
            style="background-color: #22b07e; color: white; min-width: 100px;" 
            @click="saveTariff"
            :loading="tariffDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

interface DeviceCategory {
  id: number;
  name: string;
  description?: string;
}

interface TariffClass {
  id: number;
  code: string;
  type: string;
  voltage?: string;
  capacity_va?: number | null;
  price_per_kwh: number;
}

interface CategoryForm {
  id: number | null;
  name: string;
  description: string;
}

interface TariffForm {
  id: number | null;
  code: string;
  type: string;
  voltage: string;
  capacity_va: number | null;
  price_per_kwh: number;
}

const $q = useQuasar();

// ===== State =====
const activeTab = ref<'categories' | 'tariffs'>('categories');
const categories = ref<DeviceCategory[]>([]);
const tariffs = ref<TariffClass[]>([]);

// Pagination State
const catPage = ref(1);
const catTotal = ref(0);
const tariffPage = ref(1);
const tariffTotal = ref(0);
const itemsPerPage = 10;

const catMaxPages = computed(() => Math.ceil(catTotal.value / itemsPerPage));
const tariffMaxPages = computed(() => Math.ceil(tariffTotal.value / itemsPerPage));

const categoryDialog = ref<{
  show: boolean;
  isEdit: boolean;
  loading: boolean;
  form: CategoryForm;
}>({
  show: false,
  isEdit: false,
  loading: false,
  form: {
    id: null,
    name: '',
    description: ''
  }
});

const tariffDialog = ref<{
  show: boolean;
  isEdit: boolean;
  loading: boolean;
  form: TariffForm;
}>({
  show: false,
  isEdit: false,
  loading: false,
  form: {
    id: null,
    code: '',
    type: '',
    voltage: '',
    capacity_va: null,
    price_per_kwh: 0
  }
});

// ===== Fetch Data =====
const fetchData = async () => {
  try {
    const [catRes, tariffRes] = await Promise.all([
      api.get('/device-categories', {
        params: { page: catPage.value, limit: itemsPerPage },
      }),
      api.get('/tariff-classes', {
        params: { page: tariffPage.value, limit: itemsPerPage },
      }),
    ]);

    if (catRes.data?.data) {
      categories.value = catRes.data.data.categories || [];
      catTotal.value = catRes.data.data.count || categories.value.length;
    }

    if (tariffRes.data?.data) {
      tariffs.value = tariffRes.data.data.tariff_classes || [];
      tariffTotal.value = tariffRes.data.data.count || tariffs.value.length;
    }
  } catch (error) {
    console.error('Failed to fetch management data', error);
  }
};

onMounted(() => {
  void fetchData();
});

// ===== Dialog Actions =====
function openAddDialog() {
  if (activeTab.value === 'categories') {
    categoryDialog.value.isEdit = false;
    categoryDialog.value.form = { id: null, name: '', description: '' };
    categoryDialog.value.show = true;
  } else {
    tariffDialog.value.isEdit = false;
    tariffDialog.value.form = { id: null, code: '', type: '', voltage: '', capacity_va: null, price_per_kwh: 0 };
    tariffDialog.value.show = true;
  }
}

// ===== Category Logic =====
function editCategory(cat: DeviceCategory) {
  categoryDialog.value.isEdit = true;
  categoryDialog.value.form = {
    id: cat.id,
    name: cat.name,
    description: cat.description || ''
  };
  categoryDialog.value.show = true;
}

async function saveCategory() {
  if (!categoryDialog.value.form.name) {
    $q.notify({ type: 'warning', message: 'Name is required' });
    return;
  }

  categoryDialog.value.loading = true;
  try {
    if (categoryDialog.value.isEdit) {
      await api.put(`/device-categories/${categoryDialog.value.form.id}`, categoryDialog.value.form);
      $q.notify({ type: 'positive', message: 'Category updated' });
    } else {
      await api.post('/device-categories', categoryDialog.value.form);
      $q.notify({ type: 'positive', message: 'Category created' });
    }
    categoryDialog.value.show = false;
    void fetchData();
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Operation failed' });
  } finally {
    categoryDialog.value.loading = false;
  }
}

function confirmDeleteCategory(cat: DeviceCategory) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${cat.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/device-categories/${cat.id}`);
        $q.notify({ type: 'positive', message: 'Category deleted' });
        void fetchData();
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to delete category' });
      }
    })();
  });
}

// ===== Tariff Logic =====
function editTariff(tariff: TariffClass) {
  tariffDialog.value.isEdit = true;
  tariffDialog.value.form = {
    id: tariff.id,
    code: tariff.code,
    type: tariff.type,
    voltage: tariff.voltage || '',
    capacity_va: tariff.capacity_va || null,
    price_per_kwh: tariff.price_per_kwh
  };
  tariffDialog.value.show = true;
}

async function saveTariff() {
  const { code, type, price_per_kwh } = tariffDialog.value.form;
  if (!code || !type || !price_per_kwh) {
    $q.notify({ type: 'warning', message: 'Required fields missing' });
    return;
  }

  tariffDialog.value.loading = true;
  try {
    if (tariffDialog.value.isEdit) {
      await api.put(`/tariff-classes/${tariffDialog.value.form.id}`, tariffDialog.value.form);
      $q.notify({ type: 'positive', message: 'Tariff updated' });
    } else {
      await api.post('/tariff-classes', tariffDialog.value.form);
      $q.notify({ type: 'positive', message: 'Tariff created' });
    }
    tariffDialog.value.show = false;
    void fetchData();
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Operation failed' });
  } finally {
    tariffDialog.value.loading = false;
  }
}

function confirmDeleteTariff(tariff: TariffClass) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete tariff "${tariff.code}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/tariff-classes/${tariff.id}`);
        $q.notify({ type: 'positive', message: 'Tariff deleted' });
        void fetchData();
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to delete tariff' });
      }
    })();
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

.rounded-borders {
  border-radius: 12px;
  overflow: hidden;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .q-page {
    padding: 12px !important;
  }
  
  .text-h6 {
    font-size: 18px;
  }
}
</style>
