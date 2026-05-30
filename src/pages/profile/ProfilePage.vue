<template>
  <q-page class="profile-page">
    <!-- Header Title -->
    <div class="q-pa-md">
      <div class="text-h6 text-weight-bold text-center">My Account</div>
    </div>

    <!-- Profile Section -->
    <div class="profile-section text-center q-py-lg">
      <div class="profile-avatar-wrapper">
        <q-avatar size="120px" class="profile-avatar">
          <img :src="profileImageUrl" />
        </q-avatar>
        <q-btn
          round
          size="sm"
          color="warning"
          icon="photo_camera"
          class="camera-btn"
          unelevated
          @click="triggerFileInput"
        />

        <!-- Hidden File Input -->
        <input
          type="file"
          ref="fileInputRef"
          style="display: none"
          accept="image/*"
          @change="onFileSelected"
        />
      </div>

      <div class="text-h6 text-weight-medium q-mt-md">{{ displayName }}</div>
      <div class="text-body2 text-grey-6 q-mt-xs">{{ displayEmail }}</div>
    </div>

    <!-- Menu List -->
    <q-list class="menu-list q-px-md">
      <q-item clickable v-ripple class="menu-item" @click="goToEditProfile">
        <q-item-section avatar>
          <q-icon name="edit" size="24px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-body1">Edit Profile</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple class="menu-item" @click="goToChangePassword">
        <q-item-section avatar>
          <q-icon name="lock" size="24px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-body1">Change Password</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple class="menu-item" @click="goToAppUpdate">
        <q-item-section avatar>
          <q-icon name="system_update" size="24px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-body1">Update Application</q-item-label>
          <q-item-label caption class="text-grey-6">last checked 21 Nov 2025 15:47</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple class="menu-item logout-item" @click="handleLogout">
        <q-item-section avatar>
          <q-icon name="logout" size="24px" color="red" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-body1 text-red">Logout</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" size="24px" color="red" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuth } from 'src/composables/useAuth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const { logout, getUser } = useAuth();

// Initialize with local storage data for instant load
const user = ref(getUser());
const displayName = ref(user.value?.name || user.value?.username || 'User');
const displayEmail = ref(user.value?.email ?? '-');
const profileImageUrl = ref(user.value?.url ?? 'https://i.pravatar.cc/300');

// File upload references
const fileInputRef = ref<HTMLInputElement | null>(null);

// Fetch the latest profile data from backend
const fetchProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data?.data) {
      const serverUser = response.data.data;
      displayName.value = serverUser.name || serverUser.username || displayName.value;
      displayEmail.value = serverUser.email || displayEmail.value;
      if (serverUser.url) {
        profileImageUrl.value = serverUser.url;
      }

      // Update local storage to keep it in sync
      localStorage.setItem('user', JSON.stringify(serverUser));
      user.value = serverUser; // Update local ref
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};

onMounted(() => {
  void fetchProfile();
});

// Trigger hidden file input
function triggerFileInput() {
  fileInputRef.value?.click();
}

// Handle file selection and upload
async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return;

  // Make sure we have the user ID
  console.log('Current user data:', user.value); // debug
  if (!user.value?.id) {
    $q.notify({
      type: 'negative',
      message: 'User ID not found. Please re-login.',
      position: 'top',
    });
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  $q.loading.show({ message: 'Uploading photo...' });
  try {
    const response = await api.post(`/users/${user.value.id}/image`, formData);

    console.log('Upload response:', response.data); // debug
    // Accept any 2xx success response
    $q.notify({
      type: 'positive',
      message: 'Profile photo updated successfully',
      position: 'top',
    });
    // Re-fetch profile to get the new URL
    await fetchProfile();
  } catch (error: unknown) {
    console.error('Failed to upload photo:', error);
    const axiosError = error as { response?: { data?: unknown; status?: number } };
    console.error('Error response:', axiosError.response?.data);
    $q.notify({
      type: 'negative',
      message: 'Failed to upload photo',
      position: 'top',
    });
  } finally {
    $q.loading.hide();
    // Reset file input so the same file can be selected again if needed
    target.value = '';
  }
}

function goToEditProfile() {
  void router.push('/edit-profile');
}

function goToChangePassword() {
  void router.push('/change-password');
}

function goToAppUpdate() {
  console.log('Navigate to App Update');
}

function handleLogout() {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: {
      label: 'Cancel',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'Logout',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    logout();
  });
}
</script>

<style scoped>
.profile-page {
  background: #ffffff;
  min-height: 100vh;
}

/* Profile Section */
.profile-section {
  background: #ffffff;
  padding-bottom: 24px;
}

.profile-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 3px solid #f0f0f0;
}

.camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Menu List */
.menu-list {
  padding-top: 8px;
}

.menu-item {
  padding: 16px;
  min-height: 64px;
  transition: background 0.2s ease;
}

.menu-item:active {
  background: #f5f5f5;
}

.logout-item {
  margin-top: 8px;
}

/* Mobile Optimization */
@media (max-width: 599px) {
  .profile-avatar-wrapper {
    margin-top: 8px;
  }

  .profile-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .camera-btn {
    width: 32px;
    height: 32px;
  }

  .menu-item {
    padding: 14px 16px;
    min-height: 56px;
  }

  .text-h6 {
    font-size: 18px;
  }

  .text-body1 {
    font-size: 14px;
  }
}
</style>
