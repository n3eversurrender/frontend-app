<template>
  <q-page class="q-pa-md" style="background: #ffffff; min-height: 100vh;">
    <!-- ===== Header ===== -->
    <div class="row items-center q-mb-xl">
      <q-btn flat round dense icon="arrow_back" color="black" @click="goBack" />
      <div class="text-h6 text-weight-bold q-ml-sm">Edit Profile</div>
    </div>

    <!-- ===== Form ===== -->
    <q-form @submit="submitProfile" class="q-gutter-md q-mt-md">
      <!-- Name -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-xs" style="color: #6b7280;">
          Full Name <span class="text-red">*</span>
        </div>
        <q-input
          v-model="form.name"
          outlined
          dense
          placeholder="Enter your full name"
          :rules="[val => !!val || 'Name is required']"
          class="custom-input"
        />
      </div>

      <!-- Username (Read Only) -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-xs" style="color: #6b7280;">
          Username
        </div>
        <q-input
          v-model="form.username"
          outlined
          dense
          readonly
          class="custom-input bg-grey-2"
        />
        <div class="text-caption text-grey-5 q-mt-xs">
          <q-icon name="info" size="12px" /> Username cannot be changed
        </div>
      </div>

      <!-- Email (Read Only) -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-xs" style="color: #6b7280;">
          Email Address
        </div>
        <q-input
          v-model="form.email"
          outlined
          dense
          readonly
          class="custom-input bg-grey-2"
        />
        <div class="text-caption text-grey-5 q-mt-xs">
          <q-icon name="info" size="12px" /> Email address cannot be changed
        </div>
      </div>

      <!-- Submit Button -->
      <div class="row justify-center q-mt-xl">
        <q-btn
          type="submit"
          label="Save Changes"
          unelevated
          class="col-12 col-sm-8 col-md-6"
          style="background-color: #22b07e; color: white; border-radius: 12px; font-weight: 600; padding: 12px 0;"
          :loading="loading"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuth, type UserData } from 'src/composables/useAuth';

const router = useRouter();
const $q = useQuasar();
const { getUser } = useAuth();

const loading = ref(false);

const form = ref({
  name: '',
  username: '',
  email: '',
  role: 0,
  is_active: true
});

onMounted(() => {
  // Pre-fill form with current user data
  const currentUser = getUser();
  if (currentUser) {
    // Note: If 'name' is not available in local storage, we'll try to fetch it
    form.value.name = currentUser.name || currentUser.username || '';
    form.value.username = currentUser.username || '';
    form.value.email = currentUser.email || '';
    form.value.role = currentUser.role ?? 0;
    form.value.is_active = currentUser.is_active ?? true;
    
    // Fetch fresh profile data to ensure we have the exact 'name' field
    void fetchProfile();
  }
});

const fetchProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data?.data) {
      const serverUser = response.data.data;
      form.value.name = serverUser.name || serverUser.username;
      form.value.username = serverUser.username;
      form.value.email = serverUser.email;
      form.value.role = serverUser.role;
      form.value.is_active = serverUser.is_active;
    }
  } catch (error) {
    console.error('Failed to fetch latest profile:', error);
  }
};

function goBack() {
  void router.push('/profile');
}

const submitProfile = async () => {
  loading.value = true;
  try {
    // API Call to update user
    await api.put('/users', {
      name: form.value.name,
      role: form.value.role,
      is_active: form.value.is_active
    });
    
    // Update local storage so the new name is instantly visible
    const currentUser = getUser() as UserData;
    if (currentUser) {
      currentUser.name = form.value.name;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top'
    });
    
    void router.push('/profile');
  } catch (error) {
    console.error('Failed to update profile:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.custom-input :deep(.q-field__control) {
  border-radius: 12px;
}
</style>
