import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import socket from '../services/socket';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const storedIds = await AsyncStorage.getItem('@my_orders');
      if (!storedIds) {
        setOrders([]);
        return;
      }
      
      const idsArray = JSON.parse(storedIds);
      if (idsArray.length === 0) {
        setOrders([]);
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/orders/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsArray }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Sort by created_at descending (newest first)
        const sortedOrders = data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  useEffect(() => {
    const handleStatusUpdate = (data) => {
      if (data.success && data.order) {
        setOrders((prevOrders) => 
          prevOrders.map(o => o.id === data.order.id ? { ...o, status: data.order.status } : o)
        );
        // Also update selected order if it's currently open
        setSelectedOrder((prev) => 
          prev && prev.id === data.order.id ? { ...prev, status: data.order.status } : prev
        );
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const time = date.toLocaleTimeString('en-IN', timeOptions);
    
    if (isToday) {
      return `Today at ${time}`;
    }
    
    const dateOptions = { day: 'numeric', month: 'short' };
    return `${date.toLocaleDateString('en-IN', dateOptions)} at ${time}`;
  };

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) return 'text-green-600 bg-green-100 border-green-200';
    if (s.includes('preparing') || s.includes('out for delivery')) return 'text-amber-600 bg-amber-100 border-amber-200';
    if (s.includes('cancelled') || s.includes('failed')) return 'text-red-600 bg-red-100 border-red-200';
    return 'text-blue-600 bg-blue-100 border-blue-200'; // received/placed
  };

  const isLiveOrder = (status) => {
    const s = status.toLowerCase();
    return s.includes('preparing') || s.includes('out for delivery') || s.includes('received');
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-14 pb-4 px-5 bg-white z-10 flex-row justify-between items-center" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
        <Text className="text-xl font-extrabold text-gray-900">My Orders</Text>
        <Ionicons name="receipt-outline" size={24} color="#000" />
      </View>
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d97706']} />}
      >
        {orders.length === 0 ? (
          <View className="items-center justify-center flex-1 py-20">
            <Ionicons name="fast-food-outline" size={80} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg font-medium mt-4">No active orders</Text>
            <Text className="text-gray-400 text-sm text-center mt-2 px-6">
              When you place an order, it will appear here so you can track its status.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const isLive = isLiveOrder(order.status);
            return (
              <TouchableOpacity 
                key={order.id} 
                className="bg-white rounded-2xl mb-4 p-4 border border-gray-100 shadow-sm"
                onPress={() => setSelectedOrder(order)}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    {isLive && (
                      <View className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2" />
                    )}
                    <Text className="text-gray-500 text-sm font-medium">{formatDate(order.created_at)}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-md border ${getStatusColor(order.status).split(' ').slice(1).join(' ')}`}>
                    <Text className={`text-xs font-bold ${getStatusColor(order.status).split(' ')[0]}`}>{order.status}</Text>
                  </View>
                </View>
                
                <View className="mb-3">
                  <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                    {order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                  </Text>
                </View>
                
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <Text className="text-gray-500 text-sm font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text className="text-lg font-extrabold text-amber-600">₹{order.total_amount}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-4/5">
            {selectedOrder && (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-extrabold text-gray-900">Order Details</Text>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)} className="bg-gray-100 p-2 rounded-full">
                    <Text className="text-gray-600 font-bold px-2">Close</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                  <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                    <Text className="text-gray-500 text-sm font-bold mb-1">Status</Text>
                    <View className="flex-row items-center">
                      {isLiveOrder(selectedOrder.status) && (
                        <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                      )}
                      <Text className={`text-xl font-extrabold ${getStatusColor(selectedOrder.status).split(' ')[0]}`}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                    <Text className="text-gray-500 text-sm font-bold mb-2">Delivery Details</Text>
                    <Text className="text-gray-800 font-medium mb-1"><Text className="text-gray-500">Name:</Text> {selectedOrder.customer_name}</Text>
                    <Text className="text-gray-800 font-medium mb-1"><Text className="text-gray-500">Phone:</Text> {selectedOrder.phone}</Text>
                    <Text className="text-gray-800 font-medium"><Text className="text-gray-500">Address/Table:</Text> {selectedOrder.address}</Text>
                    <Text className="text-gray-800 font-medium mt-1"><Text className="text-gray-500">Time:</Text> {formatDate(selectedOrder.created_at)}</Text>
                  </View>

                  <Text className="text-lg font-extrabold text-gray-900 mb-3">Items Ordered</Text>
                  
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-100">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-gray-100 rounded-md w-8 h-8 items-center justify-center mr-3">
                          <Text className="font-bold text-gray-700">{item.quantity}x</Text>
                        </View>
                        <Text className="text-gray-800 font-medium text-base flex-1 pr-2">{item.product_name}</Text>
                      </View>
                      <Text className="text-gray-800 font-bold text-base">₹{item.subtotal}</Text>
                    </View>
                  ))}

                  <View className="flex-row justify-between items-center mt-6 mb-2">
                    <Text className="text-gray-500 text-lg font-bold">Total Paid</Text>
                    <Text className="text-2xl font-extrabold text-amber-600">₹{selectedOrder.total_amount}</Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
