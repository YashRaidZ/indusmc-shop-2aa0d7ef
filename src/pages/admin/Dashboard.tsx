import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  ShoppingCart,
  CheckCircle,
  TrendingUp,
  Package,
  AlertCircle,
} from "lucide-react";

interface Stats {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  ordersTotal: number;
  ordersCompleted: number;
  deliverySuccessRate: number;
  activeProducts: number;
  pendingDeliveries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    ordersTotal: 0,
    ordersCompleted: 0,
    deliverySuccessRate: 0,
    activeProducts: 0,
    pendingDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all orders
      const { data: orders } = await supabase
        .from("orders")
        .select("amount_inr, created_at, payment_status, delivery_status");

      // Fetch active products count
      const { count: activeProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch pending deliveries
      const { count: pendingDeliveries } = await supabase
        .from("delivery_queue")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "queued", "processing"]);

      if (orders) {
        const completedOrders = orders.filter((o) => o.payment_status === "completed");
        const deliveredOrders = orders.filter((o) => o.delivery_status === "delivered");

        const revenueToday = completedOrders
          .filter((o) => o.created_at >= todayStart)
          .reduce((sum, o) => sum + Number(o.amount_inr), 0);

        const revenueWeek = completedOrders
          .filter((o) => o.created_at >= weekStart)
          .reduce((sum, o) => sum + Number(o.amount_inr), 0);

        const revenueMonth = completedOrders
          .filter((o) => o.created_at >= monthStart)
          .reduce((sum, o) => sum + Number(o.amount_inr), 0);

        const deliverySuccessRate =
          completedOrders.length > 0
            ? (deliveredOrders.length / completedOrders.length) * 100
            : 0;

        setStats({
          revenueToday,
          revenueWeek,
          revenueMonth,
          ordersTotal: orders.length,
          ordersCompleted: completedOrders.length,
          deliverySuccessRate,
          activeProducts: activeProducts || 0,
          pendingDeliveries: pendingDeliveries || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.revenueToday),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Weekly Revenue",
      value: formatCurrency(stats.revenueWeek),
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.revenueMonth),
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Orders",
      value: stats.ordersTotal.toString(),
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed Orders",
      value: stats.ordersCompleted.toString(),
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Delivery Success Rate",
      value: `${stats.deliverySuccessRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.deliverySuccessRate >= 90 ? "text-primary" : "text-destructive",
      bgColor: stats.deliverySuccessRate >= 90 ? "bg-primary/10" : "bg-destructive/10",
    },
    {
      title: "Active Products",
      value: stats.activeProducts.toString(),
      icon: Package,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Pending Deliveries",
      value: stats.pendingDeliveries.toString(),
      icon: AlertCircle,
      color: stats.pendingDeliveries > 0 ? "text-destructive" : "text-primary",
      bgColor: stats.pendingDeliveries > 0 ? "bg-destructive/10" : "bg-primary/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-pixel text-2xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to IndusMC Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.title} className="minecraft-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {loading ? "..." : card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
