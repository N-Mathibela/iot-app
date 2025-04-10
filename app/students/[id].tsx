import { View, Text, ScrollView, Dimensions, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { LineChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons'
import StatCard from '../components/StatCard'
import { SafeAreaView } from 'react-native-safe-area-context'
import { sensorDataApi, learnerApi, alertApi, feedbackApi } from '../services/api'

// Define interfaces for our data types
interface Learner {
  id: number;
  name: string;
  email: string;
  deviceId?: string;
  classId?: number;
}

// Interface for MongoDB data structure
interface SensorData {
  _id?: string;
  id?: string; // Alternative ID field
  timestamp?: Date | string;
  heartRate?: number;
  noiseLevel?: number;
  movementDetected?: boolean;
}

// Interface for Feedback model
interface Feedback {
  id?: string;
  learnerId: number;
  title?: string;
  message?: string;
  timestamp?: Date | string;
}

interface Alert {
  id: number;
  timestamp: string;
  message: string;
  type: string;
  deviceId: string;
  isRead: boolean;
}

// Helper function to format time from timestamp
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const StudentDetails = () => {
  const { id } = useLocalSearchParams();
  const [selectedStudent, setSelectedStudent] = useState<Learner | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [studentAlerts, setStudentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState({
    student: true,
    sensors: true,
    alerts: true
  });
  const [error, setError] = useState({
    student: '',
    sensors: '',
    alerts: ''
  });
  
  // Derived state for different sensor types
  const [physiologicalData, setPhysiologicalData] = useState({ heartRate: 75, movementDetected: false });
  const [environmentalData, setEnvironmentalData] = useState({ noiseLevel: 42 });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Force re-render when data changes
  const [refreshKey, setRefreshKey] = useState(0);
  
  // State for alert thresholds
  const [alertThresholds, setAlertThresholds] = useState({
    heartRateHigh: 90, // Heart rate above this is concerning
    heartRateLow: 55,  // Heart rate below this is concerning
    noiseLevel: 80,    // Noise level above this is concerning
    movementDuration: 60000 // Movement detected for this many ms is concerning (60 seconds)
  });
  
  // State to track how long movement has been detected
  const [movementStartTime, setMovementStartTime] = useState<number | null>(null);
  const [concentrationData, setConcentrationData] = useState({
    labels: ['9:00', '9:10', '9:20', '9:30', '9:40', '9:50'],
    datasets: [
      {
        data: [65, 78, 82, 75, 60, 72],
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Concentration %']
  });

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(prev => ({ ...prev, student: true }));
        const response = await learnerApi.getById(Number(id));
        
        // Check if we got valid student data
        if (response.data && Object.keys(response.data).length > 0) {
          setSelectedStudent(response.data);
          setError(prev => ({ ...prev, student: '' }));
        } else {
          // No student found with this ID
          console.log('No student found with ID:', id);
          setError(prev => ({ ...prev, student: 'Student not found' }));
          
          // Fallback to mock data for demo purposes
          setSelectedStudent({
            id: Number(id),
            name: 'Demo Student',
            email: 'student@example.com',
            deviceId: `device-${id}`
          });
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(prev => ({ ...prev, student: 'Failed to load student data' }));
        
        // Fallback to mock data for demo purposes
        setSelectedStudent({
          id: Number(id),
          name: 'Demo Student',
          email: 'student@example.com',
          deviceId: `device-${id}`
        });
      } finally {
        setLoading(prev => ({ ...prev, student: false }));
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id]);

  // Fetch sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setIsUpdating(true); // Show updating indicator
        setLoading(prev => ({ ...prev, sensors: true }));
        
        const response = await sensorDataApi.getAll();
        let allSensorData = response.data || [];
        console.log('Sensor data from API:', allSensorData);
        
        // Log the structure of the first data point to help debug
        if (allSensorData.length > 0) {
          console.log('Sample data point structure:', JSON.stringify(allSensorData[0], null, 2));
        }
        
        // If we have no sensor data, use demo data
        if (allSensorData.length === 0) {
          console.log('No sensor data available, using demo data');
          // Create single demo data point for current metrics
          const demoData = [generateLatestDemoReading(selectedStudent?.deviceId || `device-${id}`)];
          setSensorData(demoData);
          updateSensorMetrics(demoData);
        } else {
          // Sort by timestamp to get the latest reading
          allSensorData = sortSensorDataByTimestamp(allSensorData);
          
          // Only keep the latest reading for display
          const latestReading = allSensorData[0];
          console.log('Latest sensor reading:', latestReading);
          
          // Set only the latest reading for current metrics
          setSensorData([latestReading]);
          updateSensorMetrics([latestReading]);
        }
        
        // Update the last updated timestamp
        setLastUpdated(new Date());
        
        // Force a re-render to ensure all UI elements update
        setRefreshKey(prev => prev + 1);
        setError(prev => ({ ...prev, sensors: '' }));
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(prev => ({ ...prev, sensors: 'Failed to load sensor data' }));
        
        // Use demo data on error
        const demoData = generateDemoSensorData(selectedStudent?.deviceId || `device-${id}`);
        setSensorData(demoData);
        updateSensorMetrics(demoData);
      } finally {
        setLoading(prev => ({ ...prev, sensors: false }));
        // Hide updating indicator after a short delay to make it visible
        setTimeout(() => setIsUpdating(false), 500);
      }
    };
    
    // Helper function to generate a single latest demo reading
    const generateLatestDemoReading = (deviceId: string): SensorData => {
      return {
        id: 'demo-latest',
        timestamp: new Date(),
        heartRate: Math.floor(65 + Math.random() * 25), // 65-90 bpm
        noiseLevel: Math.floor(30 + Math.random() * 30), // 30-60 dB
        movementDetected: Math.random() > 0.5 // 50% chance of movement
      };
    };
    
    // Helper function to generate historical demo data for the graph
    const generateHistoricalDemoData = (deviceId: string): SensorData[] => {
      const now = new Date();
      const demoData: SensorData[] = [];
      
      // Generate data points for the last 6 time periods
      for (let i = 0; i < 6; i++) {
        const time = new Date(now);
        time.setMinutes(now.getMinutes() - (i * 10)); // 10-minute intervals
        
        demoData.push({
          id: `demo-${i}`,
          timestamp: time,
          heartRate: Math.floor(70 + Math.random() * 15), // 70-85 bpm
          noiseLevel: Math.floor(35 + Math.random() * 20), // 35-55 dB
          movementDetected: Math.random() > 0.7 // 30% chance of movement
        });
      }
      
      return demoData.reverse(); // Oldest first for the graph
    };
    
    // Helper function to sort sensor data by timestamp (newest first)
    const sortSensorDataByTimestamp = (data: SensorData[]): SensorData[] => {
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
    };

    const updateSensorMetrics = (data: SensorData[]) => {
      try {
        console.log('Updating metrics with data:', data.length, 'readings');
        
        // Get the latest reading (should be the only one in the array now)
        const latestReading = data[0];
        console.log('Latest reading:', JSON.stringify(latestReading, null, 2));
        
        if (latestReading) {
          // Get heart rate with fallback - use camelCase property names
          const heartRate = typeof latestReading.heartRate === 'number' ? latestReading.heartRate : 75;
          
          // Get noise level with fallback - use camelCase property name
          const noiseLevel = typeof latestReading.noiseLevel === 'number' ? latestReading.noiseLevel : 42;
          
          // Get movement detection - use camelCase property name
          const movementDetected = !!latestReading.movementDetected;
          
          console.log(`Updating heart rate to ${heartRate}, movement to ${movementDetected}`);
          
          // Track movement duration for alerts
          if (movementDetected && movementStartTime === null) {
            // Movement just started
            setMovementStartTime(Date.now());
          } else if (!movementDetected && movementStartTime !== null) {
            // Movement just stopped
            setMovementStartTime(null);
          }
          
          setPhysiologicalData({
            heartRate: heartRate,
            movementDetected: movementDetected
          });
          
          // Check for alert conditions
          checkAndCreateAlerts({
            heartRate,
            noiseLevel: typeof latestReading.noiseLevel === 'number' ? latestReading.noiseLevel : 42,
            movementDetected,
            timestamp: latestReading.timestamp
          });
          
          // IMPORTANT: Create a direct feedback entry for testing
          // This ensures data is sent to your database regardless of alert conditions
          const learnerId = Number(id);
          const studentName = selectedStudent?.name || `Student ${id}`;
          
          // Create a test feedback entry that will show up in your database
          createFeedback({
            learnerId: learnerId,
            title: 'Sensor Update',
            message: `${studentName}'s latest reading: HR=${heartRate}bpm, Noise=${noiseLevel}dB, Movement=${movementDetected ? 'Yes' : 'No'}`
          });
          
          // Already defined noiseLevel above
          console.log(`Updating noise level to ${noiseLevel}`);
          
          // Ensure we're setting a numeric value for the noise level
          setEnvironmentalData({
            noiseLevel: noiseLevel
          });
          
          // Log the current state of environmental data for debugging
          setTimeout(() => {
            console.log('Current environmental data state:', environmentalData);
          }, 100);
          
          // For the concentration graph, we need historical data
          // Since we're only showing the latest reading for metrics,
          // generate some demo historical data for the graph
          updateConcentrationGraph(latestReading);
        }
      } catch (error) {
        console.error('Error updating sensor metrics:', error);
      }
    };
    
    // Helper function to update the concentration graph
    const updateConcentrationGraph = (latestReading: SensorData) => {
      // Generate historical data for the graph
      const historicalData = generateHistoricalDemoData(selectedStudent?.deviceId || `device-${id}`);
      
      // Add the latest reading to the end
      historicalData.push(latestReading);
      
      // Create labels from timestamps
      const labels = historicalData.map(d => {
        if (d.timestamp) {
          const date = new Date(d.timestamp);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return '';
      });
      
      // Calculate concentration based on multiple factors
      const concentrationValues = historicalData.map(d => {
        // Get values with fallbacks - use camelCase property names
        const heartRate = typeof d.heartRate === 'number' ? d.heartRate : 75;
        const noiseLevel = typeof d.noiseLevel === 'number' ? d.noiseLevel : 42;
        const movementDetected = !!d.movementDetected;
        
        // Calculate concentration score based on multiple factors
        
        // Heart rate factor: optimal concentration at 70-80 bpm
        // Higher heart rate (>90) significantly reduces concentration
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
        // This creates a compounding negative effect when everything is distracting
        if (heartRate > 85 && noiseLevel > 55 && movementDetected) {
          // Additional penalty when all factors are negative
          concentration *= 0.7; // 30% additional reduction
          console.log('All negative factors present - applying additional concentration penalty');
        }
        
        return Math.min(100, Math.max(0, Math.round(concentration)));
      });
      
      console.log('Concentration values:', concentrationValues);
      
      setConcentrationData({
        labels: labels,
        datasets: [
          {
            data: concentrationValues,
            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
            strokeWidth: 2
          }
        ],
        legend: ['Concentration %']
      });
    };

    if (selectedStudent) {
      fetchSensorData();
      
      // Set up polling for live updates - more frequent for real-time display
      const interval = setInterval(() => {
        fetchSensorData();
        
        // Check for prolonged movement
        if (movementStartTime !== null) {
          const movementDuration = Date.now() - movementStartTime;
          if (movementDuration > alertThresholds.movementDuration) {
            // Create alert for prolonged movement
            createMovementAlert(movementDuration);
            // Reset the timer to avoid creating multiple alerts
            setMovementStartTime(Date.now());
          }
        }
      }, 5000); // Poll every 5 seconds for more frequent updates
      
      return () => clearInterval(interval);
    }
  }, [selectedStudent]);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(prev => ({ ...prev, alerts: true }));
        
        const response = await alertApi.getAll();
        const allAlerts = response.data || [];
        
        // If we have no alerts, just show empty state
        if (allAlerts.length === 0) {
          console.log('No alerts available');
          setStudentAlerts([]);
        } else {
          // Filter alerts by the student's deviceId if available
          if (selectedStudent?.deviceId) {
            const filteredAlerts = allAlerts.filter((alert: Alert) => 
              alert.deviceId === selectedStudent.deviceId
            );
            
            if (filteredAlerts.length > 0) {
              setStudentAlerts(filteredAlerts);
            } else {
              // No alerts for this student
              console.log('No alerts for this student');
              setStudentAlerts([]);
            }
          } else {
            // Use all alerts if no device ID is available
            setStudentAlerts(allAlerts);
          }
        }
        
        setError(prev => ({ ...prev, alerts: '' }));
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(prev => ({ ...prev, alerts: 'Failed to load alerts' }));
        
        // Don't use demo alerts on error
        setStudentAlerts([]);
      } finally {
        setLoading(prev => ({ ...prev, alerts: false }));
      }
    };
    
    // No demo alerts - we only use real data from the API

    if (selectedStudent) {
      fetchAlerts();
    }
  }, [selectedStudent]);

  // Function to check sensor data and create alerts if needed
  // This function will also create feedback entries for the database
  const checkAndCreateAlerts = async (data: {
    heartRate: number;
    noiseLevel: number;
    movementDetected: boolean;
    timestamp?: Date | string; // Make timestamp optional to fix type error
  }) => {
    try {
      const { heartRate, noiseLevel, movementDetected } = data;
      const studentName = selectedStudent?.name || `Student ${id}`;
      const learnerId = Number(id);
      
      // Check heart rate (high)
      if (heartRate > alertThresholds.heartRateHigh) {
        await createAlert({
          learnerId,
          title: 'High Heart Rate Detected',
          message: `${studentName}'s heart rate is ${heartRate} bpm, which is above the threshold of ${alertThresholds.heartRateHigh} bpm.`,
          type: 'warning'
        });
        
        // Also create feedback
        await createFeedback({
          learnerId,
          title: 'High Heart Rate',
          message: `The student may be experiencing stress or anxiety. Consider checking in with them.`
        });
      }
      
      // Check heart rate (low)
      if (heartRate < alertThresholds.heartRateLow && heartRate > 0) { // Ignore zero readings
        await createAlert({
          learnerId,
          title: 'Low Heart Rate Detected',
          message: `${studentName}'s heart rate is ${heartRate} bpm, which is below the threshold of ${alertThresholds.heartRateLow} bpm.`,
          type: 'warning'
        });
        
        // Also create feedback
        await createFeedback({
          learnerId,
          title: 'Low Heart Rate',
          message: `The student may be tired or disengaged. Consider a short break or change of activity.`
        });
      }
      
      // Check noise level
      if (noiseLevel > alertThresholds.noiseLevel) {
        await createAlert({
          learnerId,
          title: 'High Noise Level Detected',
          message: `The noise level around ${studentName} is ${noiseLevel} dB, which is above the threshold of ${alertThresholds.noiseLevel} dB.`,
          type: 'alert'
        });
        
        // Also create feedback
        await createFeedback({
          learnerId,
          title: 'Noisy Environment',
          message: `The learning environment is too noisy. This may be affecting concentration.`
        });
      }
      
    } catch (error) {
      console.error('Error creating alerts:', error);
    }
  };
  
  // Function to create an alert for prolonged movement
  const createMovementAlert = async (duration: number) => {
    try {
      const studentName = selectedStudent?.name || `Student ${id}`;
      const learnerId = Number(id);
      const durationInSeconds = Math.floor(duration / 1000);
      
      await createAlert({
        learnerId,
        title: 'Prolonged Movement Detected',
        message: `${studentName} has been moving for ${durationInSeconds} seconds, which may indicate distraction.`,
        type: 'info'
      });
      
      // Also create feedback
      await createFeedback({
        learnerId,
        title: 'Excessive Movement',
        message: `The student has been moving frequently. They may be restless or having difficulty focusing.`
      });
      
    } catch (error) {
      console.error('Error creating movement alert:', error);
    }
  };
  
  // Function to create an alert
  const createAlert = async (alertData: {
    learnerId: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
  }) => {
    try {
      // Always create alerts and feedback - removed randomization
      // This ensures data is sent to the database
      const shouldCreateAlert = true; // Always create alerts
      
      if (shouldCreateAlert) {
        console.log('Creating alert:', alertData);
        
        // Format the alert to match the expected structure in the notifications page
        // Make sure all fields match exactly what the notifications page expects
        const alertToCreate = {
          id: Date.now(), // Provide an ID that can be used if the server doesn't generate one
          learnerId: alertData.learnerId,
          title: alertData.title,
          message: alertData.message,
          timestamp: new Date().toISOString(),
          type: alertData.type,
          isRead: false,
          deviceId: selectedStudent?.deviceId || `device-${id}`
        };
        
        // Create the alert via API
        const response = await alertApi.create(alertToCreate);
        
        console.log('Alert created:', response);
        
        // IMPORTANT: Always create feedback for each alert
        // This ensures the data appears in your Feedback database
        await createFeedback({
          learnerId: alertData.learnerId,
          title: alertData.title,
          message: alertData.message
        });
        
        // Add to local alerts immediately for a responsive UI
        const newAlert: Alert = {
          id: typeof response.data?.id === 'number' ? response.data.id : Date.now(), // Fallback to timestamp if no ID
          timestamp: alertToCreate.timestamp,
          message: alertToCreate.message,
          type: alertToCreate.type,
          deviceId: alertToCreate.deviceId,
          isRead: false
        };
        
        // Update local alerts state
        setStudentAlerts(prev => [newAlert, ...prev]);
        
        // Show a notification to the user
        console.log(`NOTIFICATION: ${alertData.title} - ${alertData.message}`);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };
  
  // Function to create feedback
  const createFeedback = async (feedbackData: {
    learnerId: number;
    title?: string;
    message: string;
  }) => {
    try {
      // Always create feedback - removed randomization
      // This ensures data is sent to your database
      const shouldCreateFeedback = true; // Always create feedback
      
      if (shouldCreateFeedback) {
        console.log('Creating feedback:', feedbackData);
        
        // Create the feedback via API with all required fields
        // IMPORTANT: Include the Comments field required by the .NET API
        const feedbackToCreate = {
          LearnerId: feedbackData.learnerId, // Capitalized to match .NET model
          Title: feedbackData.title || 'Automatic Feedback', // Capitalized
          Message: feedbackData.message, // Capitalized
          Timestamp: new Date().toISOString(), // Capitalized
          Comments: feedbackData.message // Required field based on error message
        };
        
        // Log the exact data being sent to the API
        console.log('Sending feedback data to API:', JSON.stringify(feedbackToCreate));
        
        // Create the feedback via API
        const response = await feedbackApi.create(feedbackToCreate);
        
        console.log('Feedback created response:', JSON.stringify(response));
      }
    } catch (error) {
      console.error('Error creating feedback:', error);
    }
  };

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <View className="border-b border-gray-200 py-2">
      <Text className="font-semibold">{item.message}</Text>
      <Text className="text-gray-500 text-sm">{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  )

  const screenWidth = Dimensions.get('window').width - 60

  // Show loading state if all data is loading
  if (loading.student && loading.sensors && loading.alerts) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Loading student data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView className="bg-white p-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold mb-2 text-primary">Live Student Metrics</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600">Current sensor readings</Text>
          {isUpdating && (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginRight: 8 }} />
              <Text className="text-blue-500">Updating...</Text>
            </View>
          )}
        </View>
        {lastUpdated && (
          <Text className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
        <Text className="text-xs text-blue-500 mt-1">
          Displaying only the most recent data
        </Text>
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
          <Text className="text-sm text-gray-500 mb-2 text-center">
            Calculated from heart rate, noise level, and movement data
          </Text>
          <Text className="text-xs text-gray-400 mb-1 text-center">
            Showing trend with latest reading on the right
          </Text>
          <Text className="text-xs text-gray-400 mb-1 text-center">
            Concentration decreases with high heart rate, noise, and movement
          </Text>
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
          <StatCard 
            title="Heart Rate" 
            data={`${physiologicalData.heartRate} bpm`} 
            isUpdating={isUpdating}
          />
          <StatCard 
            title="Movement" 
            data={physiologicalData.movementDetected ? 'Detected' : 'None'} 
            isUpdating={isUpdating}
          />
        </View>
      </View>

      {/* Environmental Data */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Environmental Data</Text>
        <View className="flex-row flex-wrap justify-between">
          <StatCard 
            title="Noise Level" 
            data={`${environmentalData.noiseLevel} dB`} 
            isUpdating={isUpdating}
          />
          {/* Add a debug text to verify the value is present */}
          <Text style={{ display: 'none' }}>
            Debug - Noise Level: {JSON.stringify(environmentalData)}
          </Text>
        </View>
      </View>

      {/* Alert History */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-2 text-primary">Alert History</Text>
        <View className="border-2 border-gray-400 p-4 rounded-lg">
          {loading.alerts ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : error.alerts ? (
            <Text className="text-red-500">{error.alerts}</Text>
          ) : (
            <FlatList
              data={studentAlerts}
              renderItem={renderAlertItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text className="text-gray-500 italic">No alerts found</Text>
              }
            />
          )}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default StudentDetails