<template>
  <div class="register-container">
    <div class="header-text">
      <div class="text-h4">Create Account</div>
      <p class="text-body2">Create your account and start discovering what’s possible.</p>
    </div>

    <div class="form-container">
      <!-- Name -->
      <div class="field-group">
        <label class="text-body2"> Full Name <span class="required">*</span> </label>
        <q-input v-model="name" outlined dense class="input-auth full-width" />
      </div>

      <!-- Username -->
      <div class="field-group">
        <label class="text-body2"> Username <span class="required">*</span> </label>
        <q-input v-model="username" outlined dense class="input-auth full-width" />
      </div>

      <!-- Email -->
      <div class="field-group" style="margin-top: 8px">
        <label class="text-body2"> Email <span class="required">*</span> </label>
        <q-input v-model="email" outlined dense class="input-auth full-width" />
      </div>

      <!-- Password -->
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
      </div>

      <!-- Confirm Password -->
      <div class="field-group" style="margin-top: 8px">
        <label class="text-body2"> Confirm Password <span class="required">*</span> </label>
        <q-input
          v-model="confirmPassword"
          :type="isConfirmPwd ? 'password' : 'text'"
          outlined
          dense
          class="input-auth full-width"
        >
          <template v-slot:append>
            <q-icon
              :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isConfirmPwd = !isConfirmPwd"
            />
          </template>
        </q-input>
      </div>

      <q-btn
        label="Register"
        class="btn-auth full-width"
        unelevated
        :loading="isSubmitting"
        :disable="isSubmitting"
        @click="submitRegister"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const $q = useQuasar();

const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const isPwd = ref(true);
const isConfirmPwd = ref(true);
const isSubmitting = ref(false);

const submitRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    $q.notify({
      type: 'negative',
      message: 'Name, email, and password are required',
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Password and confirmation must match',
    });
    return;
  }

  isSubmitting.value = true;

  try {
    await api.post('/auth/register', {
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
    });

    $q.notify({
      type: 'positive',
      message: 'Registration successful, please login',
    });

    void router.push('/auth/login');
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string | string[] } } }).response?.data
        ?.message || 'Failed to register, please try again';

    $q.notify({
      type: 'negative',
      message: Array.isArray(message) ? message.join(', ') : message,
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.register-container {
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
  margin-top: 75px;
}

.field-group label {
  color: #6b7280;
  margin-bottom: 4px;
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
