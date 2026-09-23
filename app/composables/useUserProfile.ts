import type { UserProfile } from '~/types'
import { userRepository } from '~/apis/user.repository'

export const useUserProfile = () => {
  const userProfile = useState<UserProfile | null>('user-profile-data', () => null)
  const isLoaded = useState<boolean>('user-profile-loaded', () => false)

  const fetchUserProfile = async () => {
    // If user profile is already loaded in shared Nuxt state, reuse cached profile
    if (isLoaded.value && userProfile.value) {
      return userProfile.value
    }

    const { getToken } = useAuthToken()
    const token = getToken()
    if (!token) return null

    try {
      const resData = await userRepository.getUserProfile()
      if (resData?.data) {
        userProfile.value = resData.data
        isLoaded.value = true
      }
    } catch {}

    return userProfile.value
  }

  const clearUserProfile = () => {
    userProfile.value = null
    isLoaded.value = false
  }

  return {
    userProfile,
    isLoaded,
    fetchUserProfile,
    clearUserProfile,
  }
}
