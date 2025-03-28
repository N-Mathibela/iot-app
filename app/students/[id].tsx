import { View, Text, ScrollView, Dimensions, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { LineChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons'
import StatCard from '../components/StatCard'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock data for demonstration
const MOCK_STUDENTS = [
  { id: '1', name: 'Sabelo', email: 'sabelo@gmail.com' },
  { id: '2', name: 'Maria', email: 'maria@gmail.com' },
  { id: '3', name: 'John', email: 'john@gmail.com' },
]

const MOCK_ALERTS = [
  { id: '1', timestamp: '2025-03-28 09:45:12', message: 'Focus dropped below 50%' },
  { id: '2', timestamp: '2025-03-28 09:32:07', message: 'High noise level detected' },
  { id: '3', timestamp: '2025-03-28 09:15:33', message: 'Poor posture detected' },
  { id: '4', timestamp: '2025-03-27 14:22:18', message: 'Focus dropped below 50%' },
]

// Mock concentration data for the line chart
const concentrationData = {
  labels: ['9:00', '9:10', '9:20', '9:30', '9:40', '9:50'],
  datasets: [
    {
      data: [65, 78, 82, 75, 60, 72],
      color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
      strokeWidth: 2
    }
  ],
  legend: ['Concentration %']
}

const StudentDetails = () => {
  const { id } = useLocalSearchParams()
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [physiologicalData, setPhysiologicalData] = useState({ heartRate: 75, postureScore: 85 })
  const [environmentalData, setEnvironmentalData] = useState({ noiseLevel: 42, lighting: 78 })

  // Simulate fetching student data
  useEffect(() => {
    // In a real app, you would fetch the student data based on the id
    const student = MOCK_STUDENTS.find(s => s.id === id) || MOCK_STUDENTS[0]
    setSelectedStudent(student)

    // Simulate live data updates
    const interval = setInterval(() => {
      // Update physiological data
      setPhysiologicalData({
        heartRate: Math.floor(70 + Math.random() * 15),
        postureScore: Math.floor(75 + Math.random() * 20)
      })

      // Update environmental data
      setEnvironmentalData({
        noiseLevel: Math.floor(35 + Math.random() * 20),
        lighting: Math.floor(70 + Math.random() * 25)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [id])

  const renderAlertItem = ({ item }) => (
    <View className="border-b border-gray-200 py-2">
      <Text className="font-semibold">{item.message}</Text>
      <Text className="text-gray-500 text-sm">{item.timestamp}</Text>
    </View>
  )

  const screenWidth = Dimensions.get('window').width - 60

  return (
    <SafeAreaView>
      <ScrollView className="bg-white p-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold mb-2 text-primary">Live Student Metrics</Text>
        <Text className="text-gray-600">Select a student to view detailed metrics</Text>
      </View>

      {/* Student Selector */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Current Student:</Text>
        <View className="flex-row items-center border-2 border-gray-400 p-4 rounded-lg">
          <Ionicons name="person-circle-outline" size={24} color="#4b5563" />
          <Text className="ml-2 text-lg font-medium">
            {selectedStudent?.name || 'Loading...'}
          </Text>
        </View>
      </View>

      {/* Concentration Graph */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Concentration Graph</Text>
        <View className="border-2 border-gray-400 p-4 rounded-lg items-center justify-center">
          <LineChart
            data={concentrationData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#2ecc71',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              alignSelf: 'center',
            }}
          />
        </View>
      </View>

      {/* Physiological Data */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Physiological Data</Text>
        <View className="flex-row justify-between">
          <StatCard title="Heart Rate" data={`${physiologicalData.heartRate} bpm`} />
          <StatCard title="Posture Score" data={`${physiologicalData.postureScore}%`} />
        </View>
      </View>

      {/* Environmental Data */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Environmental Data</Text>
        <View className="flex-row flex-wrap justify-between">
          <StatCard title="Noise Level" data={`${environmentalData.noiseLevel} dB`} />
          <StatCard title="Lighting" data={`${environmentalData.lighting}%`} />
        </View>
      </View>

      {/* Alert History */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Alert History</Text>
        <View className="border-2 border-gray-400 p-4 rounded-lg">
          <FlatList
            data={MOCK_ALERTS}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-gray-500 italic">No alerts found</Text>
            }
          />
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default StudentDetails