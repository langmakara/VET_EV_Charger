import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { dropdownApi, getDropdownApi } from '~/api/modules/dropdown.api'
import { queryKeys } from './keys'
import { computed, unref, type MaybeRef } from 'vue'
import { useApi } from '~/composables/useApi'
import type { DropdownParams } from '~/api/types'

/**
 * Infinite query for News Feed dropdown list (/dropdown/new-feed/list)
 */
export const useNewFeedInfinite = (params?: MaybeRef<DropdownParams>) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.dropdown.infinite(unref(params))),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getNewFeedDropdown({
        ...unref(params),
        page: pageParam as number
      }),
    getNextPageParam: (lastPage, allPages) => {
      const res = (lastPage as any)?.data ?? lastPage?.body?.data
      const items = Array.isArray(res) ? res : (res?.list ?? [])
      const rowsPerPage = unref(params)?.rowsPerPage ?? 25

      if (!items || items.length < rowsPerPage) {
        return undefined
      }
      return allPages.length + 1
    },
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Single-page query for News Feed dropdown
 */
export const useNewFeedQuery = (params?: MaybeRef<DropdownParams>) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useQuery({
    queryKey: computed(() => queryKeys.dropdown.newsFeed(unref(params))),
    queryFn: () => api.getNewFeedDropdown(unref(params)),
    staleTime: 5 * 60 * 1000
  })
}

// post /dropdown/gun/list
export const useGunTypeQuery = (
  params?: MaybeRef<DropdownParams>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useQuery({
    queryKey: computed(() => queryKeys.dropdown.gunType(unref(params))),
    queryFn: () => api.getGunTypeDropdown(unref(params)),
    enabled: computed(() => (options?.enabled !== undefined ? unref(options.enabled) : true)),
    staleTime: 5 * 60 * 1000
  })
}

// post /dropdown/privacy-policy/list
export const usePrivacyPolicyDropdownQuery = (
  params?: MaybeRef<DropdownParams>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useQuery({
    queryKey: computed(() => queryKeys.dropdown.privacyPolicy(unref(params))),
    queryFn: () => api.getPrivacyPolicyDropdown(unref(params)),
    enabled: computed(() => (options?.enabled !== undefined ? unref(options.enabled) : true)),
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Infinite query for FAQs dropdown list (/dropdown/faqs/list)
 */
export const useFaqsInfinite = (params?: MaybeRef<DropdownParams>) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.dropdown.faqs(unref(params))),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getFaqsDropdown({
        ...unref(params),
        page: pageParam as number
      }),
    getNextPageParam: (lastPage, allPages) => {
      const res = (lastPage as any)?.data ?? lastPage?.body?.data
      const items = Array.isArray(res) ? res : (res?.list ?? [])
      const rowsPerPage = unref(params)?.rowsPerPage ?? 25

      if (!items || items.length < rowsPerPage) {
        return undefined
      }
      return allPages.length + 1
    },
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Single-page query for Contact Us dropdown (/dropdown/contact-us/list)
 */
export const useContactUsDropdownQuery = (
  params?: MaybeRef<DropdownParams>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useQuery({
    queryKey: computed(() => queryKeys.dropdown.contactUs(unref(params))),
    queryFn: () => api.getContactUsDropdown(unref(params)),
    enabled: computed(() => (options?.enabled !== undefined ? unref(options.enabled) : true)),
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Infinite query for Contact Us dropdown list (/dropdown/contact-us/list)
 */
export const useContactUsInfinite = (params?: MaybeRef<DropdownParams>) => {
  const http = useApi()
  const api = dropdownApi(http)

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.dropdown.contactUs(unref(params))),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getContactUsDropdown({
        ...unref(params),
        page: pageParam as number
      }),
    getNextPageParam: (lastPage, allPages) => {
      const res = (lastPage as any)?.data ?? lastPage?.body?.data
      const items = Array.isArray(res) ? res : (res?.list ?? [])
      const rowsPerPage = unref(params)?.rowsPerPage ?? 10

      if (!items || items.length < rowsPerPage) {
        return undefined
      }
      return allPages.length + 1
    },
    staleTime: 5 * 60 * 1000
  })
}
