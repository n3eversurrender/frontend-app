<template>
  <q-page class="q-pa-md" style="background: #ffffff; min-height: 100vh;">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <q-btn flat round dense icon="arrow_back" color="black" @click="goBack" />
      <div class="text-h6 text-weight-bold q-ml-sm">Change Password</div>
    </div>

    <!-- Form -->
    <q-form @submit="submitChangePassword" class="q-gutter-md q-mt-md">
      <!-- Old Password -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-xs" style="color: #6b7280;">
          Current Password <span class="text-red">*</span>
        </div>
        <q-input
          v-model="form.old_password"
          outlined
          dense
          :type="showOld ? 'text' : 'password'"
          placeholder="Enter your current password"
          :rules="[val => !!val || 'Current password is required', val => val.length >= 8 || 'Minimum 8 characters']"
          class="custom-input"
        >
          <template #append>
            <q-icon
              :name="showOld ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showOld = !showOld"
            />
          </template>
        </q-input>
      </div>

      <!-- New Password -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-xs" style="color: #6b7280;">
          New Password <span class="text-red">*</span>
        </div>
        <q-input
          v-model="form.new_password"
          outlined
          dense
          :type="showNew ? 'text' : 'password'"
          placeholder="Enter your new password (min. 8 characters)"
          :rules="[val => !!val || 'New password is required', val => val.length >= 8 || 'Minimum 8 characters']"
          class="custom-input"
        >
          <template #append>
            <q-icon
              :name="showNew ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showNew = !showNew"
            />
          </template>
        </q-input>
      </div>

      <!-- Confirm New Password -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-xs" style="color: #6b7280;">
          Confirm New Password <span class="text-red">*</span>
        </div>
        <q-input
          v-model="form.new_password_confirmation"
          outlined
          dense
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Re-enter your new password"
          :rules="[
            val => !!val || 'Please confirm your new password',
            val => val === form.new_password || 'Passwords do not match'
          ]"
          class="custom-input"
        >
          <template #append>
            <q-icon
              :name="showConfirm ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirm = !showConfirm"
            />
          </template>
        </q-input>
      </div>

      <!-- Submit Button -->
      <div class="row justify-center q-mt-xl">
        <q-btn
          type="submit"
          label="Update Password"
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

const router = useRouter();
const $q = useQuasar();
const loading = ref(false);

const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const form = ref({
  old_password: '',
  new_password: '',
  new_password_confirmation: ''
});

function goBack() {
  void router.push('/edit-profile');
}

const submitChangePassword = async () => {
  loading.value = true;
  try {
    await api.put('/users/change-password', {
      old_password: form.value.old_password,
      new_password: form.value.new_password,
      new_password_confirmation: form.value.new_password_confirmation
    });

    $q.notify({
      type: 'positive',
      message: 'Password updated successfully',
      position: 'top'
    });

    void router.push('/profile');
  } catch (error: unknown) {
    const axiosErr = error as { response?: { data?: { message?: string } } };
    const msg = axiosErr.response?.data?.message || 'Failed to update password';
    $q.notify({
      type: 'negative',
      message: msg,
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
