export const useApiUrl = (contextPath: string = "", devPort?: number) => {
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
    baseUrl = devPort ? `http://phea.local:${devPort}` : apiUrlDev;
  }

  baseUrl = baseUrl.replace(/\/+$/, "");

  // If a contextPath (e.g. "/utSystemHrAPi") is provided, attach or swap context
  if (contextPath) {
    try {
      const url = new URL(baseUrl);
      url.pathname = contextPath.replace(/^\/+/, "/");
      baseUrl = url.origin + url.pathname;
    } catch {
      baseUrl = `${baseUrl}/${contextPath.replace(/^\/+/, "")}`;
    }
  }

  return { activeEnv, baseUrl };
};
