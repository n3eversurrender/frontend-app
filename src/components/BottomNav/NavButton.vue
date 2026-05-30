<template>
  <q-btn flat class="nav-btn" @click="goTo" :class="{ active: isActive }">
    <q-icon :name="icon" size="28px" :style="{ opacity: isActive ? '1' : '0.5' }" color="white" />
  </q-btn>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const props = defineProps<{
  icon: string;
  to: string;
}>();

const router = useRouter();
const route = useRoute();

const goTo = () => {
  void router.push(props.to); // FIX ERROR ESLINT
};

const isActive = computed(() => route.path === props.to);
</script>

<style scoped>
.nav-btn {
  min-width: 70px;
  display: flex;
  justify-content: center;
  transition: 0.2s;
}

.active {
  transform: scale(1.1);
}
</style>
