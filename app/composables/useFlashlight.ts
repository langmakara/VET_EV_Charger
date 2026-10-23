import { Torch } from '@capawesome/capacitor-torch'
import { ref, type Ref } from 'vue'

export const useFlashlight = (streamRef?: Ref<MediaStream | null>) => {
  const isOn = ref(false)

  const toggle = async () => {
    // 1. Try via MediaStream track if camera is streaming (works on mobile web browsers)
    if (streamRef?.value) {
      const track = streamRef.value.getVideoTracks()[0]
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() || {}) as any
          if (capabilities.torch) {
            const nextState = !isOn.value
            await track.applyConstraints({
              advanced: [{ torch: nextState } as any]
            })
            isOn.value = nextState
            return
          }
        } catch (e) {
          console.warn('Track torch constraint failed, falling back to Torch plugin:', e)
        }
      }
    }

    // 2. Try via Capacitor Torch plugin (works in native iOS / Android apps)
    try {
      const { available } = await Torch.isAvailable()
      if (available) {
        const stream = streamRef?.value || undefined
        await Torch.toggle({ stream })
        const res = await Torch.isEnabled({ stream })
        isOn.value = res.enabled
        return
      }
    } catch (err) {
      console.warn('Capacitor Torch plugin not available on this platform:', err)
    }

    // 3. Fallback toggle state for UI feedback in dev/testing environments (e.g. desktop web)
    isOn.value = !isOn.value
  }

  const turnOff = async () => {
    if (!isOn.value) return
    if (streamRef?.value) {
      const track = streamRef.value.getVideoTracks()[0]
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() || {}) as any
          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: false } as any]
            })
          }
        } catch (e) {
          // ignore
        }
      }
    }
    try {
      const { available } = await Torch.isAvailable()
      if (available) {
        const stream = streamRef?.value || undefined
        await Torch.disable({ stream })
      }
    } catch (e) {
      // ignore
    }
    isOn.value = false
  }

  return { isOn, toggle, turnOff }
}