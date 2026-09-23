<template>
  <div class="top-search-wrapper">
    <div class="top-search-input-wrapper">
      <input v-model="searchQuery" placeholder="Search Google Maps" class="top-search-input" @keyup.enter="selectTopSuggestionOrSearch" @focus="showSuggestions = true" @blur="onSearchBlur" />
      <ion-spinner v-if="isSearchingSuggestions" name="dots" color="medium" class="search-inline-spinner"></ion-spinner>
      <button v-else-if="searchQuery" class="clear-input-btn" @click="clearSearch" aria-label="Clear search">
        <ion-icon :icon="closeCircleOutline"></ion-icon>
      </button>
      <ion-icon v-else :icon="searchOutline" class="top-search-icon"></ion-icon>
    </div>

    <!-- Live autocomplete suggestions dropdown -->
    <div v-if="showSuggestions && suggestions.length > 0" class="top-suggestions-dropdown">
      <button v-for="suggestion in suggestions" :key="suggestion.placeId" class="suggestion-row" @mousedown.prevent="selectSuggestion(suggestion)">
        <ion-icon :icon="locationOutline" class="suggestion-icon"></ion-icon>
        <div class="suggestion-text-wrapper">
          <span class="suggestion-main-text">{{ suggestion.mainText }}</span>
          <span v-if="suggestion.secondaryText" class="suggestion-secondary-text">{{ suggestion.secondaryText }}</span>
        </div>
      </button>
    </div>

    <div v-else-if="showSuggestions && searchQuery.trim().length > 2 && !isSearchingSuggestions" class="top-suggestions-dropdown">
      <p class="no-suggestions-text">No matching addresses found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, type ComputedRef } from "vue";
import { IonSpinner, IonIcon } from "@ionic/vue";
import { searchOutline, closeCircleOutline, locationOutline } from "ionicons/icons";

interface AddressSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

const props = defineProps<{
  selectedAddress?: string;
  isGeocoding?: boolean;
  selectedCoords?: { lat: number; lng: number } | null;
}>();

const emit = defineEmits<{
  (e: "update:selectedAddress", val: string): void;
  (e: "update:isGeocoding", val: boolean): void;
  (e: "select-location", payload: { lat: number; lng: number; address: string }): void;
}>();

const mapsApi = inject<ComputedRef<any | null>>("mapsApi");
const mapInstance = inject<ComputedRef<any | null>>("mapInstance");

const searchQuery = ref<string>("");
const suggestions = ref<AddressSuggestion[]>([]);
const showSuggestions = ref<boolean>(false);
const isSearchingSuggestions = ref<boolean>(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

let autocompleteService: any = null;
let placesService: any = null;
let autocompleteSessionToken: any = null;
let geocoder: any = null;

// Reactively initialize Places services as soon as the Maps API is ready
watch(
  () => mapsApi?.value,
  (api) => {
    if (!api) return;
    if (!autocompleteService) {
      autocompleteService = new api.places.AutocompleteService();
    }
    if (!autocompleteSessionToken) {
      autocompleteSessionToken = new api.places.AutocompleteSessionToken();
    }
    if (!geocoder) {
      geocoder = new api.Geocoder();
    }
  },
  { immediate: true },
);

watch(
  () => mapInstance?.value,
  (map) => {
    const api = mapsApi?.value;
    if (!api || !map) return;
    if (!placesService) {
      placesService = new api.places.PlacesService(map);
    }
  },
  { immediate: true },
);

function ensurePlacesServices() {
  const api = mapsApi?.value;
  if (!api) return false;

  if (!autocompleteService) {
    autocompleteService = new api.places.AutocompleteService();
  }
  if (!placesService && mapInstance?.value) {
    placesService = new api.places.PlacesService(mapInstance.value);
  }
  if (!autocompleteSessionToken) {
    autocompleteSessionToken = new api.places.AutocompleteSessionToken();
  }
  return !!(autocompleteService && placesService && autocompleteSessionToken);
}

// Lazily creates (and reuses) a single google.maps.Geocoder from the same
// Maps JS instance vue3-google-map loaded, instead of hitting the REST
// Geocoding endpoint directly with fetch().
function ensureGeocoder() {
  const api = mapsApi?.value;
  if (!api) return null;
  if (!geocoder) {
    geocoder = new api.Geocoder();
  }
  return geocoder;
}

function clearSearch() {
  searchQuery.value = "";
  suggestions.value = [];
  showSuggestions.value = false;
}

function onSearchBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
}

