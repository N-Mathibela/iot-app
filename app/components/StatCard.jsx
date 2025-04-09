import { View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'

const StatCard = (props) => {
    const [highlight, setHighlight] = useState(false);
    
    // Effect to flash the card when data updates
    useEffect(() => {
        if (props.isUpdating) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [props.isUpdating, props.data]);
    
    return (
        <View className={`h-40 w-44 border-2 ${highlight ? 'border-blue-500' : 'border-gray-400'} rounded-lg m-1 p-4 relative transition-colors duration-500`}>
            <Text className="text-base font-bold text-primary">{props.title}</Text>
            <Text className="text-5xl font-semibold text-primary my-8">{props.data}</Text>
            
            {/* Updating indicator */}
            {props.isUpdating && (
                <View className="absolute top-2 right-2">
                    <ActivityIndicator size="small" color="#3b82f6" />
                </View>
            )}
            
            {/* Pulse effect when updating */}
            {highlight && (
                <View 
                    className="absolute inset-0 bg-blue-100 opacity-30 rounded-lg"
                    style={{ zIndex: -1 }}
                />
            )}
        </View>
    )
}

export default StatCard