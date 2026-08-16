const orderService = require("../services/orderService");
const { Expo } = require("expo-server-sdk");
let expo = new Expo();

const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);

    if (req.app.get("io")) {
      req.app.get("io").to("admin").emit("new_order_alert", {
        success: true,
        order,
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrdersBatch = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: "Invalid or missing 'ids' array in body" });
    }
    const orders = await orderService.getOrdersBatch(ids);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);

    if (req.app.get("io")) {
      req.app.get("io").to("customers").emit("order_status_updated", {
        success: true,
        order,
      });
    }

    // Send Push Notification if token exists
    if (order.expo_push_token && Expo.isExpoPushToken(order.expo_push_token)) {
      let messages = [];
      messages.push({
        to: order.expo_push_token,
        sound: 'default',
        title: 'Highway Food Delivery',
        body: `Order Update: Your food is ${status}!`,
        data: { orderId: order.id, status: status },
      });

      try {
        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    
    if (order.status !== "Received") {
      return res.status(400).json({ success: false, message: `Cannot cancel: Order is already ${order.status}` });
    }

    const orderTime = new Date(order.created_at).getTime();
    const now = Date.now();
    const timeDiffMinutes = (now - orderTime) / (1000 * 60);

    if (timeDiffMinutes > 5) {
      return res.status(400).json({ success: false, message: "Cannot cancel: Time limit (5 minutes) has expired" });
    }

    const updatedOrder = await orderService.updateOrderStatus(req.params.id, "Cancelled");

    if (req.app.get("io")) {
      req.app.get("io").to("customers").emit("order_status_updated", {
        success: true,
        order: updatedOrder,
      });
      req.app.get("io").to("admin").emit("order_status_updated", {
        success: true,
        order: updatedOrder,
      });
    }

    res.status(200).json({ success: true, order: updatedOrder, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  createOrder,
  getOrders,
  getOrdersBatch,
  getOrder,
  updateStatus,
  cancelOrder,
};
