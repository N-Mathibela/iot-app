import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import StudentCard from "../components/StudentCard";
import { learnerApi, sensorDataApi } from "../services/api";

// Define interfaces
interface Learner {
  id: number;
  name: string;
  email: string;
  deviceId?: string;
  classId?: number;
}

// Interface for MongoDB data structure - matching the student detail page
interface SensorData {
  _id?: string;
  id?: string; // Alternative ID field
  timestamp?: Date | string;
  heartRate?: number;
  noiseLevel?: number;
  movementDetected?: boolean;
}

export default function Index() {
  const [students, setStudents] = useState<Learner[]>([]);
  const [averageConcentration, setAverageConcentration] = useState<number>(75);
  const [loading, setLoading] = useState({
    students: true,
    concentration: true
  });
  const [error, setError] = useState({
    students: '',
    concentration: ''
  });

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(prev => ({ ...prev, students: true }));
        const response = await learnerApi.getAll();
        setStudents(response.data);
        setError(prev => ({ ...prev, students: '' }));
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(prev => ({ ...prev, students: 'Failed to load students' }));
        // Fallback to empty array
        setStudents([]);
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };

    fetchStudents();
  }, []);

  // Fetch concentration data
  useEffect(() => {
    const fetchConcentrationData = async () => {
      try {
        setLoading(prev => ({ ...prev, concentration: true }));
        const response = await sensorDataApi.getAll();
        let allSensorData = response.data || [];
        
        console.log('Sensor data from API:', allSensorData);
        
        if (allSensorData.length > 0) {
          // Sort by timestamp to get the latest readings first
          allSensorData = sortSensorDataByTimestamp(allSensorData);
          
          // Calculate concentration for each student based on their latest reading
          const concentrationValues = allSensorData.map(d => {
            // Get values with fallbacks
            const heartRate = typeof d.heartRate === 'number' ? d.heartRate : 75;
            const noiseLevel = typeof d.noiseLevel === 'number' ? d.noiseLevel : 42;
            const movementDetected = !!d.movementDetected;
            
            // Calculate concentration score based on multiple factors
            // Heart rate factor: optimal concentration at 70-80 bpm
            let heartRateFactor;
            if (heartRate > 90) {
              // Sharper decline for high heart rates
              heartRateFactor = Math.max(0, 100 - (heartRate - 90) * 5);
            } else if (heartRate < 60) {
              // Low heart rate also reduces concentration (drowsiness)
              heartRateFactor = Math.max(0, 100 - (60 - heartRate) * 3);
            } else {
              // Optimal range 70-80
              heartRateFactor = Math.max(0, 100 - Math.abs(heartRate - 75) * 2);
            }
            
            // Noise factor: higher noise reduces concentration more aggressively
            // Above 60dB is considered disruptive
            const noiseFactor = noiseLevel > 60 
              ? Math.max(0, 100 - (noiseLevel - 60) * 3) // Sharper decline for high noise
              : Math.max(0, 100 - noiseLevel);
            
            // Movement factor: movement indicates distraction
            const movementFactor = movementDetected ? 40 : 100; // More significant penalty for movement
            
            // Weighted average of all factors
            let concentration = (
              (heartRateFactor * 0.4) + 
              (noiseFactor * 0.3) + 
              (movementFactor * 0.3)
            );
            
            // Apply a multiplier penalty when all factors are bad
            if (heartRate > 85 && noiseLevel > 55 && movementDetected) {
              // Additional penalty when all factors are negative
              concentration *= 0.7; // 30% additional reduction
            }
            
            return Math.min(100, Math.max(0, Math.round(concentration)));
          });
          
          // Calculate average concentration across all students
          if (concentrationValues.length > 0) {
            const sum = concentrationValues.reduce((acc, val) => acc + val, 0);
            const average = Math.round(sum / concentrationValues.length);
            setAverageConcentration(average);
            console.log('Average concentration:', average);
          }
        }
        
        setError(prev => ({ ...prev, concentration: '' }));
      } catch (err) {
        console.error('Error fetching concentration data:', err);
        setError(prev => ({ ...prev, concentration: 'Failed to load concentration data' }));
        // Keep default value
      } finally {
        setLoading(prev => ({ ...prev, concentration: false }));
      }
    };

    fetchConcentrationData();
    
    // Helper function to sort sensor data by timestamp (newest first)
    function sortSensorDataByTimestamp(data: SensorData[]): SensorData[] {
      return [...data].sort((a, b) => {
        const getTime = (item: any) => {
          if (item.timestamp) {
            return typeof item.timestamp === 'string' 
              ? new Date(item.timestamp).getTime() 
              : item.timestamp instanceof Date 
                ? item.timestamp.getTime() 
                : 0;
          }
          return 0;
        };
        
        return getTime(b) - getTime(a); // Newest first
      });
    }
    
    // Poll for concentration updates every 30 seconds
    const interval = setInterval(fetchConcentrationData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="p-6">
        <View className="flex-row justify-center items-center w-full">
          <View className="h-48 w-48 border-2 border-gray-400 rounded-lg m-2 p-4">
            <Text className="text-base font-bold text-primary">Total Students</Text>
            {loading.students ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 32 }} />
            ) : error.students ? (
              <Text className="text-red-500 text-center my-8">{error.students}</Text>
            ) : (
              <Text className="text-6xl font-semibold text-primary my-8">{students.length}</Text>
            )}
          </View>
          <View className="h-48 w-48 border-2 border-gray-400 rounded-lg m-2 p-4">
            <Text className="text-base font-bold text-primary">Concentration</Text>
            {loading.concentration ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 32 }} />
            ) : error.concentration ? (
              <Text className="text-red-500 text-center my-8">{error.concentration}</Text>
            ) : (
              <Text className="text-6xl font-semibold text-green-600 my-8">{averageConcentration}%</Text>
            )}
          </View>
        </View>

        <Text className="text-xl font-bold text-left my-5">Students</Text>

        {loading.students && !students.length ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 mt-2">Loading students...</Text>
          </View>
        ) : error.students && !students.length ? (
          <View className="items-center justify-center py-10">
            <Text className="text-red-500">{error.students}</Text>
          </View>
        ) : students.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">No students found</Text>
          </View>
        ) : (
          <View>
            {students.map((student) => (
              <StudentCard key={student.id.toString()} student={student} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
