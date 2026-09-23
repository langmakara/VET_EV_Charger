import type { Vehicle } from '~/types/vehicle-rental'
import type { RawVehicleItem } from '~/types/api'

/**
 * Format image URL with base URL fallback
 */
export function formatImageUrl(url?: string, baseUrl: string = ''): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const cleanUrl = url.startsWith('/') ? url : '/' + url
  return baseUrl ? `${baseUrl.replace(/\/+$/, '')}${cleanUrl}` : cleanUrl
}

export const vehicleService = {
  /**
   * Format image URL helper
   */
  formatImageUrl,

  /**
   * Transform raw API vehicles array to Vehicle frontend objects
   */
  transformRawVehicles(responseData: any, baseUrl: string = ''): Vehicle[] {
    let items: RawVehicleItem[] = []

    if (Array.isArray(responseData)) {
      items = responseData
    } else if (responseData && Array.isArray(responseData.data)) {
      items = responseData.data
    }

    if (!items || items.length === 0) return []

    return items.map((item: RawVehicleItem) => ({
      id: String(item.id || ''),
      name: item.nameEn || item.nameKh || item.modelName || item.brandName || '',
      nameEn: item.nameEn,
      nameKh: item.nameKh,
      nameZh: (item as any).nameZh,
      image: formatImageUrl(item.fileUrl, baseUrl),
      rating: item.averageRating ?? item.rating ?? 0,
      passengers: item.passengers ?? 0,
      price: item.price !== undefined && item.price !== null ? String(item.price) : '',
      totalReviews: item.totalReviews ?? 0,
      description: item.descriptionEn || item.descriptionKh || item.description || '',
      descriptionEn: item.descriptionEn,
      descriptionKh: item.descriptionKh,
      descriptionZh: (item as any).descriptionZh,
      facilities: item.facilities || [],
      rawItem: item,
    }))
  },

  /**
   * Transform raw vehicle detail API response to clean vehicle display object
   */
  transformVehicleDetail(data: any, vehicleId: string = '', baseUrl: string = ''): Vehicle | undefined {
    if (!data) return undefined

    const rawRating = data.averageRating ?? data.rating ?? 0
    const rawTotalReviews = data.totalReviews ?? 0

    let slideList: string[] = []
    if (Array.isArray(data.slides) && data.slides.length > 0) {
      const sortedSlides = [...data.slides].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      slideList = sortedSlides
        .map((s: any) => (typeof s === 'string' ? formatImageUrl(s, baseUrl) : formatImageUrl(s?.fileUrl || s?.url, baseUrl)))
        .filter(Boolean)
    } else if (Array.isArray(data.images) && data.images.length > 0) {
      slideList = data.images.map((img: string) => formatImageUrl(img, baseUrl)).filter(Boolean)
    }

    if (slideList.length === 0 && data.fileUrl) {
      slideList = [formatImageUrl(data.fileUrl, baseUrl)]
    }

    return {
      id: String(data.id || vehicleId || ''),
      name: data.nameEn || data.nameKh || data.name || data.modelName || data.brandName || '',
      nameEn: data.nameEn,
      nameKh: data.nameKh,
      nameZh: data.nameZh,
      rating: rawRating,
      totalReviews: rawTotalReviews,
      passengers: data.passengers ?? data.guests ?? data.capacity ?? 0,
      price: data.price !== undefined && data.price !== null ? String(data.price) : (data.basePrice !== undefined && data.basePrice !== null ? String(data.basePrice) : undefined),
      description: data.descriptionEn || data.descriptionKh || data.description || '',
      descriptionEn: data.descriptionEn,
      descriptionKh: data.descriptionKh,
      descriptionZh: data.descriptionZh,
      image: formatImageUrl(data.fileUrl, baseUrl) || '',
      images: slideList,
      facilities: data.facilities || [],
      ratingBreakdown: data.ratingBreakdown,
      reviews: data.recentReviews || data.reviews || [],
      rawItem: data,
    }
  },

  /**
   * Transform raw vehicle reviews API response
   */
  transformVehicleReviews(reviewsData: any, baseUrl: string = ''): any[] {
    let items: any[] = []

    if (Array.isArray(reviewsData)) {
      items = reviewsData
    } else if (reviewsData && Array.isArray(reviewsData.data)) {
      items = reviewsData.data
    } else if (reviewsData && Array.isArray(reviewsData.items)) {
      items = reviewsData.items
    } else if (reviewsData && Array.isArray(reviewsData.list)) {
      items = reviewsData.list
    }

    if (items.length > 0) {
      return items.map((r: any) => {
        const authorName = r.customerName || (r.customerId ? `Customer #${r.customerId}` : 'Anonymous')
        const ratingVal = Number(r.ratingStars ?? 0)
        const rawAvatar = r.customerPhone || ''

        return {
          id: r.id,
          customerId: r.customerId,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          salesOrderId: r.salesOrderId,
          orderNo: r.orderNo,
          vehicleId: r.vehicleId,
          vehicleName: r.vehicleName,
          ratingStars: ratingVal,
          rating: ratingVal,
          comment: r.comment || '',
          isDisabled: r.isDisabled,
          created: r.created || '',
          date: r.created || '',
          author: authorName,
          avatar: formatImageUrl(rawAvatar, baseUrl) || '',
          rawItem: r,
        }
      })
    }

    return []
  },

  /**
   * Calculate rating breakdown percentages (5 star to 1 star)
   */
  calculateRatingBreakdown(bd: any, reviews: any[] = []) {
    // 1) Array format from API
    if (Array.isArray(bd) && bd.length > 0) {
      return bd.map((item: any) => ({
        label: item.label || `${item.star || 5} Star`,
        percent: item.percent ?? (item.count && item.total ? Math.round((item.count / item.total) * 100) : item.count ?? 0),
      }))
    }

    // 2) Object format from API (e.g. { "5": 10, "4": 2 })
    if (bd && typeof bd === 'object' && !Array.isArray(bd)) {
      const total = Object.values(bd).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0) as number
      return [5, 4, 3, 2, 1].map((star) => {
        const count = Number((bd as any)[star] || (bd as any)[`star${star}`] || 0)
        const percent = total > 0 ? Math.round((count / total) * 100) : 0
        return { label: `${star} Star`, percent }
      })
    }

    // 3) Dynamically compute star breakdown from actual vehicle reviews list
    const total = reviews.length
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(Number(r.ratingStars ?? r.rating ?? 0)) === star).length
      const percent = total > 0 ? Math.round((count / total) * 100) : 0
      return { star, label: `${star} Star`, percent }
    })
  },
}
