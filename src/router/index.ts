import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('access_token');

    // 1. If route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!token) {
        // Redirect to auth landing page if not authenticated
        next({ path: '/auth' });
      } else {
        // Role-based Access Control
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            // Block admin (role 1) from /usage and /device
            if ((to.path === '/usage' || to.path === '/device') && user.role === 1) {
              next({ path: '/home' });
              return;
            }
            // Block non-admin from /management (assuming 1 is admin)
            if (to.path === '/management' && user.role !== 1) {
              next({ path: '/home' });
              return;
            }
          } catch (e) {
            console.error('Error parsing user for router guard', e);
          }
        }
        next();
      }
    }
    // 2. If user is already logged in and tries to access login/register/auth pages
    else if (to.path.startsWith('/auth') && token) {
      next({ path: '/home' });
    }
    // 3. Root path redirect logic
    else if (to.path === '/') {
      if (token) {
        next({ path: '/home' });
      } else {
        next({ path: '/auth' });
      }
    }
    else {
      // Allow access to public routes
      next();
    }
  });

  return Router;
});
