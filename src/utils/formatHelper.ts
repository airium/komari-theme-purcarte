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
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  const mns = Math.floor(seconds / 60);

  let uptimeString = "";
  if (days > 0) {
    uptimeString += `${days}天`;
  }
  if (hrs > 0) {
    uptimeString += `${hrs}小时`;
  }
  if (mns > 0 && days === 0) {
    // Only show minutes if uptime is less than a day
    uptimeString += `${mns}分钟`;
  }
  if (uptimeString === "") {
    return "刚刚";
  }

  return uptimeString;
};

export const formatPrice = (
  price: number,
  currency: string,
  billingCycle: number
) => {
  if (price === -1) return "免费";
  if (price === 0) return "";
  if (!currency || !billingCycle) return "N/A";

  let cycleStr = `${billingCycle}天`;
  if (billingCycle < 0) {
    return `${currency}${price.toFixed(2)}`;
  } else if (billingCycle === 30 || billingCycle === 31) {
    cycleStr = "月";
  } else if (billingCycle >= 89 && billingCycle <= 92) {
    cycleStr = "季";
  } else if (billingCycle >= 180 && billingCycle <= 183) {
    cycleStr = "半年";
  } else if (billingCycle >= 364 && billingCycle <= 366) {
    cycleStr = "年";
  } else if (billingCycle >= 730 && billingCycle <= 732) {
    cycleStr = "两年";
  } else if (billingCycle >= 1095 && billingCycle <= 1097) {
    cycleStr = "三年";
  } else if (billingCycle >= 1825 && billingCycle <= 1827) {
    cycleStr = "五年";
  }

  return `${currency}${price.toFixed(2)}/${cycleStr}`;
};

export const formatTrafficLimit = (
  limit?: number,
  type?: "sum" | "max" | "min" | "up" | "down"
) => {
  if (limit === undefined) return "未设置";
  if (limit === 0) return "无限制";

  const limitText = formatBytes(limit);

  const typeText =
    {
      sum: "总和",
      max: "最大值",
      min: "最小值",
      up: "上传",
      down: "下载",
    }[type || "max"] || "";

  return `${typeText}: ${limitText}`;
};

export const getProgressBarClass = (percentage: number) => {
  if (percentage > 90) return "bg-red-600";
  if (percentage > 50) return "bg-yellow-400";
  return "bg-green-500";
};
