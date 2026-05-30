<template>
  <div class="bottom-nav-wrapper">
    <div class="bottom-nav bottom-nav-bg">
      <NavButton icon="home" to="/home" />
      <NavButton v-if="!isUserAdmin" icon="bar_chart" to="/usage" />
      <NavButton v-if="!isUserAdmin" icon="devices" to="/device" />
      <NavButton v-if="isUserAdmin" icon="settings_suggest" to="/management" />
      <NavButton icon="person" to="/profile" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from 'src/composables/useAuth';
import NavButton from './NavButton.vue';

const { isAdmin } = useAuth();
const isUserAdmin = isAdmin();
</script>

<style scoped>
/* Background hijau */
.bottom-nav-bg {
  background-color: #22b07e !important;
}

/* Membuat navbar melayang */
.bottom-nav-wrapper {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 450px;
  z-index: 1000;
}

/* Container rounded */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 6px;
  border-radius: 30px;
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.15);
  height: 60px;
}
</style>
