export const useApiUrl = () => {
  const config = useRuntimeConfig().public;

  const activeEnv = (config.nodeEnv || "dev").toLowerCase().trim();

  const apiUrlDev = (config.apiUrlDev as string) || "";
  const apiUrlQa = (config.apiUrlQa as string) || "";
  const apiUrlLocal = (config.apiUrlLocal as string) || "";
  const apiUrlProd = (config.apiUrlProd as string) || "";
  const directApiUrl = (config.apiUrl as string) || "";

  let baseUrl = "";

  if (directApiUrl && directApiUrl.trim() !== "") {
    baseUrl = directApiUrl.trim();
  } else if (activeEnv === "pro" || activeEnv === "production") {
    baseUrl = apiUrlProd || apiUrlDev;
  } else if (activeEnv === "qa") {
    baseUrl = apiUrlQa || apiUrlDev;
  } else if (activeEnv === "local") {
    baseUrl = apiUrlLocal || apiUrlDev;
  } else {
    baseUrl = apiUrlDev;
  }

  baseUrl = baseUrl.replace(/\/+$/, "");

  return { activeEnv, baseUrl };
};
