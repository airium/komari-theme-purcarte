import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeData } from "@/types/node";
import {
  formatBytes,
  formatNetworkSpeedMbps,
  formatPercentage,
  getNetworkSpeedColor,
} from "@/utils";
import { Flex } from "@radix-ui/themes";
import Loading from "@/components/loading";
import { useLoadCharts } from "@/hooks/useLoadCharts";
import { CustomTooltip } from "@/components/ui/tooltip";
import { lableFormatter, loadChartTimeFormatter } from "@/utils/chartHelper";
import type { RpcNodeStatus } from "@/types/rpc";
import { useLocale } from "@/config/hooks";
import { useAppConfig } from "@/config";

type ChartId =
  | "cpu"
  | "memory"
  | "disk"
  | "process"
  | "connections"
  | "network";

interface LoadChartsProps {
  node: NodeData;
  liveData?: RpcNodeStatus;
  isOnline: boolean;
  initialHours?: number;
}

interface TimeRange {
  label: string;
  hours: number;
}

const CHART_ORDER: ChartId[] = [
  "cpu",
  "process",
  "memory",
  "connections",
  "disk",
  "network",
];

const CHART_COLORS = ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"];

const LoadChartCard = ({
  node,
  chartId,
  liveData,
  isOnline,
  timeRanges,
  initialHours,
}: {
  node: NodeData;
  chartId: ChartId;
  liveData?: RpcNodeStatus;
  isOnline: boolean;
  timeRanges: TimeRange[];
  initialHours: number;
}) => {
  const { t } = useLocale();
  const [hours, setHours] = useState(initialHours);
  const { loading, error, chartData, memoryChartData, isDataEmpty } =
    useLoadCharts(node, hours);

  useEffect(() => {
    const hasRange = timeRanges.some((range) => range.hours === hours);
    if (!hasRange && timeRanges.length > 0) {
      setHours(timeRanges[0].hours);
    }
  }, [hours, timeRanges]);

  const chartDataLengthRef = useRef(0);
  chartDataLengthRef.current = chartData.length;

  const chartMargin = { top: 8, right: 16, bottom: 8, left: 16 };

  const config = useMemo(() => {
    switch (chartId) {
      case "cpu":
        return {
          id: "cpu",
          title: t("chart.cpu"),
          type: "area",
          value: liveData
            ? formatPercentage(liveData.cpu)
            : t("node.notAvailable"),
          dataKey: "cpu",
          yAxisDomain: [0, 100],
          yAxisFormatter: (value: number, index: number) =>
            index !== 0 ? `${value}%` : "",
          color: CHART_COLORS[0],
          data: chartData,
          tooltipFormatter: (value: number) => formatPercentage(value),
          tooltipLabel: t("chart.cpuUsageTooltip"),
        };
      case "memory":
        return {
          id: "memory",
          title: t("chart.memory"),
          type: "area",
          value: (
            <Flex gap="0" direction="column" align="end">
              <label>
                {liveData?.ram
                  ? `${formatBytes(liveData.ram)} / ${formatBytes(
                      node.mem_total || 0
                    )}`
                  : t("node.notAvailable")}
              </label>
              <label>
                {node.swap_total === 0
                  ? t("node.off")
                  : liveData?.swap
                  ? `${formatBytes(liveData.swap)} / ${formatBytes(
                      node.swap_total || 0
                    )}`
                  : t("node.notAvailable")}
              </label>
            </Flex>
          ),
          series: [
            {
              dataKey: "ram",
              color: CHART_COLORS[0],
              tooltipLabel: t("chart.memoryUsageTooltip"),
              tooltipFormatter: (value: number, raw: any) =>
                `${formatBytes(raw?.ram_raw || 0)} (${formatPercentage(value)})`,
            },
            {
              dataKey: "swap",
              color: CHART_COLORS[1],
              tooltipLabel: t("chart.swapUsageTooltip"),
              tooltipFormatter: (value: number, raw: any) =>
                node.swap_total === 0
                  ? t("node.off")
                  : `${formatBytes(raw?.swap_raw || 0)} (${formatPercentage(
                      value
                    )})`,
            },
          ],
          yAxisDomain: [0, 100],
          yAxisFormatter: (value: number, index: number) =>
            index !== 0 ? `${value}%` : "",
          data: memoryChartData,
        };
      case "disk":
        return {
          id: "disk",
          title: t("chart.disk"),
          type: "area",
          value: liveData?.disk
            ? `${formatBytes(liveData.disk)} / ${formatBytes(node.disk_total || 0)}`
            : t("node.notAvailable"),
          dataKey: "disk",
          yAxisDomain: [0, node.disk_total || 100],
          yAxisFormatter: (value: number, index: number) =>
            index !== 0 ? formatBytes(value) : "",
          color: CHART_COLORS[0],
          data: chartData,
          tooltipFormatter: (value: number) => formatBytes(value),
          tooltipLabel: t("chart.diskUsageTooltip"),
        };
      case "process":
        return {
          id: "process",
          title: t("chart.processes"),
          type: "line",
          value: liveData?.process || t("node.notAvailable"),
          dataKey: "process",
          color: CHART_COLORS[0],
          yAxisFormatter: (value: number, index: number) =>
            index !== 0 ? `${value}` : "",
          data: chartData,
          tooltipLabel: t("chart.processesTooltip"),
        };
      case "connections":
        return {
          id: "connections",
          title: t("chart.connections"),
          type: "line",
          value: (
            <Flex gap="0" align="end" direction="column">
              <span>
                {t("chart.tcpPrefix")} {liveData?.connections}
              </span>
              <span>
                {t("chart.udpPrefix")} {liveData?.connections_udp}
              </span>
            </Flex>
          ),
          series: [
            {
              dataKey: "connections",
              color: CHART_COLORS[0],
              tooltipLabel: t("chart.tcpConnections"),
            },
            {
              dataKey: "connections_udp",
              color: CHART_COLORS[1],
              tooltipLabel: t("chart.udpConnections"),
            },
          ],
          yAxisFormatter: (value: number, index: number) =>
            index !== 0 ? `${value}` : "",
          data: chartData,
        };
      default:
        return {
          id: "network",
          title: t("chart.network"),
          type: "line",
          value: (
            <Flex gap="0" align="end" direction="column">
              <span style={{ color: getNetworkSpeedColor(liveData?.net_out || 0) }}>
                {`${t("node.uploadPrefix")} ${formatNetworkSpeedMbps(
                  liveData?.net_out || 0
                )}`}
              </span>
              <span style={{ color: getNetworkSpeedColor(liveData?.net_in || 0) }}>
                {`${t("node.downloadPrefix")} ${formatNetworkSpeedMbps(
                  liveData?.net_in || 0
                )}`}
              </span>
            </Flex>
          ),
          series: [
            {
              dataKey: "net_in",
              color: CHART_COLORS[0],
              tooltipLabel: t("chart.download"),
              tooltipFormatter: (value: number) => formatNetworkSpeedMbps(value),
            },
            {
              dataKey: "net_out",
              color: CHART_COLORS[3],
              tooltipLabel: t("chart.upload"),
              tooltipFormatter: (value: number) => formatNetworkSpeedMbps(value),
            },
          ],
          yAxisFormatter: (value: number, index: number) =>
            index !== 0 ? formatNetworkSpeedMbps(value) : "",
          data: chartData,
        };
    }
  }, [
    chartData,
    chartId,
    liveData,
    memoryChartData,
    node.disk_total,
    node.mem_total,
    node.swap_total,
    t,
  ]);

  const ChartComponent = config.type === "area" ? AreaChart : LineChart;
  const DataComponent: any = config.type === "area" ? Area : Line;

  const chartConfig = config.series
    ? config.series.reduce((acc: any, series: any) => {
        acc[series.dataKey] = {
          label: series.tooltipLabel || series.dataKey,
          color: series.color,
        };
        return acc;
      }, {})
    : {
        [config.dataKey]: {
          label: config.tooltipLabel || config.dataKey,
          color: config.color,
        },
      };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-1">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <CardTitle className="text-sm font-medium whitespace-nowrap">
            {config.title}
          </CardTitle>
          <div className="flex justify-center gap-1 overflow-x-auto whitespace-nowrap">
            {timeRanges.map((range) => (
              <Button
                key={`${config.id}-${range.hours}`}
                variant={hours === range.hours ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-sm"
                onClick={() => setHours(range.hours)}>
                {range.label}
              </Button>
            ))}
          </div>
          <div className="text-sm font-bold min-h-[20px] flex items-center justify-end text-right">
            {config.value}
          </div>
        </div>
      </CardHeader>

      <div className="relative h-[170px] px-2 pb-2" style={{ minHeight: 0 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <Loading text={t("chart.loadingData")} />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        {!isOnline && !loading && hours === 0 && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <p className="text-sm font-semibold text-center px-2">
              {t("chart.nodeOfflineCannotFetchLiveData")}
            </p>
          </div>
        )}
        {isDataEmpty && !loading && hours > 0 && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <p className="text-sm font-semibold text-center px-2">
              {t("chart.offlineForTooLong", { hours })}
            </p>
          </div>
        )}

        {!loading && !isDataEmpty && (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ChartComponent
              data={config.data}
              margin={chartMargin}
              height={150}
              style={{ overflow: "visible" }}>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--theme-line-muted-color)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={{
                  stroke: "var(--theme-text-muted-color)",
                }}
                tick={{
                  fill: "var(--theme-text-muted-color)",
                }}
                tickFormatter={(value, index) =>
                  loadChartTimeFormatter(value, index, chartDataLengthRef.current)
                }
                interval={0}
                height={20}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={config.yAxisDomain}
                tickFormatter={config.yAxisFormatter}
                orientation="left"
                type="number"
                tick={{
                  dx: -8,
                  fill: "var(--theme-text-muted-color)",
                }}
                width={200}
                mirror={true}
              />
              <Tooltip
                cursor={false}
                content={(props: any) => (
                  <CustomTooltip
                    {...props}
                    chartConfig={config}
                    labelFormatter={(value) => lableFormatter(value, hours)}
                  />
                )}
              />
              {config.series ? (
                config.series.map((series: any) => (
                  <DataComponent
                    key={series.dataKey}
                    dataKey={series.dataKey}
                    animationDuration={0}
                    stroke={series.color}
                    fill={config.type === "area" ? series.color : undefined}
                    opacity={0.8}
                    dot={false}
                  />
                ))
              ) : (
                <DataComponent
                  dataKey={config.dataKey}
                  animationDuration={0}
                  stroke={config.color}
                  fill={config.type === "area" ? config.color : undefined}
                  opacity={0.8}
                  dot={false}
                />
              )}
            </ChartComponent>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
};

const LoadCharts = memo(
  ({ node, liveData, isOnline, initialHours = 0 }: LoadChartsProps) => {
    const { publicSettings } = useAppConfig();
    const { t } = useLocale();

    const maxRecordPreserveTime = publicSettings?.record_preserve_time || 0;

    const timeRanges = useMemo(() => {
      return [
        { label: t("instancePage.live"), hours: 0 },
        { label: t("instancePage.hours", { count: 1 }), hours: 1 },
        { label: t("instancePage.hours", { count: 4 }), hours: 4 },
        { label: t("instancePage.days", { count: 1 }), hours: 24 },
        { label: t("instancePage.days", { count: 7 }), hours: 168 },
        { label: t("instancePage.days", { count: 30 }), hours: 720 },
      ];
    }, [t]);

    const loadTimeRanges = useMemo(() => {
      const filtered = timeRanges.filter(
        (range) => range.hours <= maxRecordPreserveTime
      );
      if (maxRecordPreserveTime > 720) {
        const dynamicLabel =
          maxRecordPreserveTime % 24 === 0
            ? t("instancePage.days", {
                count: Math.floor(maxRecordPreserveTime / 24),
              })
            : t("instancePage.hours", { count: maxRecordPreserveTime });
        filtered.push({
          label: dynamicLabel,
          hours: maxRecordPreserveTime,
        });
      }

      return filtered;
    }, [maxRecordPreserveTime, t, timeRanges]);

    return (
      <div className="grid gap-4 md:grid-cols-2" style={{ minHeight: 0 }}>
        {CHART_ORDER.map((chartId) => (
          <LoadChartCard
            key={chartId}
            node={node}
            chartId={chartId}
            liveData={liveData}
            isOnline={isOnline}
            timeRanges={loadTimeRanges}
            initialHours={initialHours}
          />
        ))}
      </div>
    );
  }
);

export default LoadCharts;
