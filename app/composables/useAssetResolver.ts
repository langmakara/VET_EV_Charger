/**
 * Composable that resolves asset paths relative to the app's base URL.
 * Replaces the duplicated `resolveAsset` helper previously inlined in
 * RentalTypeCard.vue and VehicleCard.vue.
 */
export const NO_IMAGE_AVAILABLE = "https://placehold.co/600x400?text=Image\\nUpcoming";

export const useAssetResolver = () => {
  const config = useRuntimeConfig();

  const resolveAsset = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = config.app.baseURL || "/";
    const cleanBase = base.endsWith("/") ? base : base + "/";
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return cleanBase + cleanPath;
  };

  return { resolveAsset };
};
