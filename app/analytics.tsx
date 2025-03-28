import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native-gesture-handler'
import StatCard from './components/StatCard'

const Analytics = () => {
  return (
    <SafeAreaView className='p-5'>
      <ScrollView>
        <View className='flex-row justify-between items-center'>
          <StatCard title=''/>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Analytics