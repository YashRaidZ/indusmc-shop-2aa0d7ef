import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  RefreshCw,
  Server,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Zap,
} from "lucide-react";

interface HealthStatus {
  rcon: { healthy: boolean; serverCount: number; enabledCount: number };
  database: { healthy: boolean; tableCount: number };
  delivery: { healthy: boolean; queuedCount: number; failedCount: number };
}

export default function AdminSettings() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      // Check RCON servers
      const { data: servers } = await supabase
        .from("rcon_servers")
        .select("id, enabled");

      // Check delivery queue
      const { data: queue } = await supabase
        .from("delivery_queue")
        .select("status");

      const queuedCount = queue?.filter((q) => q.status === "queued").length || 0;
      const failedCount = queue?.filter((q) => q.status === "failed").length || 0;

      // Check tables exist
      // Check core tables exist by querying them
      let tableCount = 0;
      const { error: e1 } = await supabase.from("products").select("id").limit(1);
      if (!e1) tableCount++;
      const { error: e2 } = await supabase.from("orders").select("id").limit(1);
      if (!e2) tableCount++;
      const { error: e3 } = await supabase.from("delivery_logs").select("id").limit(1);
      if (!e3) tableCount++;
      const { error: e4 } = await supabase.from("rcon_servers").select("id").limit(1);
      if (!e4) tableCount++;

      setHealth({
        rcon: {
          healthy: (servers?.filter((s) => s.enabled).length || 0) > 0,
          serverCount: servers?.length || 0,
          enabledCount: servers?.filter((s) => s.enabled).length || 0,
        },
        database: {
          healthy: tableCount === 4,
          tableCount,
        },
        delivery: {
          healthy: failedCount === 0,
          queuedCount,
          failedCount,
        },
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Health check failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ healthy, warning }: { healthy: boolean; warning?: boolean }) => {
    if (warning) return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    return healthy ? (
      <CheckCircle className="h-5 w-5 text-primary" />
    ) : (
      <XCircle className="h-5 w-5 text-destructive" />
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-2xl text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">System health & configuration</p>
          </div>
          <Button variant="outline" onClick={checkHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : health ? (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="minecraft-card p-6">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                  health.rcon.healthy && health.database.healthy && health.delivery.healthy
                    ? "bg-primary/20"
                    : health.delivery.failedCount > 0
                    ? "bg-yellow-500/20"
                    : "bg-destructive/20"
                }`}>
                  <Shield className={`h-8 w-8 ${
                    health.rcon.healthy && health.database.healthy && health.delivery.healthy
                      ? "text-primary"
                      : health.delivery.failedCount > 0
                      ? "text-yellow-400"
                      : "text-destructive"
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {health.rcon.healthy && health.database.healthy && health.delivery.healthy
                      ? "All Systems Operational"
                      : health.delivery.failedCount > 0
                      ? "Attention Required"
                      : "System Issues Detected"}
                  </h2>
                  <p className="text-muted-foreground">
                    Last checked: {new Date().toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Health Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* RCON Status */}
              <div className="minecraft-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-secondary" />
                    <h3 className="font-medium">RCON Servers</h3>
                  </div>
                  <StatusIcon healthy={health.rcon.healthy} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Servers</span>
                    <span>{health.rcon.serverCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Enabled</span>
                    <span className="text-primary">{health.rcon.enabledCount}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={health.rcon.healthy
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"}
                  >
                    {health.rcon.healthy ? "Connected" : "No Servers"}
                  </Badge>
                </div>
              </div>

              {/* Database Status */}
              <div className="minecraft-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-accent" />
                    <h3 className="font-medium">Database</h3>
                  </div>
                  <StatusIcon healthy={health.database.healthy} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tables Active</span>
                    <span>{health.database.tableCount} / 4</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={health.database.healthy
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"}
                  >
                    {health.database.healthy ? "Healthy" : "Issues Detected"}
                  </Badge>
                </div>
              </div>

              {/* Delivery Status */}
              <div className="minecraft-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Delivery Queue</h3>
                  </div>
                  <StatusIcon
                    healthy={health.delivery.failedCount === 0}
                    warning={health.delivery.queuedCount > 10}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Queued</span>
                    <span className="text-yellow-400">{health.delivery.queuedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="text-destructive">{health.delivery.failedCount}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={health.delivery.failedCount === 0
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}
                  >
                    {health.delivery.failedCount === 0 ? "Clear" : "Needs Attention"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Configuration Info */}
            <div className="minecraft-card p-4">
              <h3 className="font-pixel text-sm mb-4">Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="font-medium">Supported Game Modes</p>
                    <p className="text-sm text-muted-foreground">Survival & Lifesteal only</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary">Survival</Badge>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">Lifesteal</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="font-medium">Proxy/Lobby Support</p>
                    <p className="text-sm text-muted-foreground">Disabled - No ranks, RCON, or Discord roles</p>
                  </div>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="font-medium">RCON Delivery</p>
                    <p className="text-sm text-muted-foreground">Server-side execution with failover</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Offline Queue</p>
                    <p className="text-sm text-muted-foreground">Auto-deliver on player join</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">Enabled</Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="minecraft-card p-4">
              <h3 className="font-pixel text-sm mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => window.location.href = "/admin/rcon"}>
                  <Server className="h-4 w-4 mr-2" />
                  Manage RCON Servers
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/admin/queue"}>
                  <Zap className="h-4 w-4 mr-2" />
                  View Delivery Queue
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/admin/logs"}>
                  <Database className="h-4 w-4 mr-2" />
                  View Delivery Logs
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
