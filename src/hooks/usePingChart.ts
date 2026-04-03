import { useState, useEffect } from "react";
import { useNodeData } from "@/contexts/NodeDataContext";
import type { PingHistoryResponse, NodeData } from "@/types/node";
import { useLocale } from "@/config/hooks";

const cache = new Map<string, PingHistoryResponse>();

export const usePingChart = (node: NodeData | null, hours: number) => {
  const { t } = useLocale();
  const { getPingHistory } = useNodeData();
  const [pingHistory, setPingHistory] = useState<PingHistoryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!node?.uuid) {
      setPingHistory(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${node.uuid}-${hours}`;

    if (cache.has(cacheKey)) {
      setPingHistory(cache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchHistory = async () => {
      try {
        const data = await getPingHistory(node.uuid, hours);
        if (data) {
          cache.set(cacheKey, data);
        }
        setPingHistory(data);
      } catch (err: any) {
        setError(err.message || t("chart.fetchPingHistoryError"));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [node?.uuid, hours, getPingHistory, t]);

  return {
    loading,
    error,
    pingHistory,
  };
};