watch(searchQuery, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!value || value.trim().length < 3) {
    suggestions.value = [];
    isSearchingSuggestions.value = false;
    return;
  }

  showSuggestions.value = true;
  debounceTimer = setTimeout(() => {
    fetchSuggestions(value.trim());
  }, 400);
});

async function fetchSuggestions(query: string) {
  if (!ensurePlacesServices()) return;

  isSearchingSuggestions.value = true;
  try {
    const api = mapsApi!.value;
    const request: any = {
      input: query,
      sessionToken: autocompleteSessionToken,
    };

    if (props.selectedCoords) {
      request.locationBias = {
        center: { lat: props.selectedCoords.lat, lng: props.selectedCoords.lng },
        radius: 50000,
      };
    }

    const predictions: any[] = await new Promise((resolve) => {
      autocompleteService.getPlacePredictions(request, (results: any[] | null, status: string) => {
        if (status !== api.places.PlacesServiceStatus.OK || !results) {
          resolve([]);
          return;
        }
        resolve(results);
      });
    });

    suggestions.value = predictions.map((p) => ({
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text ?? p.description ?? "",
      secondaryText: p.structured_formatting?.secondary_text ?? "",
    }));
  } catch {
    suggestions.value = [];
  } finally {
    isSearchingSuggestions.value = false;
  }
}

async function selectSuggestion(suggestion: AddressSuggestion) {
  showSuggestions.value = false;
  searchQuery.value = suggestion.mainText;
  suggestions.value = [];

  if (!ensurePlacesServices()) return;
  const api = mapsApi!.value;

  emit("update:isGeocoding", true);
  try {
    const place: any = await new Promise((resolve) => {
      placesService.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ["geometry.location", "formatted_address"],
          sessionToken: autocompleteSessionToken,
        },
        (result: any, status: string) => {
          if (status !== api.places.PlacesServiceStatus.OK || !result) {
            resolve(null);
            return;
          }
          resolve(result);
        },
      );
    });

    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address ?? suggestion.mainText;

      emit("update:selectedAddress", address);
      emit("select-location", { lat, lng, address });
    }

    autocompleteSessionToken = new api.places.AutocompleteSessionToken();
  } catch {
  } finally {
    emit("update:isGeocoding", false);
  }
}

async function selectTopSuggestionOrSearch() {
  const topSuggestion = suggestions.value[0];
  if (topSuggestion) {
    await selectSuggestion(topSuggestion);
    return;
  }
  await searchAddress();
}

// Forward geocoding now goes through the same google.maps.Geocoder instance
// (loaded once by vue3-google-map) rather than calling the REST Geocoding API
// with fetch() and a separately-sourced API key.
async function searchAddress() {
  if (!searchQuery.value.trim()) return;

  const coder = ensureGeocoder();
  if (!coder) return;

  emit("update:isGeocoding", true);
  try {
    const response = await coder.geocode({ address: searchQuery.value });
    if (response.results && response.results.length > 0) {
      const location = response.results[0].geometry.location;
      const formattedAddress = response.results[0].formatted_address;
      const lat = location.lat();
      const lng = location.lng();

      emit("update:selectedAddress", formattedAddress);
      showSuggestions.value = false;

      emit("select-location", { lat, lng, address: formattedAddress });
    }
  } catch {
  } finally {
    emit("update:isGeocoding", false);
  }
}
</script>

<style scoped>
@import "~/assets/css/ModalMap.css";
</style>
