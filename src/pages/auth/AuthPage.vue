<template>
  <div class="q-pa-md flex flex-center" style="min-height: 100vh">
    <div class="grid grid-cols-1 grid-rows-5 gap-6 w-full" style="max-width: 400px">
      <!-- Bagian Logo + Nama -->
      <div class="flex flex-col items-center justify-center q-mb-lg">
        <q-avatar size="75px">
          <img src="/icons/LOGO VOLTARIS.webp" />
        </q-avatar>
        <div class="text-h2 q-mt-sm text-bold" style="color: #0b4c44">Voltaris</div>
      </div>

      <!-- Welcome text -->
      <div
        class="flex items-center justify-center text-center text-subtitle1 q-px-md"
        style="color: #797d81"
      >
        Your smart companion for tracking energy and saving money.
      </div>

      <!-- Tombol -->
      <div class="flex flex-col justify-center q-gutter-md q-mt-xl q-px-md">
        <!-- LOGIN BUTTON -->
        <q-btn
          label="Login"
          class="btn-auth full-width"
          :style="{ backgroundColor: '#22B07E', color: 'white' }"
          @click="goToLogin"
        />

        <!-- REGISTER BUTTON -->
        <q-btn
          label="Register"
          class="btn-auth full-width"
          flat
          :style="{
            backgroundColor: 'white',
            color: '#797d81',
            border: '2px solid #ddd',
          }"
          @click="goToRegister"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-auth {
  height: 50px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
}
</style>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
  void router.push('/auth/login');
};

const goToRegister = () => {
  void router.push('/auth/register');
};
</script>
