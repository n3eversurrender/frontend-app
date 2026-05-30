import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export interface UserData {
  id: number;
  username: string;
  email: string;
  role: number;
  name?: string;
  is_active?: boolean;
  url?: string;
}

export function useAuth() {
  const router = useRouter();

  function logout() {
    // Clear all auth data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    // Remove Authorization header from axios
    delete api.defaults.headers.common['Authorization'];

    // Show notification
    Notify.create({
      type: 'positive',
      message: 'Successfully logged out',
      position: 'top',
    });

    // Redirect to auth landing page
    void router.push('/auth');
  }

  function getUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserData;
    } catch {
      return null;
    }
  }

  function isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  function isAdmin(): boolean {
    const user = getUser();
    return user?.role === 1;
  }

  return { logout, getUser, isAuthenticated, isAdmin };
}
