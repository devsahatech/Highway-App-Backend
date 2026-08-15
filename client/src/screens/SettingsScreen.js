import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation, setIsLoggedIn }) {
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('username');
        if (storedUser) {
          setUsername(storedUser);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('username');
              // Update root App state to switch back to the auth stack
              if (setIsLoggedIn) {
                setIsLoggedIn(false);
              }
            } catch (error) {
              console.error('Logout error', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-14 pb-4 px-5 bg-white z-10 flex-row justify-between items-center" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
        <Text className="text-xl font-extrabold text-gray-900">Settings</Text>
      </View>
      
      <View className="p-5">
        <View className="bg-white rounded-2xl p-5 mb-6 flex-row items-center shadow-sm">
          <View className="h-16 w-16 rounded-full bg-amber-100 items-center justify-center mr-4">
            <Ionicons name="person" size={32} color="#D97706" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">{username}</Text>
            <Text className="text-gray-500">Highway User</Text>
          </View>
        </View>
        
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={24} color="#4B5563" />
              <Text className="text-base font-medium text-gray-700 ml-3">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={24} color="#4B5563" />
              <Text className="text-base font-medium text-gray-700 ml-3">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text className="text-base font-medium text-red-500 ml-3">Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
