import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/auth' },
      {
        path: 'home',
        component: () => import('pages/home/HomePage.vue'),
      },
      {
        path: 'notifications',
        component: () => import('pages/notification/NotificationsPage.vue'),
      },
      {
        path: 'usage',
        component: () => import('pages/usage/UsagePage.vue'),
      },
      {
        path: 'device',
        component: () => import('pages/device/DevicePage.vue'),
      },
      {
        path: 'management',
        component: () => import('pages/admin/ManagementPage.vue'),
      },
      {
        path: 'profile',
        component: () => import('pages/profile/ProfilePage.vue'),
      },
      {
        path: 'edit-profile',
        component: () => import('pages/profile/EditProfilePage.vue'),
      },
      {
        path: 'change-password',
        component: () => import('pages/profile/ChangePasswordPage.vue'),
      },
      {
        path: 'add-device',
        component: () => import('pages/device/AddDevicePage.vue'),
      },
      {
        path: 'add-household',
        component: () => import('pages/household/AddHouseholdPage.vue'),
      },
      {
        path: 'edit-household/:id',
        component: () => import('pages/household/EditHouseholdPage.vue'),
      },
      {
        path: 'edit-device/:id',
        component: () => import('pages/device/EditDevicePage.vue'),
      },
    ],
  },

  {
    path: '/auth',
    component: () => import('pages/auth/AuthPage.vue'),
  },
  {
    path: '/auth/login',
    component: () => import('pages/auth/LoginPage.vue'),
  },
  {
    path: '/auth/forgot-password',
    component: () => import('pages/auth/ForgotPasswordPage.vue'),
  },
  {
    path: '/auth/forgot password',
    component: () => import('pages/auth/ForgotPasswordPage.vue'),
  },
  {
    path: '/auth/register',
    component: () => import('pages/auth/RegisterPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
