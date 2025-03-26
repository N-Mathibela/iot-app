import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';

const _Layout = () => {
  return (
    <Tabs>
        <Tabs.Screen name="index" options={{title: 'Home', headerShown: false, tabBarIcon: ({focused}) => (<Ionicons name='home' size={24} color={focused ? '#000' : '#E0E0E0'} />)}} />
        <Tabs.Screen name="analytics" options={{title: 'Analytics', headerShown: false, tabBarIcon: ({focused}) => (<Ionicons name='analytics' size={24} color={focused ? '#000' : '#E0E0E0'} />)}}/>
        <Tabs.Screen name="notifications" options={{title: 'Notifications', headerShown: false, tabBarIcon: ({focused}) => (<Ionicons name='notifications-outline' size={24} color={focused ? '#000' : '#E0E0E0'} />)}}/>
        <Tabs.Screen name="profile" options={{title: 'Profile', headerShown: false, tabBarIcon: ({focused}) => (<Ionicons name='person' size={24} color={focused ? '#000' : '#E0E0E0'} />)}}/>
    </Tabs>
  )
}

export default _Layout