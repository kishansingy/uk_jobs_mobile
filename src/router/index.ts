import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  // Hash history works better in Capacitor WebView
  history: createWebHashHistory(),
  routes: [
    // Auth
    { path: '/login',    name: 'login',    component: () => import('@/views/auth/LoginView.vue'),    meta: { public: true } },
    { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { public: true } },

    // Onboarding (no tab bar)
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/onboarding/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },

    // Plans & checkout (no tab bar)
    {
      path: '/plans',
      name: 'plans',
      component: () => import('@/views/subscription/PlansView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout/:planId/:period',
      name: 'checkout',
      component: () => import('@/views/subscription/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },

    // Main tab layout
    {
      path: '/',
      component: () => import('@/layouts/TabLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',         name: 'home',         component: () => import('@/views/HomeView.vue') },
        { path: 'jobs',     name: 'jobs',         component: () => import('@/views/JobsView.vue') },
        { path: 'jobs/:id', name: 'job-detail',   component: () => import('@/views/JobDetailView.vue') },
        { path: 'saved',    name: 'saved',        component: () => import('@/views/SavedJobsView.vue') },
        { path: 'tools',    name: 'tools',        component: () => import('@/views/ToolsView.vue') },
        { path: 'tools/interview', name: 'interview', component: () => import('@/views/tools/InterviewView.vue') },
        { path: 'tools/videos',    name: 'videos',    component: () => import('@/views/tools/VideosView.vue') },
        { path: 'tools/cv',        name: 'cv',        component: () => import('@/views/tools/CvView.vue') },
        { path: 'tools/statements',name: 'statements',component: () => import('@/views/tools/StatementsView.vue') },
        { path: 'tools/advisor',   name: 'advisor',   component: () => import('@/views/tools/AdvisorView.vue') },
        { path: 'tools/alerts',    name: 'alerts',    component: () => import('@/views/tools/AlertsView.vue') },
        { path: 'profile',  name: 'profile',      component: () => import('@/views/ProfileView.vue') },
        { path: 'profile/edit',          name: 'profile-edit',    component: () => import('@/views/profile/EditProfileView.vue') },
        { path: 'profile/qualifications',name: 'qualifications',  component: () => import('@/views/profile/QualificationsView.vue') },
        { path: 'applications',          name: 'applications',    component: () => import('@/views/ApplicationsView.vue') },
        { path: 'notifications',         name: 'notifications',   component: () => import('@/views/NotificationsView.vue') },
        { path: 'profile/notifications', name: 'notif-prefs',    component: () => import('@/views/profile/NotificationPrefsView.vue') },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.public) return true
  if (!auth.token) return { name: 'login' }
  if (!auth.user) await auth.fetchMe()

  // Redirect to onboarding if not yet completed
  if (
    auth.user &&
    !auth.user.onboarding_completed &&
    to.name !== 'onboarding'
  ) {
    return { name: 'onboarding' }
  }

  return true
})

export default router
