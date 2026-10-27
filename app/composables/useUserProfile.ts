import type { UserProfile } from '~/types'
import { userRepository } from '~/apis/user.repository'

const STORAGE_KEY = 'vet_ev_user_profile'

export const useUserProfile = () => {
  const userProfile = useState<UserProfile | null>('user-profile-data', () => null)
  const isLoaded = useState<boolean>('user-profile-loaded', () => false)

  // Initialize from localStorage on first client execution
  if (import.meta.client && !isLoaded.value && !userProfile.value) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        userProfile.value = JSON.parse(stored)
        isLoaded.value = true
      }
    } catch (e) {
      console.warn('Failed to parse cached user profile', e)
    }
  }

  /**
   * Normalize and store user profile received from ABA Native Bridge (getProfile)
   */
  const saveAbaProfile = (rawAbaData: any): UserProfile => {
    // 1. Unwrap data if nested under data or body
    const p = rawAbaData?.data || rawAbaData?.body?.data || rawAbaData || {}

    // 2. Normalize ABA fields to standard UserProfile
    const normalized: UserProfile = {
      fullName:
        p.fullName ||
        p.name ||
        `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
        'ABA User',
      firstName: p.firstName || null,
      lastName: p.lastName || null,
      phoneNumber: p.phone || p.phoneNumber || p.mobile || '',
      email: p.email || '',
      avatar: p.avatar || p.photo || p.picture || '',
      address: p.address || '',
      nidNumber: p.nidNumber || '',
      dob: p.dobFull || p.dobShort || p.dob || '',
      nationality: p.nationality || '',
      sex: p.sex || '',
      cif: p.cif || '',
      rawAba: p
    }

    // 3. Update global reactive Nuxt state
    userProfile.value = normalized
    isLoaded.value = true

    // 4. Persist to localStorage for session persistence across refreshes
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      } catch (e) {
        console.warn('Failed to persist user profile to localStorage', e)
      }
    }

    return normalized
  }

  const fetchUserProfile = async () => {
    // If user profile is already loaded in shared Nuxt state, reuse cached profile
    if (isLoaded.value && userProfile.value) {
      return userProfile.value
    }

    const { getToken } = useAuthToken()
    const token = getToken()
    if (!token) return userProfile.value

    try {
      const resData = await userRepository.getUserProfile()
      if (resData?.data) {
        userProfile.value = resData.data
        isLoaded.value = true
        if (import.meta.client) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resData.data))
        }
      }
    } catch {}

    return userProfile.value
  }

  const clearUserProfile = () => {
    userProfile.value = null
    isLoaded.value = false
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {}
    }
  }

  return {
    userProfile,
    isLoaded,
    saveAbaProfile,
    fetchUserProfile,
    clearUserProfile,
  }
}

