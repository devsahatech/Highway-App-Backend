const supabase = require("../config/supabase");

const addDisplayId = (order) => {
  if (!order) return order;
  return {
    ...order,
    display_id: `HW-${order.id.split('-')[0].toUpperCase()}`
  };
};

const createOrder = async (orderData) => {
  const { name, "phone no": phone, address, items, expo_push_token } = orderData;

  if (!name || !phone || !address) {
    throw new Error("Customer name, phone no, and address are required");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  let totalAmount = 0;

  const orderItems = items.map((item) => {
    const quantity = Number(item["item quantity"]);
    const price = Number(item["item price"]);
    const subtotal = price * quantity;
    
    totalAmount += subtotal;

    return {
      product_name: item["item name"],
      quantity,
      price,
      subtotal,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      phone,
      address,
      items: orderItems,
      total_amount: totalAmount,
      status: "Received",
      expo_push_token: expo_push_token || null,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(orderError.message);
  }

  return addDisplayId(order);
};

const getAllOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(addDisplayId);
};

const getOrdersBatch = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(addDisplayId);
};

const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return addDisplayId(data);
};

const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return addDisplayId(data);
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersBatch,
  getOrderById,
  updateOrderStatus
};
