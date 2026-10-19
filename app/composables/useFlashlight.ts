import { Torch } from '@capawesome/capacitor-torch'

export const useFlashlight = () => {
  const isOn = ref(false)

  const toggle = async () => {
    const { available } = await Torch.isAvailable()
    if (!available) return

    await Torch.toggle()
    isOn.value = (await Torch.isEnabled()).enabled
  }

  return { isOn, toggle }
}