// Available format: "integer", "decimal", "percentage", "currency"
interface FormatNumberOptions {
  symbol?: string;
  currency?: string;
  decimalPlaces?: number;
  customFormatter?: (num: number) => string;
}

export function formatNumber(
  input: string | number | null | undefined,
  formatType: string = "integer",
  options: FormatNumberOptions | number = {}
): string {
  if (input == null || input === "") return "";
  let cleanInput = String(input);
  if (typeof input === "string") {
    cleanInput = input.replace(/[^0-9.-]/g, "");
  }
  if (cleanInput === "" || isNaN(Number(cleanInput))) return "";
  const num = parseFloat(cleanInput);

  switch (formatType) {
    case "integer": {
      // "integer": "0,000"
      const parts = Math.round(num).toString().split(".");
      parts[0] = (parts[0] ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join("");
    }
    case "decimal": {
      // "decimal": "0,000.00"
      const decimalPlaces = typeof options === "number" ? options : 2;
      const parsedNum = num.toFixed(decimalPlaces);
      const parts = parsedNum.split(".");
      parts[0] = (parts[0] ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    case "percentage": {
      // "percentage": "0.00%"
      return `${(num * 100).toFixed(2)}%`;
    }
    case "currency": {
      // "currency": "$0,000.00"
      const opts = typeof options === "object" ? options : {};
      let { symbol, decimalPlaces = 2 } = opts;
      if (!symbol) {
        symbol = opts.currency === "KHR" ? "៛ " : "$ ";
      }
      const parsedNum = num.toFixed(decimalPlaces);
      const parts = parsedNum.split(".");
      parts[0] = (parts[0] ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${symbol}${parts.join(".")}`;
    }
    case "scientific": {
      // "scientific": "0.00e+00"
      return num.toExponential(2);
    }
    case "compact": {
      // "compact": 1234567.89 -> 1.23M
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(num);
    }
    case "custom": {
      // "custom": formatNumber(1234567.89, "custom", { customFormatter: (num) => `Custom: ${num.toFixed(1)}` })
      const opts = typeof options === "object" ? options : {};
      const { customFormatter } = opts;
      if (typeof customFormatter === "function") return customFormatter(num);
      return "";
    }
    case "hour": {
      // "hour": "1h 30m"
      return `${Math.floor(num / 60)}h ${num % 60}m`;
    }
    case "minute_to_hour": {
      // "minute_to_hour": "1h 30m" or "2h"
      const hours = Math.floor(num / 60);
      const minutes = num % 60;
      return hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}` : `${minutes}m`;
    }
    default:
      return "";
  }
}

// Available format: "YYYY-MM-DD", "DD-MMM", "DD-MMM-YYYY", "DD-MMM-YYYY HH:mm", "YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm", "DD-MMM-YYYY HH:mm a"
export function formatDate(dateInput: string | Date | null | undefined, formatString: string = "YYYY-MM-DD"): string | undefined {
  if (!dateInput || (typeof dateInput !== "string" && !(dateInput instanceof Date))) return undefined;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (n: number): string => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const monthShort = date.toLocaleString("en-US", { month: "short" });
  const monthNumeric = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hoursNum = date.getHours();
  const hours = pad(hoursNum);
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const amPm = hoursNum >= 12 ? "PM" : "AM";

  switch (formatString) {
    case "YYYY-MM-DD":
      return `${year}-${monthNumeric}-${day}`;
    case "DD-MMM":
      return `${day}-${monthShort}`;
    case "DD-MMM-YYYY":
      return `${day}-${monthShort}-${year}`;
    case "DD MMM YYYY":
      return `${day} ${monthShort} ${year}`;
    case "DD MMM YYYY HH:mm":
      return `${day} ${monthShort} ${year} ${hours}:${minutes}`;
    case "DD-MMM-YYYY HH:mm":
      return `${day}-${monthShort}-${year} ${hours}:${minutes}`;
    case "DD-MMM-YYYY HH:mm a": {
      return `${day}-${monthShort}-${year} ${pad(((hoursNum + 11) % 12) + 1)}:${minutes} ${amPm}`;
    }
    case "DD/MM/YYYY HH:mm":
      return `${day}/${monthNumeric}/${year} ${hours}:${minutes}`;
    case "YYYY-MM-DD HH:mm":
      return `${year}-${monthNumeric}-${day} ${hours}:${minutes}`;
    case "YYYY-MM-DD HH:mm:ss":
      return `${year}-${monthNumeric}-${day} ${hours}:${minutes}:${seconds}`;
    case "HH:mm":
      return `${hours}:${minutes}`;
    case "DD-MMMM-YYYY HH:mm:ss":
      return `${day}-${monthShort}-${year} ${hours}:${minutes}:${seconds}`;
    case "DD-MMMM-YYYY HH:mm a":
      return `${day}-${monthShort}-${year} ${hours}:${minutes} ${amPm}`;
    default:
      return "";
  }
}

// Output: 012 345 6789, 012 345 6789, 012 345 6789
export function formatPhoneNumber(input: string | number | null | undefined): string {
  if (input == null || input === "") return "";
  return String(input)
    .split(",")
    .map((num) => {
      const digits = num.trim().replace(/\D/g, "");
      return digits.length >= 6 ? digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3").trim() : num.trim();
    })
    .filter(Boolean)
    .join(", ");
}

export function parse12HourTo24Hour(timeStr: string): string {
  if (!timeStr) return "";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match || !match[1] || !match[2] || !match[3]) return timeStr;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function formatTime(value: string): string {
  if (!value) return "";
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(value)) {
    return value;
  }
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const [hh = "0", mm = "0"] = value.split(":");
    const d = new Date();
    d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return value;
  }
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/**
 * Format date string for API payload (date only): "YYYY-MM-DD"
 */
export function formatDateForApi(dateStr?: string | Date | null): string {
  if (!dateStr) return new Date().toISOString().substring(0, 10);
  const formatted = formatDate(dateStr, "YYYY-MM-DD");
  return formatted || new Date().toISOString().substring(0, 10);
}

/**
 * Format date-time string for API payload: "YYYY-MM-DD HH:mm:ss"
 */
export function formatIsoDateTime(timeStr?: string, fallbackDateStr?: string): string {
  const datePart = fallbackDateStr ? formatDateForApi(fallbackDateStr) : new Date().toISOString().substring(0, 10);

  if (!timeStr) {
    return `${datePart} 00:00:00`;
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const trimmed = timeStr.trim();

  // Check for 12-hour format with AM/PM (e.g., "11:40 PM" or "02:50 PM")
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1]!, 10);
    minutes = parseInt(ampmMatch[2]!, 10);
    seconds = ampmMatch[3] ? parseInt(ampmMatch[3]!, 10) : 0;
    const period = ampmMatch[4]!.toUpperCase();

    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    hours = h;
  } else if (trimmed.includes("T")) {
    // Check for ISO date-time string (e.g., "2026-07-27T12:30:00")
    const timePart = trimmed.split("T")[1];
    if (timePart) {
      const cleanTime = timePart.replace(/Z$/, "").split(".")[0] || "00:00:00";
      const [hStr, mStr, sStr] = cleanTime.split(":");
      hours = parseInt(hStr || "0", 10);
      minutes = parseInt(mStr || "0", 10);
      seconds = parseInt(sStr || "0", 10);
    }
  } else {
    // Check for 24-hour format (e.g., "12:30" or "12:30:00")
    const cleanTime = trimmed.replace(/Z$/, "").split(".")[0] || "00:00:00";
    const [hStr, mStr, sStr] = cleanTime.split(":");
    hours = parseInt(hStr || "0", 10);
    minutes = parseInt(mStr || "0", 10);
    seconds = parseInt(sStr || "0", 10);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = pad(hours);
  const mm = pad(minutes);
  const ss = pad(seconds);

  return `${datePart} ${hh}:${mm}:${ss}`;
}

/**
 * Format count to compact notation (e.g. 1000 -> 1k, 1500 -> 1.5k, 2000 -> 2k)
 */
export function formatCompactNumber(input?: string | number | null): string {
  if (input == null || input === "") return "0";
  const cleanInput = typeof input === "string" ? input.replace(/[^0-9.-]/g, "") : input;
  const num = typeof cleanInput === "number" ? cleanInput : parseFloat(cleanInput);
  if (isNaN(num)) return "0";

  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(2).replace(/\.?0+$/, "");
    return `${formatted}k`;
  }
  return String(num);
}

/**
 * Formats a full address string to show Province and Country only (last 2 comma-separated parts).
 * Example 1: "HV7V+VVX, PhnomPenh, Cambodia" -> "PhnomPenh, Cambodia"
 * Example 2: "9V82+6QW, NR6, Krong siem raeb, Cambodia" -> "Krong siem raeb, Cambodia"
 */
export function formatLocationName(address?: string | null): string {
  if (!address || !address.trim()) return "";
  const parts = address
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(-2).join(", ");
  }
  return parts[0] || "";
}


