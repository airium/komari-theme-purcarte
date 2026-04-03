import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DateInput = Date | string | number | null | undefined;
type RGB = [number, number, number];

const NETWORK_SPEED_COLOR_STOPS: Array<{ mbps: number; color: RGB }> = [
  { mbps: 0, color: [255, 255, 255] },
  { mbps: 1, color: [34, 197, 94] },
  { mbps: 100, color: [250, 204, 21] },
  { mbps: 10000, color: [239, 68, 68] },
];

const pad2 = (value: number) => String(value).padStart(2, "0");

const parseDateInput = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatIsoDate = (value: DateInput, fallback = "N/A") => {
  const date = parseDateInput(value);
  if (!date) return fallback;

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
};

export const formatIsoTime = (
  value: DateInput,
  includeSeconds = true,
  fallback = "N/A"
) => {
  const date = parseDateInput(value);
  if (!date) return fallback;

  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return includeSeconds ? `${time}:${pad2(date.getSeconds())}` : time;
};

export const formatIsoDateTime = (
  value: DateInput,
  includeSeconds = true,
  fallback = "N/A"
) => {
  const datePart = formatIsoDate(value, fallback);
  const timePart = formatIsoTime(value, includeSeconds, fallback);

  if (datePart === fallback || timePart === fallback) {
    return fallback;
  }

  return `${datePart} ${timePart}`;
};

