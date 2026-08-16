import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Image, Linking, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from '../services/socket';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const CATEGORIES = ['All', 'Biryani', 'Starters', 'Fast Food', 'Beverages & Refreshments'];

export default function MainScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');

  // Checkout Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableAddress, setTableAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  // Map Modal State
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Selected variants mapping (productId -> variant index)
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    const loadPrefillData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('@customer_name');
        const savedPhone = await AsyncStorage.getItem('@customer_phone');
        const savedAddress = await AsyncStorage.getItem('@customer_address');
        if (savedName) setCustomerName(savedName);
        if (savedPhone) setCustomerPhone(savedPhone);
        if (savedAddress) setTableAddress(savedAddress);
      } catch (e) {
        console.error('Failed to load prefill data');
      }
    };
    loadPrefillData();
  }, []);

  useEffect(() => {
    // Mocking specific products based on requirements
    const mockData = [
      {
        id: '1',
        name: 'Biryani',
        category: 'Biryani',
        description: 'Aromatic basmati rice cooked with secret spices',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['biryani', 'बिरयानी', 'বিরিয়ানি'],
        variants: [
          { name: '350g', price: 80 },
          { name: '600g', price: 120 },
          { name: '1kg', price: 200 }
        ]
      },
      {
        id: '2',
        name: 'Chicken Pakoda',
        category: 'Starters',
        description: 'Crispy fried chicken bites with mint chutney',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['chicken pakoda', 'चिकन पकोड़ा', 'চিকেন পকোড়া', 'pakora', 'pukoda'],
        variants: [
          { name: 'Half / 6 pcs', price: 60 },
          { name: 'Full / 12 pcs', price: 120 }
        ]
      },
      {
        id: '3',
        name: 'Rumpum',
        category: 'Fast Food',
        description: 'Spicy noodle soup with veggies',
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['rumpum', 'रम्पम', 'রুমপুম', 'noodles', 'chowmein'],
        variants: [
          { name: 'Half', price: 30 },
          { name: 'Full', price: 60 }
        ]
      },
      {
        id: '4',
        name: 'Maggie',
        category: 'Fast Food',
        description: 'Classic hot and spicy noodles',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['maggie', 'maggi', 'मैगी', 'ম্যাগি'],
        variants: [
          { name: 'Half', price: 40 },
          { name: 'Full', price: 70 }
        ]
      },
      {
        id: '5',
        name: 'Omelette',
        category: 'Starters',
        description: 'Fluffy pan-fried eggs with onions and green chilies',
        image: 'https://images.pexels.com/photos/824631/pexels-photo-824631.jpeg?auto=compress&cs=tinysrgb&w=800',
        inStock: true,
        tags: ['omelette', 'omlet', 'ऑमलेट', 'অমলেট', 'egg', 'anda'],
        variants: [
          { name: 'Single Egg', price: 20 },
          { name: 'Double Egg', price: 40 }
        ]
      },
      {
        id: '6',
        name: 'Chilled Water',
        category: 'Beverages & Refreshments',
        description: '1L Mineral Water Bottle',
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['water', 'pani', 'पानी', 'জল', 'mineral water'],
        variants: [
          { name: '1L Bottle', price: 20 }
        ]
      },
      {
        id: '7',
        name: 'Cold Drinks',
        category: 'Beverages & Refreshments',
        description: 'Assorted soft drinks (Coke, Sprite, ThumsUp)',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        tags: ['cold drink', 'soft drink', 'coke', 'pepsi', 'sprite', 'कोल्ड ड्रिंक', 'কোল্ড ড্রিংক', 'thandapani'],
        variants: [
          { name: '750ml', price: 40 }
        ]
      },
      {
        id: '8',
        name: 'Cigarettes',
        category: 'Beverages & Refreshments',
        description: 'Assorted brands',
        image: 'https://images.pexels.com/photos/1209462/pexels-photo-1209462.jpeg?auto=compress&cs=tinysrgb&w=800',
        inStock: true,
        tags: ['cigarette', 'cigar', 'sutta', 'सिगरेट', 'সিগারেট', 'smoke'],
        variants: [
          { name: '1 Pack', price: 18 }
        ]
      }
    ];

    setTimeout(() => {
      setProducts(mockData);
      setLoading(false);
    }, 600);

    socket.emit("join_room", { role: "customer" });
    
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    socket.on('stock_updated', (data) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === data.productId ? { ...p, inStock: data.inStock } : p))
      );
    });

    socket.on('order_status_updated', (data) => {
      if (data.success && data.order) {
        const displayId = `HW-${data.order.id.split('-')[0].toUpperCase()}`;
        Vibration.vibrate([0, 500, 200, 500]);
        Alert.alert("Order Update", `Your order #${displayId} is now: ${data.order.status}`);
      }
    });

    return () => {
      socket.off('stock_updated');
      socket.off('order_status_updated');
    };
  }, []);

  const addToCart = (product) => {
    if (!product.inStock) return;
    const variantIndex = selectedVariants[product.id] || 0;
    const variant = product.variants[variantIndex];
    const cartKey = `${product.id}-${variantIndex}`;

    setCart((prev) => ({
      ...prev,
      [cartKey]: {
        product,
        variant,
        quantity: (prev[cartKey]?.quantity || 0) + 1,
      },
    }));
  };

  const incrementCartItem = (cartKey) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[cartKey]) {
        newCart[cartKey].quantity += 1;
      }
      return newCart;
    });
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[cartKey].quantity > 1) {
        newCart[cartKey].quantity -= 1;
      } else {
        delete newCart[cartKey];
      }
      return newCart;
    });
  };

  const openLocationPicker = async () => {
    setIsFetchingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setIsFetchingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setIsMapVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Please ensure GPS is enabled.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const confirmMapLocation = () => {
    setLatitude(mapRegion.latitude);
    setLongitude(mapRegion.longitude);
    setIsMapVisible(false);
  };

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first.');
      return;
    }
    if (!customerName || !customerPhone || !tableAddress) {
      Alert.alert('Missing Info', 'Please enter your Name, Phone, and Address.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsPlacingOrder(true);

    const orderData = {
      name: customerName,
      "phone no": customerPhone,
      address: tableAddress,
      latitude: latitude,
      longitude: longitude,
      items: Object.values(cart).map((item) => ({
        "item name": `${item.product.name} (${item.variant.name})`,
        "item quantity": item.quantity,
        "item price": item.variant.price,
        "total price": item.variant.price * item.quantity
      })),
      expo_push_token: expoPushToken
    };

    try {
      // Save data for next time
      await AsyncStorage.setItem('@customer_name', customerName);
      await AsyncStorage.setItem('@customer_phone', customerPhone);
      await AsyncStorage.setItem('@customer_address', tableAddress);

      // Assuming the backend is hosted at EXPO_PUBLIC_API_URL or running locally
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (data.success) {
        try {
          const existingOrders = await AsyncStorage.getItem('@my_orders');
          let ordersArray = existingOrders ? JSON.parse(existingOrders) : [];
          // Add newest order to the beginning
          ordersArray.unshift(data.order.id);
          // Keep only the latest 50 orders to avoid storage issues
          if (ordersArray.length > 50) ordersArray = ordersArray.slice(0, 50);
          await AsyncStorage.setItem('@my_orders', JSON.stringify(ordersArray));
        } catch (e) {
          console.error('Failed to save order to local storage:', e);
        }

        Alert.alert('Order Placed!', `We've received your order, ${customerName}. Status: ${data.order.status}`);
        setCart({});
        setIsCartVisible(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to place order');
      }
    } catch (error) {
      Alert.alert('Error', `Could not connect to server: ${error.message}`);
      console.error(error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:1234567890');
  };

  const cartTotal = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesTags = p.tags && p.tags.some(tag => tag.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTags;
      });
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#d97706" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white z-10 flex-row justify-between items-center" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, minHeight: 75 }}>
        {isSearchActive ? (
          <View className="flex-row items-center flex-1 bg-gray-100 rounded-xl px-3 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              autoFocus
              className="flex-1 ml-2 text-gray-800 text-base"
              placeholder="Search food..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }} className="p-1">
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View>
              <Text className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Delivering to</Text>
              <View className="flex-row items-center">
                <Text className="text-xl font-extrabold text-gray-900 mr-1">Highway</Text>
                <Ionicons name="rocket" size={20} color="#D97706" />
              </View>
            </View>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity onPress={handleCall} className="p-2 bg-green-50 rounded-full border border-green-100 mr-2">
                <Ionicons name="call" size={22} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSearchActive(true)} className="p-2 bg-gray-50 rounded-full border border-gray-100">
                <Ionicons name="search" size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View className="py-4 pl-5 bg-white mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`mr-3 px-5 py-2.5 rounded-full ${isActive ? 'bg-amber-600' : 'bg-gray-100 border border-gray-200'}`}
                >
                  <Text className={`font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>{category}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Product Feed */}
        <View className="px-4 pb-32">
          <Text className="text-xl font-extrabold text-gray-900 mb-4 ml-1">{selectedCategory} Menu</Text>
          
          {filteredProducts.map((item) => (
            <View key={item.id} className="bg-white rounded-3xl mb-5 overflow-hidden border border-gray-100">
              <Image 
                source={{ uri: item.image }} 
                className="w-full h-48 bg-gray-200"
                resizeMode="cover"
              />
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-xl font-extrabold text-gray-900 flex-1 pr-2">{item.name}</Text>
                  {!item.inStock && (
                    <View className="bg-red-100 px-3 py-1 rounded-full">
                      <Text className="text-red-600 font-bold text-xs">Out of Stock</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 text-sm mb-4 leading-relaxed">{item.description}</Text>

                {/* Variants List */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {item.variants.map((variant, idx) => {
                    const isSelected = (selectedVariants[item.id] || 0) === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setSelectedVariants({ ...selectedVariants, [item.id]: idx })}
                        disabled={!item.inStock}
                        className={`px-4 py-2 rounded-xl border ${isSelected ? 'bg-amber-50 border-amber-500' : 'bg-white border-gray-200'} ${!item.inStock ? 'opacity-50' : ''}`}
                      >
                        <Text className={`font-bold ${isSelected ? 'text-amber-700' : 'text-gray-700'}`}>{variant.name}</Text>
                        <Text className={`text-xs mt-0.5 ${isSelected ? 'text-amber-600' : 'text-gray-500'}`}>₹{variant.price}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                  className={`w-full py-4 rounded-2xl items-center flex-row justify-center ${item.inStock ? 'bg-amber-600' : 'bg-gray-300'}`}
                  onPress={() => addToCart(item)}
                  disabled={!item.inStock}
                >
                  <Text className={`font-extrabold text-lg ${item.inStock ? 'text-white' : 'text-gray-500'}`}>
                    {item.inStock ? 'Add to Cart' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating View Cart Button */}
      {cartItemCount > 0 && (
        <View className="absolute bottom-6 left-5 right-5">
          <TouchableOpacity
            className="bg-gray-900 rounded-3xl p-5 flex-row justify-between items-center"
            onPress={() => setIsCartVisible(true)}
          >
            <View className="bg-amber-500 w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-white font-extrabold">{cartItemCount}</Text>
            </View>
            <Text className="text-white font-extrabold text-lg flex-1 text-center">View Cart</Text>
            <Text className="text-white font-extrabold text-lg">₹{cartTotal}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Checkout Drawer/Modal */}
      <Modal visible={isCartVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-5/6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-extrabold text-gray-900">Your Order</Text>
              <TouchableOpacity onPress={() => setIsCartVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Text className="text-gray-600 font-bold px-2">Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
              {Object.entries(cart).length === 0 ? (
                <Text className="text-gray-500 text-center mt-10">Cart is empty.</Text>
              ) : (
                Object.entries(cart).map(([key, item]) => (
                  <View key={key} className="flex-row justify-between items-center border-b border-gray-100 py-4">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-800">{item.product.name}</Text>
                      <Text className="text-gray-500 text-sm">{item.variant.name}</Text>
                    </View>
                    <View className="flex-row items-center bg-gray-100 rounded-full px-1 py-1">
                      <TouchableOpacity onPress={() => removeFromCart(key)} className="bg-white w-8 h-8 rounded-full items-center justify-center">
                        <Text className="text-gray-800 font-bold">-</Text>
                      </TouchableOpacity>
                      <Text className="font-bold px-4 text-gray-800">{item.quantity}</Text>
                      <TouchableOpacity onPress={() => incrementCartItem(key)} className="bg-white w-8 h-8 rounded-full items-center justify-center">
                        <Text className="text-gray-800 font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-lg font-bold text-gray-900 w-16 text-right">₹{item.variant.price * item.quantity}</Text>
                  </View>
                ))
              )}

              {Object.entries(cart).length > 0 && (
                <View className="mt-6 mb-8">
                  <Text className="text-lg font-extrabold text-gray-900 mb-4">Delivery Details</Text>
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 font-medium mb-3"
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={customerName}
                    onChangeText={setCustomerName}
                  />
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 font-medium mb-3"
                    placeholder="Phone Number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                  />
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 font-medium mb-4"
                    placeholder="Table Number or Address"
                    placeholderTextColor="#9CA3AF"
                    value={tableAddress}
                    onChangeText={setTableAddress}
                  />

                  {latitude && longitude ? (
                    <TouchableOpacity
                      onPress={() => setIsMapVisible(true)}
                      className="flex-row items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="location" size={20} color="#059669" />
                        <Text className="text-green-700 font-bold ml-2">Location Pinned</Text>
                      </View>
                      <Text className="text-green-600 font-medium text-xs">Tap to change</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={openLocationPicker}
                      disabled={isFetchingLocation}
                      className="flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-xl py-3 mb-4"
                    >
                      <Ionicons name="map-outline" size={20} color="#3B82F6" />
                      <Text className="text-blue-600 font-bold ml-2">
                        {isFetchingLocation ? 'Fetching...' : 'Set Location on Map'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text className="text-lg font-extrabold text-gray-900 mt-2 mb-1">Pay on Delivery</Text>
                  <Text className="text-xs font-medium text-gray-500 mb-4">You will pay the delivery executive when your food arrives.</Text>
                  <View className="flex-row justify-between gap-3 mb-6">
                    <TouchableOpacity
                      onPress={() => setPaymentMethod('cash')}
                      className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border-2 ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}
                    >
                      <Ionicons name="cash-outline" size={20} color={paymentMethod === 'cash' ? '#D97706' : '#6B7280'} />
                      <Text className={`font-bold ml-2 ${paymentMethod === 'cash' ? 'text-amber-700' : 'text-gray-600'}`}>Cash</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setPaymentMethod('online')}
                      className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border-2 ${paymentMethod === 'online' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}
                    >
                      <Ionicons name="card-outline" size={20} color={paymentMethod === 'online' ? '#D97706' : '#6B7280'} />
                      <Text className={`font-bold ml-2 ${paymentMethod === 'online' ? 'text-amber-700' : 'text-gray-600'}`}>Online</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <View className="pt-4 border-t border-gray-100">
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500 font-bold text-lg">Total to Pay</Text>
                <Text className="text-2xl font-extrabold text-amber-600">₹{cartTotal}</Text>
              </View>
              <View className="flex-row justify-between gap-3">
                <TouchableOpacity
                  className="bg-amber-100 rounded-2xl py-4 px-5 items-center justify-center flex-row"
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={24} color="#D97706" />
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 rounded-2xl py-4 items-center ${isPlacingOrder ? 'bg-gray-400' : 'bg-amber-600'}`}
                  onPress={placeOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-extrabold text-xl">Place Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMapVisible}
        onRequestClose={() => setIsMapVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-5 pt-12 border-b border-gray-200">
            <Text className="text-xl font-extrabold text-gray-800">Set Delivery Location</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)} className="p-2 bg-gray-100 rounded-full">
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 relative">
            <MapView
              className="flex-1"
              style={{ width: '100%', height: '100%' }}
              region={mapRegion}
              onRegionChangeComplete={(region) => setMapRegion(region)}
              showsUserLocation={true}
              mapType="none" // Hides underlying Google/Apple base map
            >
              <UrlTile
                urlTemplate="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
            </MapView>
            {/* Center Fixed Marker Pin */}
            <View className="absolute top-1/2 left-1/2 -ml-6 -mt-12 pointer-events-none" style={{ marginLeft: -24, marginTop: -48 }}>
              <Ionicons name="location" size={48} color="#D97706" />
            </View>
          </View>
          <View className="p-6 bg-white border-t border-gray-200 shadow-xl pb-10">
            <Text className="text-gray-600 mb-4 font-medium text-center">Drag the map to position the pin exactly on your delivery location.</Text>
            <TouchableOpacity
              className="bg-amber-600 py-4 rounded-xl items-center shadow-md shadow-amber-200"
              onPress={confirmMapLocation}
            >
              <Text className="text-white font-extrabold text-xl">Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
