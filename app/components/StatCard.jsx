import { View, Text } from 'react-native'
import React from 'react'

const StatCard = (props) => {
    return (
        <View className="h-40 w-44 border-2 border-gray-400 rounded-lg m-1 p-4">
            <Text className="text-base font-bold text-primary">{props.title}</Text>
            <Text className="text-5xl font-semibold text-primary my-8">{props.data}</Text>
        </View>
    )
}

export default StatCard