<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    IonModal,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton
  } from '@ionic/vue'
  import SelectFloatControl from '~/components/Controls/FloatControl/SelectFloatControl.vue'
  import IconButton from '~/components/Button/IconButton.vue'

  const { t } = useI18n()

  const props = withDefaults(
    defineProps<{
      isOpen: boolean
    }>(),
    {
      isOpen: false
    }
  )

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const selectedStatus = ref([])
  const selectedConnector = ref([])
  const selectedTags = ref([])
  const selectedProvince = ref([])

  const resetFilters = () => {
    selectedStatus.value = []
    selectedConnector.value = []
    selectedTags.value = []
    selectedProvince.value = []
  }

  const ChargerOptions = computed(() => [
    { label: t('evCharger.allType'), value: 'All' },
    { label: 'CCS2 (DC)', value: 'CCS2' },
    { label: 'GB/T (AC)', value: 'GBT' }
  ])

  const availabilityOptions = computed(() => [
    { label: t('evCharger.availableNow'), value: 'available' },
    { label: t('evCharger.occupied'), value: 'occupied' },
    { label: t('evCharger.outOfOrder'), value: 'out' }
  ])

  const distanceOptions = computed(() => [
    { label: t('evCharger.within5km'), value: '5' },
    { label: t('evCharger.within10km'), value: '10' },
    { label: t('evCharger.within15km'), value: '15' },
    { label: t('evCharger.within20km'), value: '20' },
    { label: t('evCharger.within25km'), value: '25' },
    { label: t('evCharger.anyDistance'), value: 'any' }
  ])

  const provinceOptions = computed(() => [
    { label: t('evCharger.allProvinces'), value: 'All' },
    { label: 'Phnom Penh', value: 'Phnom Penh' },
    { label: 'Banteay Meanchey', value: 'Banteay Meanchey' },
    { label: 'Battambang', value: 'Battambang' },
    { label: 'Kampong Cham', value: 'Kampong Cham' },
    { label: 'Kampong Chhnang', value: 'Kampong Chhnang' },
    { label: 'Kampong Speu', value: 'Kampong Speu' },
    { label: 'Kampong Thom', value: 'Kampong Thom' },
    { label: 'Kampot', value: 'Kampot' },
    { label: 'Kandal', value: 'Kandal' },
    { label: 'Kep', value: 'Kep' },
    { label: 'Koh Kong', value: 'Koh Kong' },
    { label: 'Kratie', value: 'Kratie' },
    { label: 'Mondulkiri', value: 'Mondulkiri' },
    { label: 'Oddar Meanchey', value: 'Oddar Meanchey' },
    { label: 'Pailin', value: 'Pailin' },
    { label: 'Preah Sihanouk', value: 'Preah Sihanouk' },
    { label: 'Preah Vihear', value: 'Preah Vihear' },
    { label: 'Prey Veng', value: 'Prey Veng' },
    { label: 'Pursat', value: 'Pursat' },
    { label: 'Ratanakiri', value: 'Ratanakiri' },
    { label: 'Siem Reap', value: 'Siem Reap' },
    { label: 'Stung Treng', value: 'Stung Treng' },
    { label: 'Svay Rieng', value: 'Svay Rieng' },
    { label: 'Takeo', value: 'Takeo' },
    { label: 'Tboung Khmum', value: 'Tboung Khmum' }
  ])
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="emit('close')"
    mode="ios"
    :initial-breakpoint="0.60"
    :breakpoints="[0, 0.60, 1]"
  >
    <ion-header>
      <ion-toolbar class="header-filter">
        <ion-buttons slot="start">
          <ion-button class="but-reset" @click="resetFilters">{{ $t('label.reset') }}</ion-button>
        </ion-buttons>
        <ion-title>{{ $t('filter.title') }}</ion-title>
        <ion-buttons slot="end">
          <IconButton name="close" size="lg" @click="emit('close')" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <SelectFloatControl
        v-model="selectedStatus"
        :label="$t('evCharger.chargerType')"
        :options="ChargerOptions"
      />

      <SelectFloatControl
        v-model="selectedConnector"
        :label="$t('evCharger.availability')"
        :options="availabilityOptions"
      />

      <SelectFloatControl
        v-model="selectedTags"
        :label="$t('evCharger.distance')"
        :options="distanceOptions"
      />

      <SelectFloatControl
        v-model="selectedProvince"
        :label="$t('evCharger.province')"
        :options="provinceOptions"
      />
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.but-reset {
  --color: red;
  font-size: var(--app-font-size-title);
}
.header-filter {
  padding-top: var(--ion-padding);
}
</style>
