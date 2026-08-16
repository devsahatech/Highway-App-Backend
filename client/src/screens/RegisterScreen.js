import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigation, setIsLoggedIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    // Dummy register logic
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('username', name || 'User');
      if (setIsLoggedIn) setIsLoggedIn(true);
    } catch (error) {
      console.error('Error registering', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
          <View className="mb-10 items-center">
            <Text className="text-4xl font-extrabold text-amber-600 tracking-tighter mb-2">Create Account</Text>
            <Text className="text-gray-500 text-base">Join the Highway family</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-1">Full Name</Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>

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
              <Text className="text-gray-700 font-medium mb-1">Mobile Number</Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="10-digit mobile number"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-1">Password</Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Create a password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="w-full bg-amber-600 rounded-xl py-4 mt-8"
            style={{ elevation: 2, shadowColor: '#fcd34d', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2 }}
            onPress={handleRegister}
          >
            <Text className="text-center text-white font-bold text-lg">Sign Up</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-amber-600 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
