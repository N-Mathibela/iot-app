import { View, Text, ScrollView, TouchableOpacity, Switch, Image, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

// Type definitions
interface UserData {
  name: string;
  email: string;
  role: string;
  avatar: string;
  classCode: string;
  deviceId: string;
}

interface SettingsData {
  notifications: boolean;
  emailAlerts: boolean;
  lowConcentrationThreshold: number;
  alertFrequency: string;
  darkMode: boolean;
  dataSharing: boolean;
}

// Get the type for Ionicons names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItemProps {
  
  
  icon: IoniconsName;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

interface InfoItemProps {
  icon: IoniconsName;
  title: string;
  value: string;
}

const Profile = () => {
  // Mock user data
  const [user, setUser] = useState<UserData>({
    name: 'Alex Johnson',
    email: 'alex.johnson@school.edu',
    role: 'Teacher',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    classCode: 'CONC-2025-04',
    deviceId: 'IOT-CONC-8732'
  })

  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
    notifications: true,
    emailAlerts: true,
    lowConcentrationThreshold: 50,
    alertFrequency: 'Immediate',
    darkMode: false,
    dataSharing: true
  })

  // Editable fields state
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user.name)
  const [editedEmail, setEditedEmail] = useState(user.email)

  // Toggle a boolean setting
  const toggleSetting = (setting: keyof SettingsData) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  // Save profile changes
  const saveChanges = () => {
    setUser(prev => ({
      ...prev,
      name: editedName,
      email: editedEmail
    }))
    setIsEditing(false)
    Alert.alert('Success', 'Profile updated successfully')
  }

  // Render a setting item with a switch
  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, value, onToggle }) => (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#4b5563" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium">{title}</Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        thumbColor="#ffffff"
      />
    </View>
  )

  // Render an info item
  const InfoItem: React.FC<InfoItemProps> = ({ icon, title, value }) => (
    <View className="flex-row items-center py-3 border-b border-gray-200">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#4b5563" />
      </View>
      <View>
        <Text className="text-sm text-gray-500">{title}</Text>
        <Text className="text-base font-medium">{value}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-blue-50">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-primary">My Profile</Text>
            <TouchableOpacity 
              onPress={() => {
                if (isEditing) {
                  saveChanges()
                } else {
                  setIsEditing(true)
                  setEditedName(user.name)
                  setEditedEmail(user.email)
                }
              }}
              className={`px-4 py-2 rounded-lg ${isEditing ? 'bg-green-500' : 'bg-blue-500'}`}
            >
              <Text className="text-white font-medium">
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile info */}
          <View className="items-center mb-6">
            <Image 
              source={{ uri: user.avatar }} 
              className="w-24 h-24 rounded-full mb-3"
            />
            
            {isEditing ? (
              <View className="w-full">
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  className="text-xl font-bold text-center mb-1 border-b border-gray-300 pb-1"
                />
                <TextInput
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  className="text-gray-600 text-center border-b border-gray-300 pb-1"
                  keyboardType="email-address"
                />
                <Text className="text-gray-600 text-center mt-2">{user.role}</Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xl font-bold">{user.name}</Text>
                <Text className="text-gray-600">{user.email}</Text>
                <Text className="text-gray-600">{user.role}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Class and Device Info */}
        <View className="p-6">
          <Text className="text-lg font-bold mb-3">Class Information</Text>
          <InfoItem 
            icon="school" 
            title="Class Code" 
            value={user.classCode} 
          />
          <InfoItem 
            icon="hardware-chip" 
            title="Device ID" 
            value={user.deviceId} 
          />
        </View>

        {/* Settings */}
        <View className="p-6">
          <Text className="text-lg font-bold mb-3">Settings</Text>
          
          <SettingItem 
            icon="notifications" 
            title="Push Notifications" 
            description="Receive alerts on your device" 
            value={settings.notifications} 
            onToggle={() => toggleSetting('notifications')} 
          />
          
          <SettingItem 
            icon="mail" 
            title="Email Alerts" 
            description="Receive alerts via email" 
            value={settings.emailAlerts} 
            onToggle={() => toggleSetting('emailAlerts')} 
          />
          
          <SettingItem 
            icon="moon" 
            title="Dark Mode" 
            description="Switch to dark theme" 
            value={settings.darkMode} 
            onToggle={() => toggleSetting('darkMode')} 
          />
          
          <SettingItem 
            icon="analytics" 
            title="Data Sharing" 
            description="Share anonymized data for research" 
            value={settings.dataSharing} 
            onToggle={() => toggleSetting('dataSharing')} 
          />
        </View>

        {/* Threshold Settings */}
        <View className="p-6">
          <Text className="text-lg font-bold mb-3">Alert Thresholds</Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Ionicons name="speedometer" size={20} color="#4b5563" />
              </View>
              <View>
                <Text className="text-base font-medium">Low Concentration Threshold</Text>
                <Text className="text-sm text-gray-500">Alert when below {settings.lowConcentrationThreshold}%</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-blue-500">{settings.lowConcentrationThreshold}%</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Ionicons name="time" size={20} color="#4b5563" />
              </View>
              <View>
                <Text className="text-base font-medium">Alert Frequency</Text>
                <Text className="text-sm text-gray-500">How often to send alerts</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-blue-500">{settings.alertFrequency}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support and About */}
        <View className="p-6">
          <Text className="text-lg font-bold mb-3">Support</Text>
          
          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-200">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
              <Ionicons name="help-circle" size={20} color="#4b5563" />
            </View>
            <View>
              <Text className="text-base font-medium">Help & Support</Text>
              <Text className="text-sm text-gray-500">Get help with the app</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-200">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
              <Ionicons name="document-text" size={20} color="#4b5563" />
            </View>
            <View>
              <Text className="text-base font-medium">Privacy Policy</Text>
              <Text className="text-sm text-gray-500">Read our privacy policy</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-200">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
              <Ionicons name="information-circle" size={20} color="#4b5563" />
            </View>
            <View>
              <Text className="text-base font-medium">About</Text>
              <Text className="text-sm text-gray-500">Version 1.0.0</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Sign Out Button */}
        <View className="p-6 mb-6">
          <TouchableOpacity 
            className="bg-red-500 py-3 rounded-lg items-center"
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive' }
            ])}
          >
            <Text className="text-white font-bold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile