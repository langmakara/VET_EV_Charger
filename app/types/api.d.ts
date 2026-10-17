/**
 * Centralized API contract type definitions.
 * All API response shapes, request payloads, and shared data interfaces
 * live here to keep components and repositories fully type-safe.
 */

// ─── Generic API Response Wrapper ───────────────────────────────────────────

export interface ApiResponseWrapper<T> {
  header: {
    serverTimestamp: number
    result: boolean
    statusCode: number
  }
  body: {
    status: boolean
    message: string
    data: T
  }
  /** Optional backward compatibility for legacy flat responses */
  data?: T
  success?: boolean
  status?: number
  code?: number
  message?: string
  timestamp?: string
}


// ─── User Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id?: number
  employeeId?: number | null
  username?: string
  fullName?: string
  firstName?: string | null
  lastName?: string | null
  photo?: string | null
  signature?: string | null
  roles?: any[]
  isActive?: number
  created?: string | null
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
  moduleTypeList?: any[]
  [key: string]: any
}
