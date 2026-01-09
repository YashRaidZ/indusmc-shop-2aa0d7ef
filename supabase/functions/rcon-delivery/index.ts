import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RconResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// Simple RCON client implementation for Deno
async function sendRconCommand(
  host: string,
  port: number,
  password: string,
  command: string
): Promise<RconResponse> {
  try {
    console.log(`Connecting to RCON server at ${host}:${port}`);
    
    const conn = await Deno.connect({ hostname: host, port });
    
    // RCON packet structure
    const SERVERDATA_AUTH = 3;
    const SERVERDATA_EXECCOMMAND = 2;
    
    const createPacket = (id: number, type: number, body: string): Uint8Array => {
      const bodyBytes = new TextEncoder().encode(body + "\0\0");
      const size = 4 + 4 + bodyBytes.length;
      const buffer = new Uint8Array(4 + size);
      const view = new DataView(buffer.buffer);
      
      view.setInt32(0, size, true);
      view.setInt32(4, id, true);
      view.setInt32(8, type, true);
      buffer.set(bodyBytes, 12);
      
      return buffer;
    };
    
    const readPacket = async (): Promise<{ id: number; type: number; body: string }> => {
      const sizeBuffer = new Uint8Array(4);
      await conn.read(sizeBuffer);
      const size = new DataView(sizeBuffer.buffer).getInt32(0, true);
      
      const packetBuffer = new Uint8Array(size);
      await conn.read(packetBuffer);
      
      const view = new DataView(packetBuffer.buffer);
      const id = view.getInt32(0, true);
      const type = view.getInt32(4, true);
      const body = new TextDecoder().decode(packetBuffer.slice(8, -2));
      
      return { id, type, body };
    };
    
    // Authenticate
    console.log("Sending RCON authentication...");
    const authPacket = createPacket(1, SERVERDATA_AUTH, password);
    await conn.write(authPacket);
    
    const authResponse = await readPacket();
    if (authResponse.id === -1) {
      conn.close();
      return { success: false, error: "RCON authentication failed" };
    }
    console.log("RCON authentication successful");
    
    // Send command
    console.log(`Executing RCON command: ${command}`);
    const commandPacket = createPacket(2, SERVERDATA_EXECCOMMAND, command);
    await conn.write(commandPacket);
    
    const commandResponse = await readPacket();
    console.log(`RCON response: ${commandResponse.body}`);
    
    conn.close();
    
    return { success: true, response: commandResponse.body };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`RCON error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const rconPasswordsJson = Deno.env.get("RCON_PASSWORDS") || "{}";
    
    let rconPasswords: Record<string, string>;
    try {
      rconPasswords = JSON.parse(rconPasswordsJson);
    } catch {
      console.error("Failed to parse RCON_PASSWORDS, expected JSON object");
      rconPasswords = {};
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, action } = await req.json();
    console.log(`Processing delivery request: orderId=${orderId}, action=${action}`);

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Order found: ${order.id}, product: ${order.products?.name}`);

    // Check if payment is completed
    if (order.payment_status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get delivery commands for this product
    const { data: commands, error: commandsError } = await supabase
      .from("delivery_commands")
      .select("*")
      .eq("product_id", order.product_id)
      .eq("enabled", true)
      .order("order_index", { ascending: true });

    if (commandsError) {
      console.error("Error fetching commands:", commandsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch delivery commands" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!commands || commands.length === 0) {
      console.log("No delivery commands configured for this product");
      // Update order status to delivered even without commands
      await supabase
        .from("orders")
        .update({ delivery_status: "delivered" })
        .eq("id", orderId);
      
      return new Response(
        JSON.stringify({ success: true, message: "No delivery commands configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get RCON servers for this product
    const { data: productServers } = await supabase
      .from("product_rcon_servers")
      .select("rcon_server_id")
      .eq("product_id", order.product_id);

    let servers;
    if (productServers && productServers.length > 0) {
      const serverIds = productServers.map((ps) => ps.rcon_server_id);
      const { data } = await supabase
        .from("rcon_servers")
        .select("*")
        .in("id", serverIds)
        .eq("enabled", true)
        .eq("mode", order.products.mode)
        .order("priority", { ascending: true });
      servers = data;
    } else {
      // Fallback to all servers for this mode
      const { data } = await supabase
        .from("rcon_servers")
        .select("*")
        .eq("enabled", true)
        .eq("mode", order.products.mode)
        .order("priority", { ascending: true });
      servers = data;
    }

    if (!servers || servers.length === 0) {
      console.error("No enabled RCON servers found");
      await supabase
        .from("orders")
        .update({ delivery_status: "failed" })
        .eq("id", orderId);
      
      return new Response(
        JSON.stringify({ error: "No RCON servers available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine recipient IGN
    const recipientIgn = order.is_gift && order.gift_recipient_ign 
      ? order.gift_recipient_ign 
      : order.minecraft_ign;

    console.log(`Delivering to: ${recipientIgn}`);

    // Update delivery status to processing
    await supabase
      .from("orders")
      .update({ delivery_status: "processing" })
      .eq("id", orderId);

    const deliveryLogs: Array<{ server: string; command: string; success: boolean; response?: string; error?: string }> = [];
    let deliverySucceeded = false;

    // Execute commands with failover - try servers in priority order
    for (const server of servers) {
      const password = rconPasswords[server.id] || rconPasswords[server.name] || "";
      
      if (!password) {
        console.error(`No RCON password configured for server: ${server.name}`);
        deliveryLogs.push({
          server: server.name,
          command: "N/A",
          success: false,
          error: "No RCON password configured",
        });
        continue; // Try next server
      }

      let serverSuccess = true;

      for (const cmd of commands) {
        // Replace placeholders in command - support multiple formats
        const processedCommand = cmd.command_text
          .replace(/{player}/gi, recipientIgn)
          .replace(/{IGN}/gi, recipientIgn)
          .replace(/{username}/gi, recipientIgn)
          .replace(/{quantity}/gi, String(order.quantity))
          .replace(/{AMOUNT}/gi, String(order.quantity))
          .replace(/{product}/gi, order.products?.name || "")
          .replace(/{product_name}/gi, order.products?.name || "");

        // Wait for delay if specified
        if (cmd.delay_ms > 0) {
          await new Promise((resolve) => setTimeout(resolve, cmd.delay_ms));
        }

        const startTime = Date.now();
        const result = await sendRconCommand(
          server.host,
          server.port,
          password,
          processedCommand
        );
        const executionTime = Date.now() - startTime;

        // Log the delivery attempt
        await supabase.from("delivery_logs").insert({
          order_id: orderId,
          rcon_server_id: server.id,
          command_text: processedCommand,
          status: result.success ? "success" : "failed",
          error_message: result.error || null,
          execution_time_ms: executionTime,
        });

        deliveryLogs.push({
          server: server.name,
          command: processedCommand,
          success: result.success,
          response: result.response,
          error: result.error,
        });

        if (!result.success) {
          serverSuccess = false;
          console.log(`Command failed on ${server.name}, will try next server if available`);
          break; // Stop executing commands on this server, try next
        }
      }

      if (serverSuccess) {
        deliverySucceeded = true;
        console.log(`All commands executed successfully on ${server.name}`);
        break; // Stop trying other servers, delivery succeeded
      }
    }

    // If no server worked, try to queue for later delivery
    if (!deliverySucceeded) {
      console.log("All servers failed, checking if player is online for queue");
      
      // Check if player is online
      const { data: playerStatus } = await supabase
        .from("player_status")
        .select("online")
        .eq("minecraft_ign", recipientIgn)
        .single();

      if (!playerStatus?.online) {
        // Queue for later delivery
        const { error: queueError } = await supabase
          .from("delivery_queue")
          .upsert(
            {
              order_id: orderId,
              minecraft_ign: recipientIgn,
              status: "queued",
              attempt_count: 1,
              last_attempt_at: new Date().toISOString(),
              error_message: "Initial delivery failed, queued for retry",
            },
            { onConflict: "order_id" }
          );

        if (queueError) {
          console.error("Failed to queue delivery:", queueError);
        } else {
          console.log("Delivery queued for later retry");
        }

        await supabase
          .from("orders")
          .update({ delivery_status: "queued" })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({
            success: false,
            queued: true,
            logs: deliveryLogs,
            message: "Player offline, delivery queued for when they join",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update order with final status
    await supabase
      .from("orders")
      .update({
        delivery_status: deliverySucceeded ? "delivered" : "failed",
        delivery_log: deliveryLogs,
      })
      .eq("id", orderId);

    console.log(`Delivery completed. Success: ${deliverySucceeded}`);

    return new Response(
      JSON.stringify({
        success: deliverySucceeded,
        logs: deliveryLogs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in rcon-delivery function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
