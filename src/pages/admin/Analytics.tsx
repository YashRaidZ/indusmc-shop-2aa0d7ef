import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsData {
  deliveriesPerServer: { name: string; count: number }[];
  failureRatePerServer: { name: string; success: number; failed: number; rate: number }[];
  dailyDeliveries: { date: string; delivered: number; failed: number; queued: number }[];
  avgDeliveryTime: number;
  onlineVsOffline: { type: string; count: number }[];
  totalDeliveries: number;
  successRate: number;
}

const COLORS = ["hsl(142, 76%, 45%)", "hsl(0, 84%, 60%)", "hsl(45, 93%, 47%)"];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch delivery logs
      const { data: logs, error: logsError } = await supabase
        .from("delivery_logs")
        .select("*, rcon_servers(name)")
        .gte("created_at", startDate.toISOString());

      if (logsError) throw logsError;

      // Fetch orders for online vs offline analysis
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("delivery_status, created_at")
        .gte("created_at", startDate.toISOString());

      if (ordersError) throw ordersError;

      // Process data
      const serverCounts: Record<string, { success: number; failed: number }> = {};
      let totalTime = 0;
      let timeCount = 0;

      logs?.forEach((log) => {
        const serverName = log.rcon_servers?.name || "Unknown";
        if (!serverCounts[serverName]) {
          serverCounts[serverName] = { success: 0, failed: 0 };
        }
        if (log.status === "success") {
          serverCounts[serverName].success++;
        } else if (log.status === "failed") {
          serverCounts[serverName].failed++;
        }
        if (log.execution_time_ms) {
          totalTime += log.execution_time_ms;
          timeCount++;
        }
      });

      const deliveriesPerServer = Object.entries(serverCounts).map(([name, counts]) => ({
        name,
        count: counts.success + counts.failed,
      }));

      const failureRatePerServer = Object.entries(serverCounts).map(([name, counts]) => ({
        name,
        success: counts.success,
        failed: counts.failed,
        rate: counts.success + counts.failed > 0
          ? Math.round((counts.failed / (counts.success + counts.failed)) * 100)
          : 0,
      }));

      // Daily deliveries
      const dailyMap: Record<string, { delivered: number; failed: number; queued: number }> = {};
      orders?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        if (!dailyMap[date]) {
          dailyMap[date] = { delivered: 0, failed: 0, queued: 0 };
        }
        if (order.delivery_status === "delivered") dailyMap[date].delivered++;
        else if (order.delivery_status === "failed") dailyMap[date].failed++;
        else if (order.delivery_status === "queued") dailyMap[date].queued++;
      });

      const dailyDeliveries = Object.entries(dailyMap)
        .map(([date, counts]) => ({ date, ...counts }))
        .slice(-14); // Last 14 days max

      // Online vs Offline
      const onlineVsOffline = [
        { type: "Instant", count: orders?.filter((o) => o.delivery_status === "delivered").length || 0 },
        { type: "Queued", count: orders?.filter((o) => o.delivery_status === "queued").length || 0 },
        { type: "Failed", count: orders?.filter((o) => o.delivery_status === "failed").length || 0 },
      ];

      const totalSuccess = logs?.filter((l) => l.status === "success").length || 0;
      const totalFailed = logs?.filter((l) => l.status === "failed").length || 0;

      setData({
        deliveriesPerServer,
        failureRatePerServer,
        dailyDeliveries,
        avgDeliveryTime: timeCount > 0 ? Math.round(totalTime / timeCount) : 0,
        onlineVsOffline,
        totalDeliveries: totalSuccess + totalFailed,
        successRate: totalSuccess + totalFailed > 0
          ? Math.round((totalSuccess / (totalSuccess + totalFailed)) * 100)
          : 0,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load analytics",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    
    const csvContent = [
      ["Metric", "Value"],
      ["Total Deliveries", data.totalDeliveries],
      ["Success Rate", `${data.successRate}%`],
      ["Avg Delivery Time", `${data.avgDeliveryTime}ms`],
      [""],
      ["Server", "Deliveries", "Success", "Failed", "Failure Rate"],
      ...data.failureRatePerServer.map((s) => [s.name, s.success + s.failed, s.success, s.failed, `${s.rate}%`]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-pixel text-2xl text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Delivery performance insights</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV} disabled={!data}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="minecraft-card p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{data.totalDeliveries}</p>
                    <p className="text-sm text-muted-foreground">Total Deliveries</p>
                  </div>
                </div>
              </div>
              <div className="minecraft-card p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{data.successRate}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </div>
              <div className="minecraft-card p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold">{data.avgDeliveryTime}ms</p>
                    <p className="text-sm text-muted-foreground">Avg Exec Time</p>
                  </div>
                </div>
              </div>
              <div className="minecraft-card p-4">
                <div className="flex items-center gap-3">
                  <Server className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{data.deliveriesPerServer.length}</p>
                    <p className="text-sm text-muted-foreground">Active Servers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Deliveries Per Server */}
              <div className="minecraft-card p-4">
                <h3 className="font-pixel text-sm mb-4">Deliveries Per Server</h3>
                {data.deliveriesPerServer.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.deliveriesPerServer}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>

              {/* Delivery Status Distribution */}
              <div className="minecraft-card p-4">
                <h3 className="font-pixel text-sm mb-4">Delivery Distribution</h3>
                {data.onlineVsOffline.some((d) => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.onlineVsOffline}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        nameKey="type"
                        label={({ type, count }) => `${type}: ${count}`}
                      >
                        {data.onlineVsOffline.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Daily Trend */}
            <div className="minecraft-card p-4">
              <h3 className="font-pixel text-sm mb-4">Daily Delivery Trend</h3>
              {data.dailyDeliveries.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyDeliveries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="delivered" stroke="hsl(142, 76%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 76%, 45%)" }} />
                    <Line type="monotone" dataKey="failed" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ fill: "hsl(0, 84%, 60%)" }} />
                    <Line type="monotone" dataKey="queued" stroke="hsl(45, 93%, 47%)" strokeWidth={2} dot={{ fill: "hsl(45, 93%, 47%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </div>

            {/* Failure Rate Table */}
            <div className="minecraft-card p-4">
              <h3 className="font-pixel text-sm mb-4">Server Failure Rates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Server</th>
                      <th className="text-right py-2 text-muted-foreground">Success</th>
                      <th className="text-right py-2 text-muted-foreground">Failed</th>
                      <th className="text-right py-2 text-muted-foreground">Failure Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.failureRatePerServer.length > 0 ? (
                      data.failureRatePerServer.map((server) => (
                        <tr key={server.name} className="border-b border-border/50">
                          <td className="py-2">{server.name}</td>
                          <td className="text-right py-2 text-primary">{server.success}</td>
                          <td className="text-right py-2 text-destructive">{server.failed}</td>
                          <td className="text-right py-2">
                            <span className={server.rate > 20 ? "text-destructive" : server.rate > 5 ? "text-yellow-400" : "text-primary"}>
                              {server.rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          No server data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
