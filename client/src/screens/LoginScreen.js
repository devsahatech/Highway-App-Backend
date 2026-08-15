import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    // Dummy login logic
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('username', email.split('@')[0] || 'User');
      if (setIsLoggedIn) setIsLoggedIn(true);
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  const handleGuest = async () => {
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('username', 'Guest');
      if (setIsLoggedIn) setIsLoggedIn(true);
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-10 items-center">
          <Text className="text-4xl font-extrabold text-amber-600 tracking-tighter mb-2">Highway</Text>
          <Text className="text-gray-500 text-base">Sign in to order your favorites</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-1">Email</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-1">Password</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity 
          className="w-full bg-amber-600 rounded-xl py-4 mt-8"
          style={{ elevation: 2, shadowColor: '#fcd34d', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2 }}
          onPress={handleLogin}
        >
          <Text className="text-center text-white font-bold text-lg">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full bg-amber-100 border border-amber-200 rounded-xl py-4 mt-4"
          onPress={handleGuest}
        >
          <Text className="text-center text-amber-700 font-bold text-lg">Continue as Guest (Demo)</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-amber-600 font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
