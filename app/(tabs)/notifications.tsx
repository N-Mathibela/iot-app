import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { alertApi } from '../services/api'

// Define Alert interface
interface Alert {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  type: string;
  isRead: boolean;
  deviceId?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'alerts', 'warnings', 'info'
  
  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await alertApi.getAll();
        
        // Check if we have data
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Transform API data to match our interface if needed
          const transformedAlerts = response.data.map((alert: any) => ({
            id: alert.id,
            title: alert.title || 'Alert',
            message: alert.message,
            timestamp: alert.timestamp,
            type: alert.type || 'info',
            isRead: alert.isRead || false,
            deviceId: alert.deviceId
          }));
          
          setNotifications(transformedAlerts);
          setError('');
        } else {
          console.log('No alerts found in database, using demo data');
          // Generate demo notifications since database is empty
          setNotifications(generateDemoNotifications());
          setError('');
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load notifications. Please try again.');
        // Set some fallback demo data
        setNotifications(generateDemoNotifications());
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to generate demo notifications
    const generateDemoNotifications = (): Alert[] => {
      const now = new Date();
      return [
        {
          id: 1,
          title: 'Low Concentration Alert',
          message: 'Student concentration dropped below 50% for more than 10 minutes.',
          timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 mins ago
          type: 'alert',
          isRead: false,
          deviceId: 'demo-device-1'
        },
        {
          id: 2,
          title: 'Poor Posture Detected',
          message: 'Student has been sitting with poor posture for the last 15 minutes.',
          timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), // 45 mins ago
          type: 'warning',
          isRead: false,
          deviceId: 'demo-device-2'
        },
        {
          id: 3,
          title: 'High Noise Level',
          message: 'The classroom noise level has exceeded 65dB for more than 5 minutes.',
          timestamp: new Date(now.getTime() - 90 * 60000).toISOString(), // 1.5 hours ago
          type: 'warning',
          isRead: true,
          deviceId: 'demo-device-1'
        },
        {
          id: 4,
          title: 'System Update',
          message: 'The concentration monitoring system has been updated to version 2.1.0.',
          timestamp: new Date(now.getTime() - 24 * 60 * 60000).toISOString(), // 1 day ago
          type: 'info',
          isRead: true,
          deviceId: 'system'
        },
      ];
    };
    
    fetchAlerts();
    
    // Poll for new alerts every minute
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      // Update local state immediately for responsive UI
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
      
      // In a real app, you would call the API to update each alert
      // This would be a batch update or multiple individual updates
      for (const notification of notifications.filter(n => !n.isRead)) {
        await alertApi.update(notification.id, { ...notification, isRead: true });
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Could show an error toast here
    }
  }
  
  const markAsRead = async (id: number) => {
    try {
      // Update local state immediately for responsive UI
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
      
      // Find the notification to update
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        // Call API to update the alert
        await alertApi.update(id, { ...notification, isRead: true });
      }
    } catch (err) {
      console.error(`Error marking notification ${id} as read:`, err);
      // Could show an error toast here
    }
  }
  
  const getFilteredNotifications = () => {
    switch(filter) {
      case 'unread':
        return notifications.filter(notification => !notification.isRead)
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
  
  const renderNotificationItem = ({ item }: { item: Alert }) => {
    const icon = getIconForType(item.type)
    
    return (
      <TouchableOpacity 
        className={`border-2 ${item.isRead ? 'border-gray-300' : 'border-gray-400'} rounded-lg p-4 mb-3`}
        onPress={() => markAsRead(item.id)}
      >
        <View className="flex-row items-start">
          <View className="mr-3 mt-1">
            <Ionicons name={icon.name as any} size={24} color={icon.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-bold">{item.title}</Text>
              {!item.isRead && (
                <View className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </View>
            <Text className="text-gray-700 mb-2">{item.message}</Text>
            <Text className="text-gray-500 text-sm">{new Date(item.timestamp).toLocaleString()}</Text>
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
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
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
        
        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 mt-2">Loading notifications...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-10">
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text className="text-red-500 mt-2">{error}</Text>
            <TouchableOpacity 
              className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
              onPress={() => {
                setLoading(true);
                alertApi.getAll()
                  .then(response => {
                    setNotifications(response.data);
                    setError('');
                  })
                  .catch(err => {
                    console.error('Error retrying fetch:', err);
                    setError('Failed to load notifications. Please try again.');
                  })
                  .finally(() => setLoading(false));
              }}
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getFilteredNotifications()}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Ionicons name="notifications-off" size={48} color="#cbd5e0" />
                <Text className="text-gray-500 mt-2">No notifications found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default Notifications