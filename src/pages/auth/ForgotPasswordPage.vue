<template>
  <div class="forgot-container">
    <!-- Back to Login Button -->
    <q-btn
      flat
      round
      dense
      icon="arrow_back"
      color="grey-7"
      class="q-mb-md self-start"
      @click="goToLogin"
    />

    <div class="header-text">
      <div class="text-h4 text-weight-bold">Reset Password</div>
      <p class="text-body2 text-grey-6 q-mt-xs">
        {{
          step === 1
            ? 'Verify your identity to reset your account password.'
            : 'Choose a strong new password for your account.'
        }}
      </p>
    </div>

    <!-- Step 1: Verification -->
    <div v-if="step === 1" class="form-container q-mt-lg">
      <div class="field-group q-mb-md">
        <label class="text-body2 text-weight-medium text-grey-8"> Username <span class="required">*</span> </label>
        <q-input
          v-model="username"
          outlined
          dense
          placeholder="Enter your username"
          class="input-auth full-width"
        />
      </div>

      <div class="field-group q-mb-lg">
        <label class="text-body2 text-weight-medium text-grey-8"> Email Address <span class="required">*</span> </label>
        <q-input
          v-model="email"
          type="email"
          outlined
          dense
          placeholder="Enter your registered email"
          class="input-auth full-width"
        />
      </div>

      <q-btn
        label="Verify Identity"
        class="btn-auth full-width q-mt-md"
        unelevated
        :loading="loading"
        @click="verifyIdentity"
      />
    </div>

    <!-- Step 2: New Password -->
    <div v-else class="form-container q-mt-lg">
      <div class="field-group q-mb-md">
        <label class="text-body2 text-weight-medium text-grey-8"> New Password <span class="required">*</span> </label>
        <q-input
          v-model="newPassword"
          :type="isPwd ? 'password' : 'text'"
          outlined
          dense
          placeholder="Min. 6 characters"
          class="input-auth full-width"
        >
          <template #append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>

      <div class="field-group q-mb-lg">
        <label class="text-body2 text-weight-medium text-grey-8"> Confirm New Password <span class="required">*</span> </label>
        <q-input
          v-model="confirmPassword"
          :type="isConfirmPwd ? 'password' : 'text'"
          outlined
          dense
          placeholder="Repeat your password"
          class="input-auth full-width"
        >
          <template #append>
            <q-icon
              :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isConfirmPwd = !isConfirmPwd"
            />
          </template>
        </q-input>
      </div>

      <q-btn
        label="Reset Password"
        class="btn-auth full-width q-mt-md"
        unelevated
        :loading="loading"
        @click="submitResetPassword"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

// State
const step = ref(1);
const loading = ref(false);
const username = ref('');
const email = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isPwd = ref(true);
const isConfirmPwd = ref(true);

const goToLogin = (): void => {
  void router.push('/auth/login');
};

const verifyIdentity = async (): Promise<void> => {
  if (!username.value || !email.value) {
    $q.notify({
      type: 'warning',
      message: 'Please enter both username and email.',
      position: 'top',
    });
    return;
  }

  loading.value = true;
  try {
    const response = await api.post('/auth/forgot-password/verify', {
      username: username.value,
      email: email.value,
    });

    if (response.data) {
      $q.notify({
        type: 'positive',
        message: 'Identity verified. Please set your new password.',
        position: 'top',
      });
      step.value = 2;
    }
  } catch (error) {
    console.error('Verification error', error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message = axiosError.response?.data?.message || 'Verification failed. Please check your username and email.';
    $q.notify({
      type: 'negative',
      message: message,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const submitResetPassword = async (): Promise<void> => {
  if (!newPassword.value || !confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: 'Please fill out all password fields.',
      position: 'top',
    });
    return;
  }

  if (newPassword.value.length < 6) {
    $q.notify({
      type: 'warning',
      message: 'Password must be at least 6 characters.',
      position: 'top',
    });
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: 'Passwords do not match.',
      position: 'top',
    });
    return;
  }

  loading.value = true;
  try {
    const response = await api.post('/auth/forgot-password/reset', {
      username: username.value,
      email: email.value,
      newPassword: newPassword.value,
    });

    if (response.data) {
      $q.notify({
        type: 'positive',
        message: 'Password has been reset successfully! Redirecting to login...',
        position: 'top',
      });
      setTimeout(() => {
        void router.push('/auth/login');
      }, 1500);
    }
  } catch (error) {
    console.error('Reset password error', error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message = axiosError.response?.data?.message || 'Reset password failed. Please try again.';
    $q.notify({
      type: 'negative',
      message: message,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #ffffff;
  padding: 24px;
  max-width: 400px;
  margin: 0 auto;
  min-height: 100vh;
  justify-content: center;
}

.header-text {
  width: 100%;
}

.header-text .text-h4 {
  color: #000;
  font-weight: 700;
  line-height: 1.2;
}

.form-container {
  width: 100%;
}

.field-group label {
  margin-bottom: 6px;
  display: block;
}

.required {
  color: #ef4444;
}

.btn-auth {
  height: 56px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: #22b07e;
  color: white;
  text-transform: none;
}

.input-auth {
  border-radius: 16px;
}

.input-auth :deep(.q-field__control) {
  height: 56px;
  border-radius: 16px;
}

.input-auth :deep(.q-field__native) {
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
