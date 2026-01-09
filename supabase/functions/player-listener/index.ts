import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-listener-token",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const listenerToken = Deno.env.get("LISTENER_SECRET_TOKEN");

    // Validate listener token
    const providedToken = req.headers.get("x-listener-token");
    if (listenerToken && providedToken !== listenerToken) {
      console.error("Invalid listener token provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    const body = await req.json();

    console.log(`Player listener event: ${path}`, body);

    const { minecraft_ign, server_name, timestamp } = body;

    if (!minecraft_ign) {
      return new Response(
        JSON.stringify({ error: "minecraft_ign is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    if (path === "join") {
      // Player joined - update status and check delivery queue
      console.log(`Player ${minecraft_ign} joined ${server_name || "unknown server"}`);

      // Upsert player status
      const { error: statusError } = await supabase
        .from("player_status")
        .upsert(
          {
            minecraft_ign,
            server_name: server_name || null,
            online: true,
            last_join_at: now,
            updated_at: now,
          },
          { onConflict: "minecraft_ign" }
        );

      if (statusError) {
        console.error("Error updating player status:", statusError);
      }

      // Check for queued deliveries
      const { data: queuedDeliveries, error: queueError } = await supabase
        .from("delivery_queue")
        .select("*, orders(id, product_id, products(mode))")
        .eq("minecraft_ign", minecraft_ign)
        .eq("status", "queued")
        .lt("attempt_count", 5); // Only fetch if under max attempts

      if (queueError) {
        console.error("Error fetching delivery queue:", queueError);
      }

      const deliveryResults: Array<{ orderId: string; success: boolean; error?: string }> = [];

      if (queuedDeliveries && queuedDeliveries.length > 0) {
        console.log(`Found ${queuedDeliveries.length} queued deliveries for ${minecraft_ign}`);

        // Filter deliveries that match the server mode
        const matchingDeliveries = queuedDeliveries.filter((d) => {
          if (!server_name) return true; // If no server specified, try all
          const productMode = d.orders?.products?.mode;
          return !productMode || server_name.toLowerCase().includes(productMode);
        });

        for (const delivery of matchingDeliveries) {
          try {
            // Invoke rcon-delivery function
            const { data, error } = await supabase.functions.invoke("rcon-delivery", {
              body: { orderId: delivery.order_id, action: "deliver" },
            });

            if (error) {
              throw error;
            }

            // Update queue status based on result
            if (data?.success) {
              await supabase
                .from("delivery_queue")
                .update({
                  status: "delivered",
                  last_attempt_at: now,
                })
                .eq("id", delivery.id);

              deliveryResults.push({ orderId: delivery.order_id, success: true });
            } else {
              await supabase
                .from("delivery_queue")
                .update({
                  attempt_count: delivery.attempt_count + 1,
                  last_attempt_at: now,
                  error_message: data?.error || "Delivery failed",
                  status: delivery.attempt_count + 1 >= delivery.max_attempts ? "failed" : "queued",
                })
                .eq("id", delivery.id);

              deliveryResults.push({
                orderId: delivery.order_id,
                success: false,
                error: data?.error || "Delivery failed",
              });
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error";
            console.error(`Delivery failed for order ${delivery.order_id}:`, errorMsg);

            await supabase
              .from("delivery_queue")
              .update({
                attempt_count: delivery.attempt_count + 1,
                last_attempt_at: now,
                error_message: errorMsg,
                status: delivery.attempt_count + 1 >= delivery.max_attempts ? "failed" : "queued",
              })
              .eq("id", delivery.id);

            deliveryResults.push({
              orderId: delivery.order_id,
              success: false,
              error: errorMsg,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          event: "join",
          player: minecraft_ign,
          server: server_name,
          deliveries_processed: deliveryResults.length,
          delivery_results: deliveryResults,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (path === "leave") {
      // Player left - update status
      console.log(`Player ${minecraft_ign} left ${server_name || "unknown server"}`);

      const { error: statusError } = await supabase
        .from("player_status")
        .upsert(
          {
            minecraft_ign,
            server_name: null,
            online: false,
            last_leave_at: now,
            updated_at: now,
          },
          { onConflict: "minecraft_ign" }
        );

      if (statusError) {
        console.error("Error updating player status:", statusError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          event: "leave",
          player: minecraft_ign,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid event type. Use /join or /leave" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in player-listener function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
