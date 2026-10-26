import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'

/**
 * Returns a guard function. Call `guard('cv_analysis')` — if the user
 * doesn't have the feature it navigates to /plans and returns false.
 */
export function usePaywall() {
  const sub    = useSubscriptionStore()
  const router = useRouter()

  function guard(featureKey: string): boolean {
    if (sub.hasFeature(featureKey)) return true
    router.push('/plans')
    return false
  }

  function requirePro(): boolean {
    if (sub.isPro) return true
    router.push('/plans')
    return false
  }

  function requirePremium(): boolean {
    if (sub.isPremium) return true
    router.push('/plans')
    return false
  }

  return { guard, requirePro, requirePremium }
}
