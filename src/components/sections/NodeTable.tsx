import {
  cn,
  formatBytes,
  formatNetworkSpeedMbps,
  formatPercentage,
  formatPrice,
  formatUptime,
  getNetworkSpeedColor,
  getOSImage,
  getRegionDisplayName,
} from "@/utils";
import type { NodeData } from "@/types/node";
import { Link } from "react-router-dom";
import {
  CpuIcon,
  MemoryStickIcon,
  HardDriveIcon,
  ChevronRight,
} from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { ProgressBar } from "../ui/progress-bar";
import { useState, useEffect, useMemo } from "react";
import Instance from "@/pages/instance/Instance";
import PingChart from "@/pages/instance/PingChart";
import { useAppConfig } from "@/config";
import { useLocale } from "@/config/hooks";
import { Card } from "../ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeTableProps {
  nodes: NodeData[];
  enableListItemProgressBar: boolean;
}

const TABLE_COLUMN_TEMPLATE = [
  "2rem",
  "minmax(8rem, 0.5fr)",
  "minmax(6rem, 3fr)",
  "minmax(6rem, 0fr)",
  "minmax(6rem, 0fr)",
  "minmax(12rem, 1fr)",
  "minmax(12rem, 1fr)",
  "minmax(12rem, 1fr)",
  "minmax(6rem, 0fr)",
  "minmax(6rem, 0fr)",
  "minmax(12rem, 1fr)",
].join(" ");

const TWO_LINE_CELL_CLASS = "min-w-0 h-9 grid grid-rows-2 items-center";

