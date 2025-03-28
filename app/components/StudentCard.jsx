import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const StudentCard = ({ student = { id: '1', name: 'Sabelo', email: 'sabelo@gmail.com' } }) => {
  const router = useRouter()

  const handlePress = () => {
    router.push(`/students/${student.id}`)
  }

  return (
    <TouchableOpacity 
      className='border-2 border-gray-400 rounded-lg h-20 w-full p-4 mb-3'
      onPress={handlePress}
    >
      <View className='flex-row items-center'>
        <View className='mr-4'>
            <Image className='h-12 w-12 rounded-full' source={{uri:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}}/>
        </View>
        <View>
            <Text className='text-lg font-bold'>{student.name}</Text>
            <Text className='text-gray-600'>{student.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default StudentCard