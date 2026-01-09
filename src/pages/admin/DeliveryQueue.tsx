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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Play, Search, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type DeliveryQueueItem = Tables<"delivery_queue"> & {
  orders?: {
    id: string;
    products?: { name: string } | null;
  } | null;
};

export default function AdminDeliveryQueue() {
  const [queue, setQueue] = useState<DeliveryQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [retrying, setRetrying] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("delivery_queue")
      .select("*, orders(id, products(name))")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setQueue((data as DeliveryQueueItem[]) || []);
    }
    setLoading(false);
  };

  const retryDelivery = async (item: DeliveryQueueItem) => {
    setRetrying(item.id);
    try {
      const { error } = await supabase.functions.invoke("rcon-delivery", {
        body: { orderId: item.order_id, action: "retry" },
      });

      if (error) throw error;

      toast({ title: "Retry initiated", description: "Delivery retry has been queued" });
      fetchQueue();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Retry failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setRetrying(null);
    }
  };

  const forceResolve = async (id: string, status: "delivered" | "failed") => {
    const { error } = await supabase
      .from("delivery_queue")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: `Marked as ${status}` });
      fetchQueue();
    }
  };

  const filteredQueue = queue.filter((item) => {
    const matchesSearch = item.minecraft_ign.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "delivered":
        return "bg-primary/20 text-primary border-primary/30";
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "processing":
        return "bg-secondary/20 text-secondary border-secondary/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-2xl text-foreground">Delivery Queue</h1>
            <p className="text-muted-foreground mt-1">Manage pending and failed deliveries</p>
          </div>
          <Button variant="outline" onClick={fetchQueue} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by IGN..."
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
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Queued", value: queue.filter((q) => q.status === "queued").length, color: "text-yellow-400" },
            { label: "Processing", value: queue.filter((q) => q.status === "processing").length, color: "text-secondary" },
            { label: "Delivered", value: queue.filter((q) => q.status === "delivered").length, color: "text-primary" },
            { label: "Failed", value: queue.filter((q) => q.status === "failed").length, color: "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="minecraft-card p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="minecraft-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Last Attempt</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredQueue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No items in queue
                  </TableCell>
                </TableRow>
              ) : (
                filteredQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.minecraft_ign}</TableCell>
                    <TableCell>{item.orders?.products?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.attempt_count} / {item.max_attempts}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.last_attempt_at ? formatDate(item.last_attempt_at) : "Never"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-destructive">
                      {item.error_message || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.status !== "delivered" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryDelivery(item)}
                            disabled={retrying === item.id}
                          >
                            {retrying === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {item.status === "queued" || item.status === "failed" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => forceResolve(item.id, "delivered")}
                            className="text-primary hover:text-primary"
                          >
                            Resolve
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
