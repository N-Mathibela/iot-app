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

interface SensorData {
  id: number;
  sensorId: string;
  timestamp: string;
  value: number;
  unit: string;
  type: string;
  deviceId: string;
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
        const allSensorData = response.data;
        
        // Filter for concentration data
        const concentrationData = allSensorData.filter(
          (sensor: SensorData) => sensor.type === 'concentration'
        );
        
        if (concentrationData.length > 0) {
          // Calculate average concentration
          const sum = concentrationData.reduce(
            (acc: number, sensor: SensorData) => acc + sensor.value, 0
          );
          const average = Math.round(sum / concentrationData.length);
          setAverageConcentration(average);
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
    
    // Poll for concentration updates every minute
    const interval = setInterval(fetchConcentrationData, 60000);
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