export const formatIsoMonthDayTime = (
  value: DateInput,
  includeSeconds = false,
  fallback = "N/A"
) => {
  const date = parseDateInput(value);
  if (!date) return fallback;

  const datePart = `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  const timePart = formatIsoTime(date, includeSeconds, fallback);

  return timePart === fallback ? fallback : `${datePart} ${timePart}`;
};

export const formatSignificantDigits = (
  value: number,
  significantDigits = 3,
  fallback = "N/A"
) => {
  if (!Number.isFinite(value)) return fallback;

  const digits = Math.max(1, Math.floor(significantDigits));
  const rounded = Number(value.toPrecision(digits));
  const absRounded = Math.abs(rounded);
  const digitsBeforeDecimal =
    absRounded === 0 ? 1 : Math.floor(Math.log10(absRounded)) + 1;
  const decimalsNeeded = Math.max(0, digits - digitsBeforeDecimal);
  const decimals = Math.min(2, decimalsNeeded);

  return rounded.toFixed(decimals);
};

export const formatPercentage = (
  value: number,
  significantDigits = 3,
  fallback = "N/A"
) => {
  const formatted = formatSignificantDigits(value, significantDigits, fallback);
  return formatted === fallback ? fallback : `${formatted}%`;
};

export const formatLoadValue = (
  value: number,
  significantDigits = 3,
  fallback = "N/A"
) => {
  if (!Number.isFinite(value)) return fallback;

  return formatSignificantDigits(value, significantDigits, fallback);
};

export const bytesPerSecondToMbps = (bytesPerSecond: number) =>
  (bytesPerSecond * 8) / 1_000_000;

export const formatNetworkSpeedMbps = (
  bytesPerSecond: number,
  significantDigits = 3,
  fallback = "N/A"
) => {
  if (!Number.isFinite(bytesPerSecond)) return fallback;

  const mbps = bytesPerSecondToMbps(bytesPerSecond);
  const formatted = formatSignificantDigits(mbps, significantDigits, fallback);
  return formatted === fallback ? fallback : `${formatted} Mbps`;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mixColor = (from: RGB, to: RGB, ratio: number): RGB => {
  const t = clamp01(ratio);
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
};

const rgbToCss = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

export const getNetworkSpeedColor = (bytesPerSecond: number) => {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return rgbToCss(NETWORK_SPEED_COLOR_STOPS[0].color);
  }

  const mbps = bytesPerSecondToMbps(bytesPerSecond);
  if (mbps <= 1) {
    return rgbToCss(
      mixColor(
        NETWORK_SPEED_COLOR_STOPS[0].color,
        NETWORK_SPEED_COLOR_STOPS[1].color,
        mbps
      )
    );
  }

  if (mbps <= 100) {
    const ratio = Math.log10(mbps) / 2;
    return rgbToCss(
      mixColor(
        NETWORK_SPEED_COLOR_STOPS[1].color,
        NETWORK_SPEED_COLOR_STOPS[2].color,
        ratio
      )
    );
  }

  if (mbps <= 10000) {
    const ratio = (Math.log10(mbps) - 2) / 2;
    return rgbToCss(
      mixColor(
        NETWORK_SPEED_COLOR_STOPS[2].color,
        NETWORK_SPEED_COLOR_STOPS[3].color,
        ratio
      )
    );
  }

  return rgbToCss(NETWORK_SPEED_COLOR_STOPS[3].color);
};

// Helper function to format bytes
export const formatBytes = (
  bytes: number,
  isSpeed = false,
  significantDigits = 3
) => {
  if (isSpeed) {
    return formatNetworkSpeedMbps(bytes, significantDigits);
  }
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

  let i = Math.floor(Math.log(bytes) / Math.log(k));
  let value = bytes / Math.pow(k, i);

  // 如果值大于等于1000，则进位到下一个单位
  if (value >= 1000 && i < sizes.length - 1) {
    i++;
    value = bytes / Math.pow(k, i);
  }

  return `${formatSignificantDigits(value, significantDigits)} ${sizes[i]}`;
};

// Helper function to format uptime
export const formatUptime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return "N/A";
  }

  const hours = seconds / 3600;
  return formatSignificantDigits(hours, 3, "N/A");
};

export interface PriceFormatLabels {
  free?: string;
  billingCycleDays?: string;
  billingCycleMonth?: string;
  billingCycleQuarter?: string;
  billingCycleHalfYear?: string;
  billingCycleYear?: string;
  billingCycleTwoYears?: string;
  billingCycleThreeYears?: string;
  billingCycleFiveYears?: string;
}

export type TrafficLimitType = "sum" | "max" | "min" | "up" | "down";

export interface TrafficTypeLabels {
  sum?: string;
  max?: string;
  min?: string;
  up?: string;
  down?: string;
}

interface TrafficLimitLabels {
  notSet?: string;
  unlimited?: string;
  typeLabels?: TrafficTypeLabels;
}

const DEFAULT_TRAFFIC_TYPE_LABELS: Required<TrafficTypeLabels> = {
  sum: "Total",
  max: "Maximum",
  min: "Minimum",
  up: "Upload",
  down: "Download",
};

export const getTrafficLimitTypeLabel = (
  type: TrafficLimitType,
  labels: TrafficTypeLabels = {}
) => {
  const merged = { ...DEFAULT_TRAFFIC_TYPE_LABELS, ...labels };
  return merged[type] || merged.max;
};

export const formatPrice = (
  price: number,
  currency: string,
  billingCycle: number,
  labels: PriceFormatLabels = {}
) => {
  if (price === -1) return labels.free || "FREE";
  if (price === 0) return "";
  if (!currency || !billingCycle) return "";

  const daysTemplate = labels.billingCycleDays || "{days} days";
  let cycleStr = daysTemplate.replace("{days}", String(billingCycle));
  if (billingCycle < 0) {
    return `${currency}${price.toFixed(2)}`;
  } else if (billingCycle === 30 || billingCycle === 31) {
    cycleStr = labels.billingCycleMonth || "mo";
  } else if (billingCycle >= 89 && billingCycle <= 92) {
    cycleStr = labels.billingCycleQuarter || "3 mo";
  } else if (billingCycle >= 180 && billingCycle <= 183) {
    cycleStr = labels.billingCycleHalfYear || "6 mo";
  } else if (billingCycle >= 364 && billingCycle <= 366) {
    cycleStr = labels.billingCycleYear || "yr";
  } else if (billingCycle >= 730 && billingCycle <= 732) {
    cycleStr = labels.billingCycleTwoYears || "2 yrs";
  } else if (billingCycle >= 1095 && billingCycle <= 1097) {
    cycleStr = labels.billingCycleThreeYears || "3 yrs";
  } else if (billingCycle >= 1825 && billingCycle <= 1827) {
    cycleStr = labels.billingCycleFiveYears || "5 yrs";
  }

  return `${currency}${price.toFixed(2)}/${cycleStr}`;
};

export const formatTrafficLimit = (
  limit?: number,
  type: TrafficLimitType = "max",
  labels: TrafficLimitLabels = {}
) => {
  if (limit === undefined) return labels.notSet || "Not set";
  if (limit === 0) return labels.unlimited || "∞";

  const limitText = formatBytes(limit);

  const typeText = getTrafficLimitTypeLabel(type, labels.typeLabels || {});

  return `${typeText}: ${limitText}`;
};

export const getProgressBarClass = (percentage: number) => {
  if (percentage > 90) return "bg-red-600";
  if (percentage > 50) return "bg-yellow-400";
  return "bg-green-500";
};
