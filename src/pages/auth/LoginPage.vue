<template>
  <div class="login-container">
    <div class="header-text">
      <div class="text-h4">Welcome Back</div>
      <p class="text-body2">Good to have you back! Ready to explore more?</p>
    </div>

    <div class="form-container">
      <!-- Username -->
      <div class="field-group">
        <label class="text-body2"> Username <span class="required">*</span> </label>
        <q-input v-model="username" outlined dense class="input-auth full-width" />
      </div>

      <div class="field-group" style="margin-top: 8px">
        <label class="text-body2"> Password <span class="required">*</span> </label>
        <q-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          outlined
          dense
          class="input-auth full-width"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <span class="forgot-password" @click="goToForgotPassword"> Forgot Password? </span>

        <q-btn label="Log In" class="btn-auth full-width" unelevated @click="submitLogin" />
      </div>
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
const username = ref('');
const password = ref('');
const isPwd = ref(true);

const submitLogin = async (): Promise<void> => {
  if (!username.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: 'Please enter both username and password.',
      position: 'top',
    });
    return;
  }

  $q.loading.show({ message: 'Logging in...' });

  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    });

    if (response.data?.data?.access_token) {
      const token = response.data.data.access_token;
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      $q.notify({
        type: 'positive',
        message: 'Login successful! Welcome.',
        position: 'top',
      });

      void router.push('/home');
    }
  } catch (error: unknown) {
    console.error('Login error', error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError.response?.data?.message || 'Invalid username or password. Please try again.';
    $q.notify({
      type: 'negative',
      message: message,
      position: 'top',
    });
  } finally {
    $q.loading.hide();
  }
};

const goToForgotPassword = (): void => {
  void router.push('/auth/forgot-password');
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #ffffff;
  padding: 24px;
  max-width: 400px;
  margin: 0 auto;
}

.header-text .text-h4 {
  color: #000;
  font-weight: 700;
  line-height: 1.2;
}

.header-text .text-body2 {
  color: #9ca3af;
  line-height: 1.4;
  margin: 4px 0 0 0;
}

.form-container {
  width: 100%;
  margin-top: 75px; /* <- space tambahan dari teks ke inputan */
}

.field-group label {
  color: #6b7280;
  margin-bottom: 4px;
  display: block;
}

.required {
  color: #ef4444;
}

.forgot-password {
  cursor: pointer;
  color: #3b82f6;
  display: block;
  text-align: right;
  margin-top: 2px;
}

.btn-auth {
  height: 56px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: #22b07e;
  color: white;
  text-transform: none;
  margin-top: 30px;
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

.q-field__append .q-icon {
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-top: 0 !important;
  align-self: center !important;
}
</style>
