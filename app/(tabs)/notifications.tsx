import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

// Mock notification data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Low Concentration Alert',
    message: 'Sabelo\'s concentration dropped below 50% for more than 10 minutes.',
    timestamp: '2025-03-28 10:15',
    type: 'alert',
    read: false
  },
  {
    id: '2',
    title: 'Poor Posture Detected',
    message: 'Maria has been sitting with poor posture for the last 15 minutes.',
    timestamp: '2025-03-28 09:45',
    type: 'warning',
    read: false
  },
  {
    id: '3',
    title: 'High Noise Level',
    message: 'The classroom noise level has exceeded 65dB for more than 5 minutes.',
    timestamp: '2025-03-28 09:30',
    type: 'warning',
    read: true
  },
  {
    id: '4',
    title: 'New Student Added',
    message: 'John Doe has been added to your class.',
    timestamp: '2025-03-27 14:20',
    type: 'info',
    read: true
  },
  {
    id: '5',
    title: 'System Update',
    message: 'The concentration monitoring system has been updated to version 2.1.0.',
    timestamp: '2025-03-27 10:00',
    type: 'info',
    read: true
  },
  {
    id: '6',
    title: 'Battery Low',
    message: 'Alex\'s concentration monitoring device battery is below 15%.',
    timestamp: '2025-03-26 15:45',
    type: 'warning',
    read: true
  },
]

const Notifications = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'alerts', 'warnings', 'info'
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }
  
  const getFilteredNotifications = () => {
    switch(filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read)
      case 'alerts':
        return notifications.filter(notification => notification.type === 'alert')
      case 'warnings':
        return notifications.filter(notification => notification.type === 'warning')
      case 'info':
        return notifications.filter(notification => notification.type === 'info')
      default:
        return notifications
    }
  }
  
  const getIconForType = (type) => {
    switch(type) {
      case 'alert':
        return { name: 'alert-circle', color: '#e74c3c' }
      case 'warning':
        return { name: 'warning', color: '#f39c12' }
      case 'info':
        return { name: 'information-circle', color: '#3498db' }
      default:
        return { name: 'notifications', color: '#7f8c8d' }
    }
  }
  
  const renderNotificationItem = ({ item }) => {
    const icon = getIconForType(item.type)
    
    return (
      <TouchableOpacity 
        className={`border-2 ${item.read ? 'border-gray-300' : 'border-gray-400'} rounded-lg p-4 mb-3`}
        onPress={() => markAsRead(item.id)}
      >
        <View className="flex-row items-start">
          <View className="mr-3 mt-1">
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-bold">{item.title}</Text>
              {!item.read && (
                <View className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </View>
            <Text className="text-gray-700 mb-2">{item.message}</Text>
            <Text className="text-gray-500 text-sm">{item.timestamp}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
  
  const FilterButton = ({ label, value, icon }) => (
    <TouchableOpacity 
      className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${filter === value ? 'bg-blue-500' : 'bg-gray-200'}`}
      onPress={() => setFilter(value)}
    >
      <Ionicons name={icon} size={16} color={filter === value ? '#ffffff' : '#4b5563'} />
      <Text className={`ml-1 ${filter === value ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </TouchableOpacity>
  )
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-primary">Notifications</Text>
            <Text className="text-gray-600">{unreadCount} unread notifications</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={markAllAsRead}
            >
              <Text className="text-white font-medium">Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-4"
        >
          <FilterButton label="All" value="all" icon="apps" />
          <FilterButton label="Unread" value="unread" icon="mail-unread" />
          <FilterButton label="Alerts" value="alerts" icon="alert-circle" />
          <FilterButton label="Warnings" value="warnings" icon="warning" />
          <FilterButton label="Info" value="info" icon="information-circle" />
        </ScrollView>
        
        <FlatList
          data={getFilteredNotifications()}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Ionicons name="notifications-off" size={48} color="#cbd5e0" />
              <Text className="text-gray-500 mt-2">No notifications found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default Notifications