import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Server,
  Terminal,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type DeliveryCommand = Tables<"delivery_commands">;
type RconServer = Tables<"rcon_servers">;

export default function AdminProductCommands() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [commands, setCommands] = useState<DeliveryCommand[]>([]);
  const [servers, setServers] = useState<RconServer[]>([]);
  const [assignedServers, setAssignedServers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<DeliveryCommand | null>(null);
  const [commandForm, setCommandForm] = useState({
    command_text: "",
    delay_ms: 0,
    enabled: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch commands
      const { data: commandsData } = await supabase
        .from("delivery_commands")
        .select("*")
        .eq("product_id", productId)
        .order("order_index", { ascending: true });

      setCommands(commandsData || []);

      // Fetch all RCON servers for this mode
      const { data: serversData } = await supabase
        .from("rcon_servers")
        .select("*")
        .eq("mode", productData.mode)
        .order("priority", { ascending: true });

      setServers(serversData || []);

      // Fetch assigned servers
      const { data: assignedData } = await supabase
        .from("product_rcon_servers")
        .select("rcon_server_id")
        .eq("product_id", productId);

      setAssignedServers(assignedData?.map((a) => a.rcon_server_id) || []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCommandDialog = (command?: DeliveryCommand) => {
    if (command) {
      setEditingCommand(command);
      setCommandForm({
        command_text: command.command_text,
        delay_ms: command.delay_ms,
        enabled: command.enabled,
      });
    } else {
      setEditingCommand(null);
      setCommandForm({ command_text: "", delay_ms: 0, enabled: true });
    }
    setCommandDialogOpen(true);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCommand) {
        const { error } = await supabase
          .from("delivery_commands")
          .update(commandForm)
          .eq("id", editingCommand.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("delivery_commands").insert({
          ...commandForm,
          product_id: productId,
          order_index: commands.length,
        });
        if (error) throw error;
      }

      toast({ title: editingCommand ? "Command updated" : "Command added" });
      setCommandDialogOpen(false);
      fetchData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save command",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCommand = async (id: string) => {
    if (!confirm("Delete this command?")) return;

    const { error } = await supabase.from("delivery_commands").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Command deleted" });
      fetchData();
    }
  };

  const toggleServerAssignment = async (serverId: string, assigned: boolean) => {
    try {
      if (assigned) {
        const { error } = await supabase.from("product_rcon_servers").insert({
          product_id: productId,
          rcon_server_id: serverId,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_rcon_servers")
          .delete()
          .eq("product_id", productId)
          .eq("rcon_server_id", serverId);
        if (error) throw error;
      }

      setAssignedServers((prev) =>
        assigned ? [...prev, serverId] : prev.filter((id) => id !== serverId)
      );
      toast({ title: assigned ? "Server assigned" : "Server removed" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update assignment",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="outline" onClick={() => navigate("/admin/products")} className="mt-4">
            Back to Products
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-pixel text-xl text-foreground">{product.name}</h1>
            <p className="text-muted-foreground text-sm">
              Configure delivery commands and RCON servers
            </p>
          </div>
        </div>

        {/* RCON Server Assignment */}
        <div className="minecraft-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-secondary" />
            <h2 className="font-pixel text-sm">Assigned RCON Servers</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select which {product.mode} servers should receive delivery commands for this product.
            Commands execute on all assigned servers with failover.
          </p>
          {servers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No {product.mode} servers configured.{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/admin/rcon")}>
                Add servers
              </Button>
            </p>
          ) : (
            <div className="grid gap-2">
              {servers.map((server) => (
                <label
                  key={server.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={assignedServers.includes(server.id)}
                    onCheckedChange={(checked) =>
                      toggleServerAssignment(server.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <p className="font-medium">{server.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {server.host}:{server.port} • Priority: {server.priority}
                    </p>
                  </div>
                  {!server.enabled && (
                    <span className="text-xs text-muted-foreground">(Disabled)</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Commands */}
        <div className="minecraft-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="font-pixel text-sm">Delivery Commands</h2>
            </div>
            <Button variant="neon" size="sm" onClick={() => openCommandDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Command
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Commands execute in order. Use placeholders: <code className="text-primary">{"{IGN}"}</code> for player name,{" "}
            <code className="text-primary">{"{AMOUNT}"}</code> for quantity.
          </p>

          {commands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands configured</p>
              <p className="text-sm">Add commands to enable automatic delivery</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead className="w-[100px]">Delay</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commands.map((cmd, index) => (
                  <TableRow key={cmd.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{cmd.command_text}</code>
                    </TableCell>
                    <TableCell>{cmd.delay_ms}ms</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          cmd.enabled
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cmd.enabled ? "Active" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openCommandDialog(cmd)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCommand(cmd.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Command Dialog */}
        <Dialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-pixel">
                {editingCommand ? "Edit Command" : "Add Command"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCommandSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Command</Label>
                <Input
                  value={commandForm.command_text}
                  onChange={(e) =>
                    setCommandForm({ ...commandForm, command_text: e.target.value })
                  }
                  placeholder="lp user {IGN} parent set vip"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Placeholders: {"{IGN}"} = player name, {"{AMOUNT}"} = quantity
                </p>
              </div>

              <div className="space-y-2">
                <Label>Delay (ms)</Label>
                <Input
                  type="number"
                  value={commandForm.delay_ms}
                  onChange={(e) =>
                    setCommandForm({ ...commandForm, delay_ms: Number(e.target.value) })
                  }
                  min={0}
                  step={100}
                />
                <p className="text-xs text-muted-foreground">
                  Wait time before executing this command
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={commandForm.enabled}
                  onCheckedChange={(checked) =>
                    setCommandForm({ ...commandForm, enabled: checked })
                  }
                />
                <Label>Enabled</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setCommandDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="neon" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingCommand ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
