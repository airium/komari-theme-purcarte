import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeData } from "@/types/node";
import {
  memo,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  formatBytes,
  formatIsoDateTime,
  formatLoadValue,
  formatNetworkSpeedMbps,
  formatUptime,
  getNetworkSpeedColor,
} from "@/utils";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useLocale } from "@/config/hooks";

interface InfoItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

const clamp2Style: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const TwoLine = ({ line1, line2 }: { line1: ReactNode; line2: ReactNode }) => (
  <div className="leading-5">
    <div className="truncate">{line1}</div>
    {line2 ? <div className="truncate">{line2}</div> : null}
  </div>
);

const FractionLines = ({
  top,
  bottom,
}: {
  top: ReactNode;
  bottom: ReactNode;
}) => (
  <div className="inline-flex flex-col items-start leading-5 max-w-full w-fit">
    <div className="truncate max-w-full">{top}</div>
    <span className="block h-px w-full bg-(--accent-6)/80 mt-0.5 mb-0.5" />
    <div className="truncate max-w-full">{bottom}</div>
  </div>
);

const InfoItem = ({ label, value, className }: InfoItemProps) => (
  <div className={`px-2 py-1 min-w-0 ${className || ""}`}>
    <p className="text-secondary-foreground leading-5 truncate">{label}</p>
    {typeof value === "string" ? (
      <p className="leading-5 text-sm whitespace-normal" style={clamp2Style}>
        {value}
      </p>
    ) : (
      <div className="overflow-hidden text-sm leading-5">
        {value}
      </div>
    )}
  </div>
);

interface InstanceProps {
  node: NodeData;
}

const normalizeDetailText = (value?: string | null) => {
  if (value === null || value === undefined) return "-";

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "none") {
    return "-";
  }

  return trimmed;
};

const Instance = memo(({ node }: InstanceProps) => {
  const { liveData } = useLiveData();
  const nodeWithStats = useMemo(
    () => ({
      ...node,
      stats: liveData?.[node.uuid],
    }),
    [node, liveData]
  );

  const { stats, isOnline } = useNodeCommons(nodeWithStats);
  const { t } = useLocale();

  const trafficUsed = useMemo(() => {
    if (!stats || !isOnline) return null;

    switch (node.traffic_limit_type) {
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
  }, [stats, isOnline, node.traffic_limit_type]);

  const trafficTypeText =
    {
      sum: "总和",
      max: "最大值",
      min: "最小值",
      up: "上传",
      down: "下载",
    }[node.traffic_limit_type || "max"] || "最大值";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{t("instancePage.title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-0 text-sm">
        {/* row 1 */}
        <InfoItem
          className="col-span-2 border-r border-b border-(--accent-7)/70"
          label={t("instancePage.os")}
          value={node.os}
        />
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("instancePage.architecture")}
          value={node.arch.toLocaleUpperCase()}
        />
        <InfoItem
          className="border-b border-(--accent-7)/70"
          label={t("instancePage.virtualization")}
          value={normalizeDetailText(node.virtualization).toLocaleUpperCase()}
        />

        {/* row 2 */}
        <InfoItem
          className="col-span-3 border-r border-b border-(--accent-7)/70"
          label={t("instancePage.cpu")}
          value={`${node.cpu_name} × ${node.cpu_cores}`}
        />
        <InfoItem
          className="border-b border-(--accent-7)/70"
          label={t("instancePage.load")}
          value={
            stats && isOnline
              ? `${formatLoadValue(stats.load)} | ${formatLoadValue(
                  stats.load5
                )} | ${formatLoadValue(stats.load15)}`
              : t("node.notAvailable")
          }
        />

        {/* row 3 */}
        <InfoItem
          className="col-span-3 border-r border-b border-(--accent-7)/70"
          label={t("instancePage.gpu")}
          value={normalizeDetailText(node.gpu_name)}
        />
        <div aria-hidden="true" className="border-b border-(--accent-7)/70" />

        {/* row 4 */}
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("instancePage.mem")}
          value={
            <FractionLines
              top={stats && isOnline ? formatBytes(stats.ram) : t("node.notAvailable")}
              bottom={formatBytes(node.mem_total)}
            />
          }
        />
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("instancePage.swap")}
          value={
            <FractionLines
              top={stats && isOnline ? formatBytes(stats.swap) : t("node.notAvailable")}
              bottom={
                node.swap_total > 0 ? formatBytes(node.swap_total) : t("node.off")
              }
            />
          }
        />
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("instancePage.disk")}
          value={
            <FractionLines
              top={stats && isOnline ? formatBytes(stats.disk) : t("node.notAvailable")}
              bottom={formatBytes(node.disk_total)}
            />
          }
        />
        <div aria-hidden="true" className="border-b border-(--accent-7)/70" />

        {/* row 5 */}
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("instancePage.realtimeNetwork")}
          value={
            stats && isOnline ? (
              <TwoLine
                line1={
                  <span style={{ color: getNetworkSpeedColor(stats.net_out) }}>
                    {`${t("node.uploadPrefix")} ${formatNetworkSpeedMbps(
                      stats.net_out
                    )}`}
                  </span>
                }
                line2={
                  <span style={{ color: getNetworkSpeedColor(stats.net_in) }}>
                    {`${t("node.downloadPrefix")} ${formatNetworkSpeedMbps(
                      stats.net_in
                    )}`}
                  </span>
                }
              />
            ) : (
              t("node.notAvailable")
            )
          }
        />
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("instancePage.totalTraffic")}
          value={
            stats && isOnline ? (
              <TwoLine
                line1={`${t("node.uploadPrefix")} ${formatBytes(
                  stats.net_total_up
                )}`}
                line2={`${t("node.downloadPrefix")} ${formatBytes(
                  stats.net_total_down
                )}`}
              />
            ) : (
              t("node.notAvailable")
            )
          }
        />
        <InfoItem
          className="border-r border-b border-(--accent-7)/70"
          label={t("node.traffic")}
          value={
            node.traffic_limit === 0
              ? "∞"
              : node.traffic_limit === undefined
              ? t("node.notSet")
              : (
                  <FractionLines
                    top={
                      stats && isOnline && trafficUsed !== null
                        ? formatBytes(trafficUsed)
                        : t("node.notAvailable")
                    }
                    bottom={`${formatBytes(node.traffic_limit)} ${trafficTypeText}`}
                  />
                )
          }
        />
        <div aria-hidden="true" className="border-b border-(--accent-7)/70" />

        {/* row 6 */}
        <InfoItem
          className="border-r border-(--accent-7)/70"
          label={t("instancePage.runtime")}
          value={formatUptime(stats?.uptime || 0)}
        />
        <InfoItem
          className="border-r border-(--accent-7)/70"
          label={t("instancePage.lastUpdated")}
          value={
            stats && isOnline
              ? formatIsoDateTime(stats.time)
              : t("node.notAvailable")
          }
        />
        <div aria-hidden="true" className="border-r border-(--accent-7)/70" />
        <div aria-hidden="true" />
      </CardContent>
    </Card>
  );
});

export default Instance;
