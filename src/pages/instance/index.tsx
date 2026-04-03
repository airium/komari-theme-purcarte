import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import type { NodeData } from "@/types/node";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Instance from "./Instance";
const LoadCharts = lazy(() => import("./LoadCharts"));
const PingChart = lazy(() => import("./PingChart"));
import Loading from "@/components/loading";
import Flag from "@/components/sections/Flag";
import { useAppConfig } from "@/config";
import { useLocale } from "@/config/hooks";
import { Card } from "@/components/ui/card";
import { getOSImage } from "@/utils";

const InstancePage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { nodes: staticNodes, loading: nodesLoading } = useNodeData();
  const { liveData } = useLiveData();
  const [staticNode, setStaticNode] = useState<NodeData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { enableInstanceDetail, enablePingChart } = useAppConfig();
  const { t } = useLocale();

  const allNodes = useMemo(
    () => (Array.isArray(staticNodes) ? staticNodes : []),
    [staticNodes]
  );

  useEffect(() => {
    const foundNode = allNodes.find((n: NodeData) => n.uuid === uuid);
    setStaticNode(foundNode || null);
  }, [allNodes, uuid]);

  useEffect(() => {
    setIsReady(false);
  }, [uuid]);

  const stats = useMemo(() => {
    if (!staticNode || !liveData) return undefined;
    return liveData[staticNode.uuid];
  }, [staticNode, liveData]);

  const node = staticNode;
  const isOnline = stats?.online ?? false;

  useEffect(() => {
    if (nodesLoading) {
      setIsReady(false);
      return;
    }

    if (!node) {
      return;
    }

    const timer = setTimeout(() => setIsReady(true), 300);

    return () => clearTimeout(timer);
  }, [node, nodesLoading]);

  if (!node || !staticNode) {
    if (nodesLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loading text={t("instancePage.loadingNodeInfo")} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        {t("instancePage.nodeNotFound")}
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading
          text={t("instancePage.enteringNodeDetails")}
          className={!nodesLoading ? "fade-out" : ""}
        />
      </div>
    );
  }

  return (
    <div className="text-card-foreground space-y-4 my-4 fade-in @container">
      <Card className="p-3 md:p-4 text-primary">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Button
              className="flex-shrink-0"
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}>
              <ArrowLeft />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2">
                {allNodes.map((item) => {
                  const tileOnline = liveData?.[item.uuid]?.online ?? false;
                  const isCurrent = item.uuid === node.uuid;

                  return (
                    <Button
                      key={item.uuid}
                      type="button"
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={`h-auto px-3 py-2 justify-start max-w-full border ${
                        isCurrent ? "ring-2 ring-(--accent-8)" : ""
                      } ${
                        !tileOnline
                          ? "striped-bg-red-translucent-diagonal border-red-500/60 text-red-600 dark:text-red-300"
                          : ""
                      }`}
                      onClick={() => navigate(`/instance/${item.uuid}`)}>
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Flag flag={item.region} size="4" />
                        <img
                          src={getOSImage(item.os)}
                          alt={item.os}
                          className="size-4 object-contain"
                          loading="lazy"
                        />
                        <span className="max-w-[12rem] truncate">{item.name}</span>
                        <span
                          className={`text-xs font-semibold ${
                            tileOnline ? "text-green-500" : "text-red-500"
                          }`}>
                          {tileOnline ? t("node.online") : t("node.offline")}
                        </span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <span className="flex items-center gap-2 min-w-0 text-sm text-secondary-foreground">
            <Flag flag={node.region} size="4" />
            <img
              src={getOSImage(node.os)}
              alt={node.os}
              className="size-4 object-contain"
              loading="lazy"
            />
            <span className="truncate font-semibold text-primary">{node.name}</span>
            <span
              className={`font-semibold ${
                isOnline ? "text-green-500" : "text-red-500"
              }`}>
              {isOnline ? t("node.online") : t("node.offline")}
            </span>
          </span>
        </div>
      </Card>

      <div className={`grid gap-4 ${enableInstanceDetail ? "xl:grid-cols-3" : ""}`}>
        {enableInstanceDetail && node && (
          <div className="xl:col-span-1 @container">
            <Instance node={node} />
          </div>
        )}
        <div className={enableInstanceDetail ? "xl:col-span-2" : ""}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-96">
                <Loading text={t("chart.loading")} />
              </div>
            }>
            <LoadCharts
              node={node}
              initialHours={0}
              liveData={stats}
              isOnline={isOnline}
            />
          </Suspense>
        </div>
      </div>

      {enablePingChart ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-96">
              <Loading text={t("chart.loading")} />
            </div>
          }>
          <PingChart node={node} initialHours={1} />
        </Suspense>
      ) : null}
    </div>
  );
};

export default InstancePage;
