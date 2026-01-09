import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Search, FileText, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type DeliveryLog = Tables<"delivery_logs"> & {
  orders?: { minecraft_ign: string; products?: { name: string } | null } | null;
  rcon_servers?: { name: string } | null;
};

export default function AdminDeliveryLogs() {
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<DeliveryLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("delivery_logs")
      .select("*, orders(minecraft_ign, products(name)), rcon_servers(name)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setLogs((data as DeliveryLog[]) || []);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      log.orders?.minecraft_ign?.toLowerCase().includes(searchLower) ||
      log.command_text?.toLowerCase().includes(searchLower) ||
      log.rcon_servers?.name?.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-primary/20 text-primary border-primary/30";
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "queued":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  };

  // Calculate stats
  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    failed: logs.filter((l) => l.status === "failed").length,
    avgTime: logs.length > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.execution_time_ms || 0), 0) / logs.length)
      : 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-2xl text-foreground">Delivery Logs</h1>
            <p className="text-muted-foreground mt-1">Command execution history</p>
          </div>
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="minecraft-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Logs</p>
          </div>
          <div className="minecraft-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.success}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </div>
          <div className="minecraft-card p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          <div className="minecraft-card p-4 text-center">
            <p className="text-2xl font-bold text-secondary">{stats.avgTime}ms</p>
            <p className="text-sm text-muted-foreground">Avg Exec Time</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by player, command, server..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="minecraft-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Exec Time</TableHead>
                <TableHead className="w-[80px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No delivery logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.orders?.minecraft_ign || "Unknown"}
                    </TableCell>
                    <TableCell>{log.orders?.products?.name || "-"}</TableCell>
                    <TableCell>{log.rcon_servers?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.execution_time_ms || 0}ms</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-pixel">Log Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Player</p>
                    <p className="font-mono">{selectedLog.orders?.minecraft_ign}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Server</p>
                    <p>{selectedLog.rcon_servers?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Execution Time</p>
                    <p>{selectedLog.execution_time_ms || 0}ms</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Command</p>
                  <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">
                    {selectedLog.command_text || "No command recorded"}
                  </pre>
                </div>
                {selectedLog.error_message && (
                  <div>
                    <p className="text-sm text-destructive mb-1">Error</p>
                    <pre className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-sm text-destructive overflow-x-auto">
                      {selectedLog.error_message}
                    </pre>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="text-sm">{formatDate(selectedLog.created_at)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
