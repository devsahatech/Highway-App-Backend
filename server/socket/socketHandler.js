const orderService = require("../services/orderService");
const supabase = require("../config/supabase");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    

    socket.on("join_room", ({ role }) => {
      if (role === "admin") {
        socket.join("admin");

        console.log(`Admin joined: ${socket.id}`);
      } else if (role === "customer") {
        socket.join("customers");

        console.log(`Customer joined: ${socket.id}`);
      }
    });

   

    socket.on("place_order", async (orderData) => {
      console.log("PLACE_ORDER EVENT RECEIVED");

      console.log(orderData);

      try {
       
        const order = await orderService.createOrder(orderData);

        socket.emit("order_created", {
          success: true,

          message: "Order placed successfully",

          order,
        });

       
        io.to("admin").emit("new_order_alert", {
          success: true,

          order,
        });

        console.log(`Order #${order.id} created through Socket.io`);
      } catch (error) {
        console.error("Socket order error:", error);

        socket.emit("order_error", {
          success: false,

          message: error.message,
        });
      }
    });

   

    socket.on("toggle_stock_status", async ({ product_id, is_available }) => {
      console.log("STOCK UPDATE EVENT RECEIVED");

      console.log({
        product_id,
        is_available,
      });

      try {
        if (!product_id) {
          throw new Error("product_id is required");
        }

        // Validate availability value
        if (typeof is_available !== "boolean") {
          throw new Error("is_available must be boolean");
        }

        // Update Supabase
        const { data, error } = await supabase
          .from("products")
          .update({
            is_available,
          })
          .eq("id", product_id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

       
        io.to("customers").emit("stock_updated", {
          success: true,

          product_id: data.id,

          is_available: data.is_available,
        });

      
        socket.emit("stock_update_success", {
          success: true,

          product_id: data.id,

          is_available: data.is_available,
        });

        console.log(`Product ${product_id} stock updated to ${is_available}`);
      } catch (error) {
        console.error("Stock update error:", error);

        socket.emit("stock_update_error", {
          success: false,

          message: error.message,
        });
      }
    });

    

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