export const NodeTable = ({
  nodes,
  enableListItemProgressBar,
}: NodeTableProps) => {
  const { t } = useLocale();

  return (
    <ScrollArea className="w-full" showHorizontalScrollbar>
      <div className="min-w-[1600px] px-1 pb-1">
        <div className="space-y-0.5">
          <Card
            className="theme-card-style text-primary font-semibold grid gap-x-2 gap-y-1 p-1.5 items-center text-xs"
            style={{ gridTemplateColumns: TABLE_COLUMN_TEMPLATE }}>
            <div className="text-center">#</div>
            <div className="text-left">{t("node.name")}</div>
            <div className="text-left">标签</div>
            <div className="text-left">{t("node.expiredAt")}</div>
            <div className="text-left">{t("node.uptime")}</div>
            <div className="text-left flex items-center gap-1">
              <CpuIcon className="size-4 text-blue-600" />
              <span>{t("node.cpu")}</span>
            </div>
            <div className="text-left flex items-center gap-1">
              <MemoryStickIcon className="size-4 text-green-600" />
              <span>{t("node.mem")}</span>
            </div>
            <div className="text-left flex items-center gap-1">
              <HardDriveIcon className="size-4 text-red-600" />
              <span>{t("node.disk")}</span>
            </div>
            <div className="text-center">网速</div>
            <div className="text-center">流量</div>
            <div className="text-left">配额</div>
          </Card>
          {nodes.map((node) => (
            <NodeTableRow
              key={node.uuid}
              node={node}
              enableListItemProgressBar={enableListItemProgressBar}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

interface NodeTableRowProps {
  node: NodeData;
  enableListItemProgressBar: boolean;
}

const NodeTableRow = ({ node, enableListItemProgressBar }: NodeTableRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderChart, setShouldRenderChart] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRenderChart(true);
    }
  }, [isOpen]);

  const {
    stats,
    isOnline,
    cpuUsage,
    memUsage,
    diskUsage,
    load,
    expired_at,
    trafficPercentage,
  } = useNodeCommons(node);
  const { pingChartTimeInPreview, enableInstanceDetail, enablePingChart } =
    useAppConfig();
  const { t } = useLocale();

  const customTags = useMemo(() => {
    if (typeof node.tags !== "string") return [];
    return node.tags
      .split(";")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [node.tags]);

  const regionName = getRegionDisplayName(node.region, "zh");
  const nodePrice = formatPrice(node.price, node.currency, node.billing_cycle);
  const trafficType = node.traffic_limit_type || "max";
  const trafficTypeText =
    {
      sum: "总和",
      max: "最大值",
      min: "最小值",
      up: "上传",
      down: "下载",
    }[trafficType] || "最大值";
  const hasTrafficLimit =
    typeof node.traffic_limit === "number" && node.traffic_limit > 0;
  const isUnlimitedTraffic = node.traffic_limit === 0;

  const usedTraffic = useMemo(() => {
    if (!stats) return 0;

    switch (trafficType) {
      case "up":
        return stats.net_total_up;
      case "down":
        return stats.net_total_down;
      case "sum":
        return stats.net_total_up + stats.net_total_down;
      case "min":
        return Math.min(stats.net_total_up, stats.net_total_down);
      default:
        return Math.max(stats.net_total_up, stats.net_total_down);
    }
  }, [stats, trafficType]);

  const trafficQuotaSummary = useMemo(() => {
    if (isUnlimitedTraffic) {
      return "∞";
    }

    if (!hasTrafficLimit) {
      return t("node.notSet");
    }

    if (!stats || !isOnline) {
      return `${t("node.notAvailable")} (${t("node.notAvailable")} / ${formatBytes(
        node.traffic_limit || 0
      )} ${trafficTypeText})`;
    }

    return `${formatPercentage(trafficPercentage)} (${formatBytes(
      usedTraffic
    )} / ${formatBytes(node.traffic_limit || 0)} ${trafficTypeText})`;
  }, [
    hasTrafficLimit,
    isOnline,
    isUnlimitedTraffic,
    node.traffic_limit,
    stats,
    t,
    trafficPercentage,
    trafficTypeText,
    usedTraffic,
  ]);

  const remainingText = useMemo(() => {
    if (!node.expired_at || new Date(node.expired_at).getTime() <= 0) {
      return "";
    }
    const daysLeft = Math.ceil(
      (new Date(node.expired_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft > 36500) return "";
    if (daysLeft < 0) return t("node.expired");
    return t("node.daysLeft", { daysLeft });
  }, [node.expired_at, t]);

  const loadLine = load.split("|").map((item) => item.trim()).join(", ");
  const cpuSummary = isOnline
    ? `${node.cpu_cores}C @ ${formatPercentage(cpuUsage)} (${loadLine})`
    : `${node.cpu_cores}C @ ${t("node.notAvailable")} (${t("node.notAvailable")})`;

  const memSummary = isOnline && stats
    ? `${formatPercentage(memUsage)} (${formatBytes(stats.ram)} / ${formatBytes(
        node.mem_total
      )})`
    : `${t("node.notAvailable")} (${formatBytes(node.mem_total)})`;

  const diskSummary = isOnline && stats
    ? `${formatPercentage(diskUsage)} (${formatBytes(stats.disk)} / ${formatBytes(
        node.disk_total
      )})`
    : `${t("node.notAvailable")} (${formatBytes(node.disk_total)})`;

  return (
    <Card
      className={
        !isOnline
          ? "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
          : ""
      }>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="grid gap-x-2 gap-y-1 p-1.5 text-primary transition-colors duration-200 cursor-pointer items-center text-xs"
        style={{ gridTemplateColumns: TABLE_COLUMN_TEMPLATE }}>
        <div className="flex justify-center pt-0.5">
          <ChevronRight
            className={`transition-transform size-4 ${isOpen ? "rotate-90" : ""}`}
          />
        </div>

        <div className="min-w-0 text-left leading-tight">
          <Link
            to={`/instance/${node.uuid}`}
            onClick={(e) => e.stopPropagation()}
            className="block hover:underline hover:text-(--accent-11) truncate text-sm font-semibold">
            {node.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-1 text-secondary-foreground min-w-0 truncate">
            <span title={regionName} className="inline-flex items-center">
              <Flag flag={node.region} size={"4"} />
            </span>
            <span title={node.os} className="inline-flex items-center">
              <img
                src={getOSImage(node.os)}
                alt={node.os}
                className="size-4 object-contain"
                loading="lazy"
              />
            </span>
            <span className="truncate">{nodePrice || ""}</span>
          </div>
        </div>

        <div className="min-w-0 text-left">
          {customTags.length > 0 ? (
            <div className="max-h-8 overflow-hidden">
              <Tag
                className="!gap-0.5 origin-top-left scale-95 [&_.rt-Badge]:!text-[11px] [&_[data-accent-color]]:!text-[11px]"
                tags={customTags}
              />
            </div>
          ) : (
            <div className="truncate text-secondary-foreground">-</div>
          )}
        </div>

        <div className={cn(TWO_LINE_CELL_CLASS, "text-left leading-tight")}>
          <div className="truncate">{expired_at}</div>
          <div className="truncate text-secondary-foreground">{remainingText}</div>
        </div>

        <div className={cn(TWO_LINE_CELL_CLASS, "text-left leading-tight")}>
          <div className="truncate">
            {isOnline && stats ? formatUptime(stats.uptime) : t("node.offline")}
          </div>
          <div></div>
        </div>

        <div className={cn(TWO_LINE_CELL_CLASS, "text-left leading-tight")}>
          <div className="truncate">{cpuSummary}</div>
          <div className="flex items-center h-2">
            {enableListItemProgressBar ? <ProgressBar value={cpuUsage} h="h-2" /> : null}
          </div>
        </div>

        <div className={cn(TWO_LINE_CELL_CLASS, "text-left leading-tight")}>
          <div className="truncate">{memSummary}</div>
          <div className="flex items-center h-2">
            {enableListItemProgressBar ? <ProgressBar value={memUsage} h="h-2" /> : null}
          </div>
        </div>

        <div className={cn(TWO_LINE_CELL_CLASS, "text-left leading-tight")}>
          <div className="truncate">{diskSummary}</div>
          <div className="flex items-center h-2">
            {enableListItemProgressBar ? <ProgressBar value={diskUsage} h="h-2" /> : null}
          </div>
        </div>

        <div className="min-w-0 text-center leading-tight">
          <div className="truncate">
            {stats ? (
              <span style={{ color: getNetworkSpeedColor(stats.net_out) }}>
                {`${t("node.uploadPrefix")} ${formatNetworkSpeedMbps(
                  stats.net_out
                )}`}
              </span>
            ) : (
              t("node.notAvailable")
            )}
          </div>
          <div className="truncate">
            {stats ? (
              <span style={{ color: getNetworkSpeedColor(stats.net_in) }}>
                {`${t("node.downloadPrefix")} ${formatNetworkSpeedMbps(
                  stats.net_in
                )}`}
              </span>
            ) : (
              t("node.notAvailable")
            )}
          </div>
        </div>

        <div className="min-w-0 text-center leading-tight">
          <div className="truncate">
            {stats
              ? `${t("node.uploadPrefix")} ${formatBytes(stats.net_total_up)}`
              : t("node.notAvailable")}
          </div>
          <div className="truncate">
            {stats
              ? `${t("node.downloadPrefix")} ${formatBytes(stats.net_total_down)}`
              : t("node.notAvailable")}
          </div>
        </div>

        <div className={cn(TWO_LINE_CELL_CLASS, "text-left leading-tight")}>
          <div className="truncate">{trafficQuotaSummary}</div>
          <div className="flex items-center h-2">
            {hasTrafficLimit ? (
              <ProgressBar value={isOnline ? trafficPercentage : 0} h="h-2" />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
        onTransitionEnd={() => {
          if (!isOpen) {
            setShouldRenderChart(false);
          }
        }}>
        <div
          className={cn(
            "grid gap-4 p-2",
            enablePingChart ? "grid-cols-3" : ""
          )}>
          {enableInstanceDetail && (
            <div className="col-span-1 @container">
              <Instance node={node} />
            </div>
          )}
          {enablePingChart && (
            <div className={enableInstanceDetail ? "col-span-2" : "col-span-3"}>
              {shouldRenderChart && (
                <PingChart node={node} initialHours={pingChartTimeInPreview} />
              )}
            </div>
          )}
          {!enableInstanceDetail && !enablePingChart && (
            <div className="flex items-center justify-center">
              <div className="text-lg">{t("homePage.noDetailsAvailable")}</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
